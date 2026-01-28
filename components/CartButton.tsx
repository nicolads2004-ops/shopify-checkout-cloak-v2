'use client'

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'

export default function CartButton() {
  const itemCount = useCartStore((state) => state.getItemCount())

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
    >
      <span className="mr-2">🛒</span>
      Panier
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  )
}
