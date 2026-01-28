import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate || endDate) {
      where.redirectedAt = {}
      if (startDate) where.redirectedAt.gte = new Date(startDate)
      if (endDate) where.redirectedAt.lte = new Date(endDate)
    }

    const logs = await prisma.redirectLog.findMany({
      where,
      include: {
        targetShop: true,
      },
    })

    const statsByShop = logs.reduce((acc: any, log: any) => {
      const shopId = log.targetShopId
      if (!acc[shopId]) {
        acc[shopId] = {
          shopName: log.targetShop.name,
          shopDomain: log.targetShop.shopifyDomain,
          totalRedirections: 0,
          successfulRedirections: 0,
          failedRedirections: 0,
          completedCheckouts: 0,
          totalRevenue: 0,
          conversionRate: 0,
        }
      }

      acc[shopId].totalRedirections++
      
      if (log.success) {
        acc[shopId].successfulRedirections++
      } else {
        acc[shopId].failedRedirections++
      }

      if (log.completed) {
        acc[shopId].completedCheckouts++
        acc[shopId].totalRevenue += log.cartTotal
      }

      return acc
    }, {})

    Object.keys(statsByShop).forEach(shopId => {
      const stats = statsByShop[shopId]
      stats.conversionRate = stats.successfulRedirections > 0
        ? (stats.completedCheckouts / stats.successfulRedirections) * 100
        : 0
    })

    const totalStats = {
      totalRedirections: logs.length,
      successfulRedirections: logs.filter(l => l.success).length,
      failedRedirections: logs.filter(l => !l.success).length,
      completedCheckouts: logs.filter(l => l.completed).length,
      totalRevenue: logs.filter(l => l.completed).reduce((sum, l) => sum + l.cartTotal, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        byShop: Object.values(statsByShop),
        total: totalStats,
      },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
