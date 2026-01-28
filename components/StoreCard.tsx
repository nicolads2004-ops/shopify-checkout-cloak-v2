'use client'

import { Store } from '@/lib/types'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface StoreCardProps {
  store: Store
  onUpdate: () => void
}

export default function StoreCard({ store, onUpdate }: StoreCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const toggleActive = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !store.isActive }),
      })

      if (!response.ok) throw new Error('Erreur lors de la mise à jour')

      toast.success(
        store.isActive ? 'Boutique désactivée' : 'Boutique activée'
      )
      onUpdate()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteStore = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erreur lors de la suppression')

      toast.success('Boutique supprimée')
      onUpdate()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
          <p className="text-sm text-gray-600">{store.shopifyDomain}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            store.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {store.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Poids:</span> {store.weight}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Créée le:</span>{' '}
          {new Date(store.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggleActive}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            store.isActive
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } disabled:opacity-50`}
        >
          {store.isActive ? 'Désactiver' : 'Activer'}
        </button>
        <button
          onClick={deleteStore}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
