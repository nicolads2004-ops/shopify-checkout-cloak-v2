import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createShopifyClient } from '@/lib/shopify'
import { rotationManager } from '@/lib/rotation'
import { handleApiError } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shopId, cartItems } = body

    if (!shopId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      )
    }

    const sourceShop = await prisma.sourceShop.findUnique({
      where: { apiKey: shopId },
    })

    if (!sourceShop || !sourceShop.isActive) {
      return NextResponse.json(
        { success: false, error: 'Boutique source invalide ou inactive' },
        { status: 403 }
      )
    }

    const targetShop = await rotationManager.getNextTargetShop()

    if (!targetShop) {
      await prisma.redirectLog.create({
        data: {
          sourceShopId: sourceShop.id,
          targetShopId: 'unknown',
          cartTotal: cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
          cartItems: cartItems,
          success: false,
          errorMessage: 'Aucune boutique cible disponible',
        },
      })

      return NextResponse.json(
        { success: false, error: 'Aucune boutique cible disponible' },
        { status: 503 }
      )
    }

    const shopifyClient = createShopifyClient(targetShop.shopifyDomain, targetShop.accessToken)

    const lines = cartItems.map((item: any) => ({
      merchandiseId: `gid://shopify/ProductVariant/${item.variantId}`,
      quantity: item.quantity,
    }))

    let checkoutUrl: string
    let success = true
    let errorMessage: string | undefined

    try {
      const result = await shopifyClient.createCart(lines)
      checkoutUrl = result.checkoutUrl
    } catch (error) {
      success = false
      errorMessage = error instanceof Error ? error.message : 'Erreur Shopify API'
      checkoutUrl = `https://${targetShop.shopifyDomain}/cart`
      
      console.error('Erreur création checkout:', error)
    }

    const cartTotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    const redirectLog = await prisma.redirectLog.create({
      data: {
        sourceShopId: sourceShop.id,
        targetShopId: targetShop.id,
        cartTotal,
        cartItems: JSON.stringify(cartItems),
        success,
        errorMessage,
        checkoutUrl,
      },
    })

    if (!success) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    const shopWithLogs = await prisma.targetShop.findUnique({
      where: { id: targetShop.id },
      include: {
        redirectLogs: {
          where: { completed: true },
        },
      },
    })

    if (shopWithLogs) {
      const totalRevenue = shopWithLogs.redirectLogs.reduce((sum: number, log: any) => sum + log.cartTotal, 0)
      
      const now = new Date()
      const lastReset = new Date(shopWithLogs.lastResetDate)
      const isSameDay = 
        now.getFullYear() === lastReset.getFullYear() &&
        now.getMonth() === lastReset.getMonth() &&
        now.getDate() === lastReset.getDate()

      let dailyRevenue = isSameDay ? shopWithLogs.dailyRevenue + cartTotal : cartTotal

      await prisma.targetShop.update({
        where: { id: targetShop.id },
        data: { 
          currentRevenue: totalRevenue,
          dailyRevenue: dailyRevenue,
          lastResetDate: isSameDay ? shopWithLogs.lastResetDate : now,
        },
      })

      if (shopWithLogs.revenueLimit && dailyRevenue >= shopWithLogs.revenueLimit) {
        await prisma.targetShop.update({
          where: { id: targetShop.id },
          data: { isActive: false },
        })

        console.log(`🚨 Boutique ${targetShop.name} désactivée automatiquement - Limite quotidienne atteinte: ${dailyRevenue.toFixed(2)}€ / ${shopWithLogs.revenueLimit}€`)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl,
        targetShopName: targetShop.name,
        redirectLogId: redirectLog.id,
      },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    
    await prisma.errorLog.create({
      data: {
        type: 'cloak_redirect_error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined,
        metadata: { body: await request.json().catch(() => ({})) },
      },
    }).catch(() => {})

    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
