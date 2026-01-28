import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, generateRandomString } from '@/lib/utils'

export async function GET() {
  try {
    const sourceShops = await prisma.sourceShop.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: sourceShops,
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, shopifyDomain } = body

    if (!name || !shopifyDomain) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    const existingShop = await prisma.sourceShop.findUnique({
      where: { shopifyDomain },
    })

    if (existingShop) {
      return NextResponse.json(
        { success: false, error: 'Cette boutique source existe déjà' },
        { status: 400 }
      )
    }

    const apiKey = generateRandomString(32)

    const sourceShop = await prisma.sourceShop.create({
      data: {
        name,
        shopifyDomain,
        apiKey,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: sourceShop,
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
