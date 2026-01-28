import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function GET() {
  try {
    const rules = await prisma.rotationRule.findMany({
      orderBy: { priority: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: rules,
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, conditions, targetShopId, priority } = body

    const rule = await prisma.rotationRule.create({
      data: {
        name,
        type,
        conditions: JSON.stringify(conditions),
        targetShopId,
        priority: priority || 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: rule,
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
