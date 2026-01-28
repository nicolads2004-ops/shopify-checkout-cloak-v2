import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: stores.map(store => ({
        ...store,
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

    const existingStore = await prisma.store.findUnique({
      where: { shopifyDomain },
    })

    if (existingStore) {
      return NextResponse.json(
        { success: false, error: 'Cette boutique existe déjà' },
        { status: 400 }
      )
    }

    const store = await prisma.store.create({
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
      data: { ...store, accessToken: '***' },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
