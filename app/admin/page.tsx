'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import StoreCard from '@/components/StoreCard'
import AddStoreForm from '@/components/AddStoreForm'
import { Store, RotationStats } from '@/lib/types'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [stats, setStats] = useState<RotationStats[]>([])
  const [rotationMode, setRotationMode] = useState<string>('round-robin')
  const [isLoading, setIsLoading] = useState(true)

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      const data = await response.json()
      if (data.success) {
        setStores(data.data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des boutiques')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/rotation/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats')
    }
  }

  const fetchRotationMode = async () => {
    try {
      const response = await fetch('/api/rotation/mode')
      const data = await response.json()
      if (data.success) {
        setRotationMode(data.data.mode)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du mode')
    }
  }

  const updateRotationMode = async (mode: string) => {
    try {
      const response = await fetch('/api/rotation/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })

      if (!response.ok) throw new Error()

      setRotationMode(mode)
      toast.success('Mode de rotation mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchStores(), fetchStats(), fetchRotationMode()])
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Admin
            </h1>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Mode de rotation
              </h2>
              <div className="flex gap-2">
                {['round-robin', 'weighted', 'manual'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateRotationMode(mode)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      rotationMode === mode
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {mode === 'round-robin'
                      ? 'Round-Robin'
                      : mode === 'weighted'
                      ? 'Pondéré'
                      : 'Manuel'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Boutiques connectées ({stores.length})
              </h2>
              <div className="space-y-4">
                <AddStoreForm onSuccess={fetchStores} />
                {stores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onUpdate={() => {
                      fetchStores()
                      fetchStats()
                    }}
                  />
                ))}
                {stores.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    Aucune boutique configurée. Ajoutez votre première boutique
                    pour commencer.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Statistiques
              </h2>
              {stats.length > 0 ? (
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {stat.storeName}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Redirections:</span>
                          <span className="font-medium">
                            {stat.totalRedirections}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversions:</span>
                          <span className="font-medium">
                            {stat.completedCheckouts}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taux:</span>
                          <span className="font-medium">
                            {stat.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenu:</span>
                          <span className="font-medium">
                            {stat.totalRevenue.toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  Aucune statistique disponible pour le moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
