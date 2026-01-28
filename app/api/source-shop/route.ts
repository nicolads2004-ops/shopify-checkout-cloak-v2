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
    const { name, shopifyDomain, accessToken } = body

    if (!name || !shopifyDomain || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis (nom, domaine, token)' },
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
        accessToken,
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

export async function DELETE() {
  try {
    const sourceShop = await prisma.sourceShop.findFirst()
    
    if (!sourceShop) {
      return NextResponse.json(
        { success: false, error: 'Aucune boutique source à supprimer' },
        { status: 404 }
      )
    }

    await prisma.sourceShop.delete({
      where: { id: sourceShop.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Boutique source supprimée',
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
