// Types TypeScript pour l'application

export interface Store {
  id: string
  name: string
  shopifyDomain: string
  accessToken: string
  isActive: boolean
  weight: number
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  variantId: string
  quantity: number
  title: string
  price: number
  image?: string
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface CheckoutLog {
  id: string
  storeId: string
  cartTotal: number
  cartItems: any
  redirectedAt: Date
  completed: boolean
  completedAt?: Date | null
  orderId?: string | null
}

export interface RotationStats {
  storeName: string
  totalRedirections: number
  completedCheckouts: number
  totalRevenue: number
  conversionRate: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
