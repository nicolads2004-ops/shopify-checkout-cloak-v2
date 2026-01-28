import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const shopId = searchParams.get('shopId')
    const status = searchParams.get('status')

    const where: any = {}
    if (shopId) where.targetShopId = shopId
    if (status === 'success') where.success = true
    if (status === 'failed') where.success = false
    if (status === 'completed') where.completed = true

    const logs = await prisma.redirectLog.findMany({
      where,
      include: {
        sourceShop: true,
        targetShop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      date: log.createdAt,
      sourceShop: log.sourceShop.name,
      targetShop: log.targetShop.name,
      cartTotal: log.cartTotal,
      success: log.success,
      completed: log.completed,
      checkoutUrl: log.checkoutUrl,
      errorMessage: log.errorMessage,
      cartItems: log.cartItems,
    }))

    return NextResponse.json({
      success: true,
      data: formattedLogs,
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
