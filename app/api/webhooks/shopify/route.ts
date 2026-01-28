import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const topic = request.headers.get('X-Shopify-Topic')

    if (topic === 'orders/create') {
      const orderId = body.id?.toString()
      const checkoutToken = body.checkout_token

      if (orderId && checkoutToken) {
        const checkoutLog = await prisma.checkoutLog.findFirst({
          where: {
            orderId: null,
            completed: false,
          },
          orderBy: {
            redirectedAt: 'desc',
          },
        })

        if (checkoutLog) {
          await prisma.checkoutLog.update({
            where: { id: checkoutLog.id },
            data: {
              completed: true,
              completedAt: new Date(),
              orderId,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
