import { NextRequest, NextResponse } from 'next/server'
import { rotationManager } from '@/lib/rotation'
import { handleApiError } from '@/lib/utils'

export async function GET() {
  try {
    const mode = await rotationManager.getRotationMode()

    return NextResponse.json({
      success: true,
      data: { mode },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode } = body

    if (!['round-robin', 'manual', 'weighted'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Mode de rotation invalide' },
        { status: 400 }
      )
    }

    await rotationManager.setRotationMode(mode)

    return NextResponse.json({
      success: true,
      data: { mode },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
