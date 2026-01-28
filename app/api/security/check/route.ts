import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

const RATE_LIMIT = 10
const TIME_WINDOW = 3600000

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ipAddress, action } = body

    const recentLogs = await prisma.securityLog.findMany({
      where: {
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - TIME_WINDOW),
        },
      },
    })

    const isBlocked = recentLogs.some((log) => log.blocked)
    const requestCount = recentLogs.length

    if (isBlocked) {
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: 'IP bloquée pour activité suspecte',
      })
    }

    if (requestCount >= RATE_LIMIT) {
      await prisma.securityLog.create({
        data: {
          ipAddress,
          action,
          blocked: true,
          reason: `Rate limit dépassé: ${requestCount} requêtes en 1h`,
        },
      })

      return NextResponse.json({
        success: false,
        blocked: true,
        reason: 'Trop de requêtes. Veuillez réessayer plus tard.',
      })
    }

    await prisma.securityLog.create({
      data: {
        ipAddress,
        action,
        blocked: false,
      },
    })

    return NextResponse.json({
      success: true,
      blocked: false,
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
