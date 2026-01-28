'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface SourceShop {
  id: string
  name: string
  shopifyDomain: string
  apiKey: string
  isActive: boolean
}

interface TargetShop {
  id: string
  name: string
  shopifyDomain: string
  isActive: boolean
  weight: number
  revenueLimit?: number | null
  currentRevenue: number
  dailyRevenue: number
  lastResetDate: string
}

interface Stats {
  totalRedirections: number
  successfulRedirections: number
  failedRedirections: number
  completedCheckouts: number
  totalRevenue: number
}

export default function DashboardPage() {
  const [sourceShop, setSourceShop] = useState<SourceShop | null>(null)
  const [targetShops, setTargetShops] = useState<TargetShop[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [rotationMode, setRotationMode] = useState<string>('round-robin')
  const [isLoading, setIsLoading] = useState(true)
  const [showSourceForm, setShowSourceForm] = useState(false)
  const [showTargetForm, setShowTargetForm] = useState(false)
  const [sourceForm, setSourceForm] = useState({ name: '', shopifyDomain: '', accessToken: '' })
  const [targetForm, setTargetForm] = useState({ name: '', shopifyDomain: '', accessToken: '', weight: 1, revenueLimit: 0 })

  const fetchData = async () => {
    try {
      const [sourceRes, targetRes, statsRes, modeRes] = await Promise.all([
        fetch('/api/source-shop'),
        fetch('/api/target-shops'),
        fetch('/api/stats'),
        fetch('/api/rotation/mode'),
      ])

      const sourceData = await sourceRes.json()
      const targetData = await targetRes.json()
      const statsData = await statsRes.json()
      const modeData = await modeRes.json()

      if (sourceData.success && sourceData.data.length > 0) {
        setSourceShop(sourceData.data[0])
      }
      if (targetData.success) {
        setTargetShops(targetData.data)
      }
      if (statsData.success) {
        setStats(statsData.data.total)
      }
      if (modeData.success) {
        setRotationMode(modeData.data.mode)
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const createSourceShop = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/source-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Boutique source créée')
        setSourceShop(data.data)
        setShowSourceForm(false)
        setSourceForm({ name: '', shopifyDomain: '', accessToken: '' })
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
    }
  }

  const createTargetShop = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/target-shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Boutique cible ajoutée')
        fetchData()
        setShowTargetForm(false)
        setTargetForm({ name: '', shopifyDomain: '', accessToken: '', weight: 1, revenueLimit: 0 })
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const toggleTargetShop = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/target-shops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        toast.success(isActive ? 'Boutique désactivée' : 'Boutique activée')
        fetchData()
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const updateRotationMode = async (mode: string) => {
    try {
      const res = await fetch('/api/rotation/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      if (res.ok) {
        setRotationMode(mode)
        toast.success('Mode mis à jour')
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-primary-400">🏴‍☠️ Cloak Checkout</h1>
                <p className="text-gray-400 text-sm mt-1">Système de rotation multi-boutiques</p>
              </div>
            </div>
            <a href="/live" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              📡 Live
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="text-sm text-gray-400 mb-1">Redirections Totales</div>
              <div className="text-3xl font-bold text-white">{stats.totalRedirections}</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-green-900 p-6">
              <div className="text-sm text-gray-400 mb-1">Chiffre d'Affaires</div>
              <div className="text-3xl font-bold text-green-400">{stats.totalRevenue.toFixed(2)}€</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-green-900 p-6">
              <div className="text-sm text-gray-400 mb-1">Réussies</div>
              <div className="text-3xl font-bold text-green-400">{stats.successfulRedirections}</div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-blue-900 p-6">
              <div className="text-sm text-gray-400 mb-1">Paiements Finalisés</div>
              <div className="text-3xl font-bold text-blue-400">{stats.completedCheckouts}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-primary-400 mb-4">🏪 Boutique Source</h2>
            {sourceShop ? (
              <div>
                <div className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="font-semibold text-white">{sourceShop.name}</div>
                  <div className="text-sm text-gray-400">{sourceShop.shopifyDomain}</div>
                  <div className="text-xs text-primary-400 mt-2 font-mono">{sourceShop.apiKey}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const script = `<script>
  window.CLOAK_CONFIG = {
    apiUrl: '${window.location.origin}/api',
    shopId: '${sourceShop.apiKey}'
  };
</script>
<script src="${window.location.origin}/cloak-script.js"></script>`;
                      navigator.clipboard.writeText(script);
                      toast.success('Script copié !');
                    }}
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    📋 Copier le script
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Supprimer la boutique source ?')) {
                        const res = await fetch(`/api/source-shop`, { method: 'DELETE' });
                        if (res.ok) {
                          toast.success('Boutique supprimée');
                          fetchData();
                        }
                      }
                    }}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {!showSourceForm ? (
                  <button onClick={() => setShowSourceForm(true)} className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                    + Créer la boutique source
                  </button>
                ) : (
                  <form onSubmit={createSourceShop} className="space-y-3">
                    <input type="text" placeholder="Nom de la boutique" value={sourceForm.name} onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" required />
                    <input type="text" placeholder="boutique.myshopify.com" value={sourceForm.shopifyDomain} onChange={(e) => setSourceForm({ ...sourceForm, shopifyDomain: e.target.value })} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" required />
                    <input type="password" placeholder="Access Token Storefront API (shpss_...)" value={sourceForm.accessToken} onChange={(e) => setSourceForm({ ...sourceForm, accessToken: e.target.value })} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" required />
                    <p className="text-xs text-gray-400">💡 Créez une app sur Shopify Admin → Settings → Apps → Develop apps → Create an app → API credentials → Storefront API access token</p>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Créer</button>
                      <button type="button" onClick={() => setShowSourceForm(false)} className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Annuler</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-primary-400 mb-4">⚙️ Mode de Rotation</h2>
            <div className="grid grid-cols-3 gap-2">
              {['round-robin', 'weighted', 'manual'].map((mode) => (
                <button key={mode} onClick={() => updateRotationMode(mode)} className={`px-3 py-2 rounded-lg font-medium transition ${rotationMode === mode ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {mode === 'round-robin' ? 'Round' : mode === 'weighted' ? 'Pondéré' : 'Manuel'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-primary-400 mb-4">🎯 Boutiques Cibles ({targetShops.length})</h2>
          {!showTargetForm ? (
            <button onClick={() => setShowTargetForm(true)} className="mb-4 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
              + Ajouter une boutique cible
            </button>
          ) : (
            <form onSubmit={createTargetShop} className="mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
              <input type="text" placeholder="Nom" value={targetForm.name} onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500" required />
              <input type="text" placeholder="boutique.myshopify.com" value={targetForm.shopifyDomain} onChange={(e) => setTargetForm({ ...targetForm, shopifyDomain: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500" required />
              <input type="password" placeholder="Access Token Storefront API" value={targetForm.accessToken} onChange={(e) => setTargetForm({ ...targetForm, accessToken: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500" required />
              <input type="number" placeholder="Poids (1-10)" value={targetForm.weight} onChange={(e) => setTargetForm({ ...targetForm, weight: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500" min="1" required />
              <div>
                <label className="block text-sm text-gray-400 mb-1">💰 Limite de CA Quotidienne (€) - optionnel</label>
                <input type="number" placeholder="Ex: 5000 (0 = illimité)" value={targetForm.revenueLimit} onChange={(e) => setTargetForm({ ...targetForm, revenueLimit: parseFloat(e.target.value) })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500" min="0" step="0.01" />
                <p className="text-xs text-gray-500 mt-1">⏰ La boutique sera désactivée automatiquement si cette limite quotidienne est atteinte. Reset à minuit chaque jour.</p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Ajouter</button>
                <button type="button" onClick={() => setShowTargetForm(false)} className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600">Annuler</button>
              </div>
            </form>
          )}
          <div className="space-y-3">
            {targetShops.map((shop) => (
              <div key={shop.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-primary-600 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-white">{shop.name}</div>
                    <div className="text-sm text-gray-400">{shop.shopifyDomain}</div>
                    <div className="text-xs text-gray-500 mt-1">Poids: {shop.weight}</div>
                  </div>
                  <button onClick={() => toggleTargetShop(shop.id, shop.isActive)} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${shop.isActive ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 hover:bg-green-600' : 'bg-red-500 text-white shadow-lg shadow-red-500/50 hover:bg-red-600'}`}>
                    {shop.isActive ? '✓ ACTIVE' : '✕ INACTIVE'}
                  </button>
                </div>
                {shop.revenueLimit && shop.revenueLimit > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="text-gray-400">💰 CA du Jour</span>
                      <span className="font-bold text-primary-400">{shop.dailyRevenue.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-400">📊 Limite Quotidienne</span>
                      <span className="font-bold text-white">{shop.revenueLimit.toFixed(2)}€</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${shop.dailyRevenue >= shop.revenueLimit ? 'bg-red-500' : shop.dailyRevenue >= shop.revenueLimit * 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min((shop.dailyRevenue / shop.revenueLimit) * 100, 100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>Reset: {new Date(shop.lastResetDate).toLocaleDateString('fr-FR')}</span>
                      <span>{((shop.dailyRevenue / shop.revenueLimit) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      📈 CA Total: {shop.currentRevenue.toFixed(2)}€
                    </div>
                  </div>
                )}
              </div>
            ))}
            {targetShops.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <div>Aucune boutique cible configurée</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
