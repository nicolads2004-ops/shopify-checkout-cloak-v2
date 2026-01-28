import { NextResponse } from 'next/server'
import { rotationManager } from '@/lib/rotation'
import { handleApiError } from '@/lib/utils'

export async function GET() {
  try {
    const store = await rotationManager.getNextStore()

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Aucune boutique disponible' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        shopifyDomain: store.shopifyDomain,
      },
    })
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
