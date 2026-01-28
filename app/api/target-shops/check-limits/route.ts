import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function POST() {
  try {
    const targetShops = await prisma.targetShop.findMany({
      where: { isActive: true },
      include: {
        redirectLogs: {
          where: { completed: true },
        },
      },
    })

    const updates = []

    for (const shop of targetShops) {
      const totalRevenue = shop.redirectLogs.reduce((sum, log) => sum + log.cartTotal, 0)

      await prisma.targetShop.update({
        where: { id: shop.id },
        data: { currentRevenue: totalRevenue },
      })

      if (shop.revenueLimit && totalRevenue >= shop.revenueLimit) {
        await prisma.targetShop.update({
          where: { id: shop.id },
          data: { isActive: false },
        })

        updates.push({
          shopName: shop.name,
          currentRevenue: totalRevenue,
          limit: shop.revenueLimit,
          action: 'désactivée',
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: updates.length > 0 ? 'Boutiques désactivées automatiquement' : 'Aucune limite atteinte',
        updates,
      },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
