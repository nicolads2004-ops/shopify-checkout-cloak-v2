import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function GET() {
  try {
    const targetShops = await prisma.targetShop.findMany({
      include: {
        redirectLogs: true,
      },
    })

    const shopStats = targetShops.map((shop) => {
      const totalRedirections = shop.redirectLogs.length
      const successfulRedirections = shop.redirectLogs.filter((log) => log.success).length
      const failedRedirections = shop.redirectLogs.filter((log) => !log.success).length
      const completedCheckouts = shop.redirectLogs.filter((log) => log.completed).length
      const totalRevenue = shop.redirectLogs
        .filter((log) => log.completed)
        .reduce((sum, log) => sum + log.cartTotal, 0)

      const conversionRate = totalRedirections > 0 
        ? ((completedCheckouts / totalRedirections) * 100).toFixed(1)
        : '0.0'

      return {
        id: shop.id,
        name: shop.name,
        shopifyDomain: shop.shopifyDomain,
        isActive: shop.isActive,
        weight: shop.weight,
        revenueLimit: shop.revenueLimit,
        currentRevenue: shop.currentRevenue,
        stats: {
          totalRedirections,
          successfulRedirections,
          failedRedirections,
          completedCheckouts,
          totalRevenue,
          conversionRate: parseFloat(conversionRate),
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: shopStats,
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
