'use client'

interface StatsChartProps {
  shopStats: any[]
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function StatsChart({ shopStats }: StatsChartProps) {
  const maxRevenue = Math.max(...shopStats.map(s => s.stats.totalRevenue), 1)
  const totalRedirections = shopStats.reduce((sum, s) => sum + s.stats.totalRedirections, 0)

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-6">📊 Chiffre d'Affaires par Boutique</h3>
        <div className="space-y-4">
          {shopStats.map((shop, index) => {
            const percentage = (shop.stats.totalRevenue / maxRevenue) * 100
            return (
              <div key={shop.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">{shop.name}</span>
                  <span className="text-sm font-bold text-primary-400">{shop.stats.totalRevenue.toFixed(2)}€</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-6">🎯 Répartition des Redirections</h3>
        <div className="grid grid-cols-2 gap-4">
          {shopStats.map((shop, index) => {
            const percentage = totalRedirections > 0 
              ? ((shop.stats.totalRedirections / totalRedirections) * 100).toFixed(1)
              : '0'
            return (
              <div
                key={shop.id}
                className="p-4 rounded-lg border-2 transition-all hover:scale-105"
                style={{ borderColor: COLORS[index % COLORS.length] }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-white">{shop.name}</span>
                </div>
                <div className="text-2xl font-bold text-white">{percentage}%</div>
                <div className="text-xs text-gray-400 mt-1">
                  {shop.stats.totalRedirections} redirections
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-6">💰 Performance Globale</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shopStats.map((shop, index) => (
            <div
              key={shop.id}
              className="p-4 rounded-lg"
              style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
            >
              <div className="text-xs text-gray-400 mb-1">{shop.name}</div>
              <div className="text-xl font-bold text-white mb-2">
                {shop.stats.totalRevenue.toFixed(2)}€
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Redirections:</span>
                  <span className="text-white font-medium">{shop.stats.totalRedirections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversion:</span>
                  <span className="text-green-400 font-medium">{shop.stats.conversionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Finalisés:</span>
                  <span className="text-white font-medium">{shop.stats.completedCheckouts}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
