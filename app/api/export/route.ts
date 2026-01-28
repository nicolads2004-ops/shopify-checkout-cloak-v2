import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    const logs = await prisma.redirectLog.findMany({
      include: {
        sourceShop: true,
        targetShop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (format === 'csv') {
      const csvHeader = 'Date,Boutique Source,Boutique Cible,Montant,Statut,Paiement,URL Checkout\n'
      const csvRows = logs.map((log) => {
        const date = new Date(log.createdAt).toLocaleString('fr-FR')
        const status = log.success ? 'Succès' : 'Échec'
        const payment = log.completed ? 'Finalisé' : 'En attente'
        return `"${date}","${log.sourceShop.name}","${log.targetShop.name}",${log.cartTotal},"${status}","${payment}","${log.checkoutUrl || ''}"`
      }).join('\n')

      const csv = csvHeader + csvRows

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="redirections-${Date.now()}.csv"`,
        },
      })
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: logs,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Format non supporté' },
      { status: 400 }
    )
  } catch (error) {
    const errorResponse = await handleApiError(error)
    return NextResponse.json({ success: false, ...errorResponse }, { status: 500 })
  }
}
