import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function GET() {
  try {
    const targetShops = await prisma.targetShop.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: targetShops.map(shop => ({
        ...shop,
        accessToken: '***',
      })),
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, shopifyDomain, accessToken, weight = 1 } = body

    if (!name || !shopifyDomain || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    const existingShop = await prisma.targetShop.findUnique({
      where: { shopifyDomain },
    })

    if (existingShop) {
      return NextResponse.json(
        { success: false, error: 'Cette boutique cible existe déjà' },
        { status: 400 }
      )
    }

    const targetShop = await prisma.targetShop.create({
      data: {
        name,
        shopifyDomain,
        accessToken,
        weight,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: { ...targetShop, accessToken: '***' },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
