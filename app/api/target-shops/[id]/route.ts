import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, shopifyDomain, accessToken, isActive, weight } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (shopifyDomain !== undefined) updateData.shopifyDomain = shopifyDomain
    if (accessToken !== undefined) updateData.accessToken = accessToken
    if (isActive !== undefined) updateData.isActive = isActive
    if (weight !== undefined) updateData.weight = weight

    const targetShop = await prisma.targetShop.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: { ...targetShop, accessToken: '***' },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.targetShop.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Boutique cible supprimée avec succès' },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
