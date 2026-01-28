'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface AddStoreFormProps {
  onSuccess: () => void
}

export default function AddStoreForm({ onSuccess }: AddStoreFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    shopifyDomain: '',
    accessToken: '',
    weight: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout')
      }

      toast.success('Boutique ajoutée avec succès')
      setFormData({ name: '', shopifyDomain: '', accessToken: '', weight: 1 })
      setIsOpen(false)
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      >
        + Ajouter une boutique
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Ajouter une nouvelle boutique
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la boutique
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ma Boutique"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domaine Shopify
          </label>
          <input
            type="text"
            required
            value={formData.shopifyDomain}
            onChange={(e) =>
              setFormData({ ...formData, shopifyDomain: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="boutique.myshopify.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Access Token Storefront API
          </label>
          <input
            type="password"
            required
            value={formData.accessToken}
            onChange={(e) =>
              setFormData({ ...formData, accessToken: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="shpat_xxxxx"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poids (pour rotation pondérée)
          </label>
          <input
            type="number"
            min="1"
            required
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Ajout...' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
