'use client'

import { useState } from 'react'
import Link from 'next/link'
import CartButton from '@/components/CartButton'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

const DEMO_PRODUCTS = [
  {
    id: '1',
    title: 'T-Shirt Premium',
    description: 'T-shirt en coton biologique de haute qualité',
    price: 29.99,
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png',
    variantId: 'gid://shopify/ProductVariant/1',
  },
  {
    id: '2',
    title: 'Sweat à Capuche',
    description: 'Sweat confortable pour toutes les saisons',
    price: 49.99,
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png',
    variantId: 'gid://shopify/ProductVariant/2',
  },
  {
    id: '3',
    title: 'Jean Slim',
    description: 'Jean moderne avec coupe ajustée',
    price: 79.99,
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png',
    variantId: 'gid://shopify/ProductVariant/3',
  },
  {
    id: '4',
    title: 'Veste en Cuir',
    description: 'Veste élégante en cuir véritable',
    price: 199.99,
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png',
    variantId: 'gid://shopify/ProductVariant/4',
  },
  {
    id: '5',
    title: 'Baskets Sport',
    description: 'Chaussures de sport confortables',
    price: 89.99,
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png',
    variantId: 'gid://shopify/ProductVariant/5',
  },
  {
    id: '6',
    title: 'Casquette',
    description: 'Casquette ajustable style streetwear',
    price: 24.99,
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png',
    variantId: 'gid://shopify/ProductVariant/6',
  },
]

export default function ShopPage() {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (product: typeof DEMO_PRODUCTS[0]) => {
    addItem({
      variantId: product.variantId,
      quantity: 1,
      title: product.title,
      price: product.price,
      image: product.image,
    })
    toast.success(`${product.title} ajouté au panier`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Ma Boutique
            </Link>
            <CartButton />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Nos Produits
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-200 relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">
                    {product.price.toFixed(2)}€
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
