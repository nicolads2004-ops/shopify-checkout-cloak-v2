import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🔄 Shopify Checkout Cloak
          </h1>
          <p className="text-xl text-gray-700 mb-4">
            Système de rotation de checkout multi-boutiques Shopify
          </p>
          <p className="text-lg text-gray-600 mb-12">
            Comme Tagada Pay - Redirigez automatiquement vos clients vers différents comptes Shopify Payments
          </p>

          <div className="grid md:grid-cols-1 gap-8 mb-12">
            <Link
              href="/dashboard"
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dashboard
              </h2>
              <p className="text-gray-600">
                Configurez votre boutique source et vos boutiques cibles
              </p>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h3>
            <div className="text-left space-y-6">
              <div className="flex items-start">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Configurez votre boutique source</h4>
                  <p className="text-gray-600">Votre boutique Shopify principale (Shop A) où les clients naviguent</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Ajoutez vos boutiques cibles</h4>
                  <p className="text-gray-600">Boutiques B, C, D... qui recevront les paiements (comptes Shopify Payments séparés)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Installez le script</h4>
                  <p className="text-gray-600">Copiez-collez le script dans votre boutique source (theme.liquid)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Rotation automatique</h4>
                  <p className="text-gray-600">Les clients sont redirigés vers différentes boutiques au checkout de façon rotative</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Fonctionnalités
            </h3>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Rotation automatique entre plusieurs comptes Shopify Payments</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>3 modes de rotation : Round-robin, Pondéré, Manuel</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Dashboard analytics : redirections réussies/échouées</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Tracking des conversions par boutique cible</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Script d'injection transparent pour les clients</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>Support illimité de boutiques cibles</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
