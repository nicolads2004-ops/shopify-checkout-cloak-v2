'use client'

import { useState, useEffect } from 'react'

export default function HistoryTable() {
  const [history, setHistory] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [filter])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const url = filter === 'all' 
        ? '/api/history?limit=50'
        : `/api/history?limit=50&status=${filter}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setHistory(data.data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportCSV = () => {
    window.open('/api/export?format=csv', '_blank')
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">📜 Historique des Redirections</h3>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          📥 Exporter CSV
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'success', 'failed', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'success' ? 'Succès' : f === 'failed' ? 'Échecs' : 'Finalisés'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-2 text-gray-400 font-medium">Boutique Cible</th>
                <th className="text-right py-3 px-2 text-gray-400 font-medium">Montant</th>
                <th className="text-center py-3 px-2 text-gray-400 font-medium">Statut</th>
                <th className="text-center py-3 px-2 text-gray-400 font-medium">Paiement</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-2 text-gray-300">
                    {new Date(log.date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-2 text-white font-medium">{log.targetShop}</td>
                  <td className="py-3 px-2 text-right text-primary-400 font-bold">
                    {log.cartTotal.toFixed(2)}€
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        log.success
                          ? 'bg-green-900 text-green-400'
                          : 'bg-red-900 text-red-400'
                      }`}
                    >
                      {log.success ? '✓' : '✕'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        log.completed
                          ? 'bg-green-900 text-green-400'
                          : 'bg-yellow-900 text-yellow-400'
                      }`}
                    >
                      {log.completed ? 'Finalisé' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="text-center py-8 text-gray-500">Aucune redirection trouvée</div>
          )}
        </div>
      )}
    </div>
  )
}
