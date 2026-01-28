'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LiveRedirection {
  id: string
  date: Date
  sourceShop: string
  targetShop: string
  cartTotal: number
  success: boolean
  completed: boolean
}

export default function LivePage() {
  const [redirections, setRedirections] = useState<LiveRedirection[]>([])
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 })

  const fetchLiveData = async () => {
    try {
      const res = await fetch('/api/history?limit=20')
      const data = await res.json()
      if (data.success) {
        setRedirections(data.data)
        const success = data.data.filter((r: any) => r.success).length
        const failed = data.data.filter((r: any) => !r.success).length
        setStats({ total: data.data.length, success, failed })
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  useEffect(() => {
    fetchLiveData()
    const interval = setInterval(fetchLiveData, 3000) // Refresh toutes les 3 secondes
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-primary-400">📡 Monitoring en Direct</h1>
                <p className="text-sm text-gray-400">Redirections en temps réel • Refresh auto 3s</p>
              </div>
            </div>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total (20 dernières)</div>
            <div className="text-4xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-green-900">
            <div className="text-sm text-gray-400 mb-1">Réussies</div>
            <div className="text-4xl font-bold text-green-400">{stats.success}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-red-900">
            <div className="text-sm text-gray-400 mb-1">Échouées</div>
            <div className="text-4xl font-bold text-red-400">{stats.failed}</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">🔴 LIVE - Dernières Redirections</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">En direct</span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {redirections.map((redirect, index) => (
              <div
                key={redirect.id}
                className={`px-6 py-4 hover:bg-gray-700/50 transition ${
                  index === 0 ? 'bg-gray-700/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(redirect.date).toLocaleTimeString('fr-FR')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        redirect.success
                          ? 'bg-green-900 text-green-400'
                          : 'bg-red-900 text-red-400'
                      }`}>
                        {redirect.success ? '✓ SUCCÈS' : '✕ ÉCHEC'}
                      </span>
                      {redirect.completed && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-900 text-blue-400">
                          💰 PAYÉ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">{redirect.sourceShop}</span>
                      <span className="text-primary-400">→</span>
                      <span className="text-white font-medium">{redirect.targetShop}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-400">
                      {redirect.cartTotal.toFixed(2)}€
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {redirections.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="text-4xl mb-2">👀</div>
                <div>En attente de redirections...</div>
                <div className="text-sm mt-2">Les redirections apparaîtront ici en temps réel</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">💡 Comment ça marche ?</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-primary-400">1.</span>
              <span>Un client clique sur "Checkout" sur ta boutique source</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">2.</span>
              <span>Le script intercepte et envoie le panier à ton SaaS</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">3.</span>
              <span>Ton SaaS choisit une boutique cible (rotation)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">4.</span>
              <span>La redirection apparaît ICI en temps réel ✨</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-400">5.</span>
              <span>Le client est redirigé vers le checkout de la boutique cible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
