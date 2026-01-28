import { prisma } from './prisma'

export type RotationMode = 'round-robin' | 'manual' | 'weighted'

interface Store {
  id: string
  name: string
  shopifyDomain: string
  accessToken: string
  isActive: boolean
  weight: number
}

export class RotationManager {
  async getNextTargetShop(): Promise<Store | null> {
    const rotation = await this.getOrCreateRotation()
    const stores = await prisma.targetShop.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    if (stores.length === 0) {
      throw new Error('Aucune boutique cible active disponible')
    }

    let selectedStore: Store

    switch (rotation.mode) {
      case 'round-robin':
        selectedStore = await this.roundRobinSelection(stores, rotation.currentIndex)
        break
      case 'weighted':
        selectedStore = await this.weightedSelection(stores)
        break
      case 'manual':
        selectedStore = stores[0]
        break
      default:
        selectedStore = stores[0]
    }

    return selectedStore
  }

  async getNextStore(): Promise<Store | null> {
    return this.getNextTargetShop()
  }

  private async roundRobinSelection(stores: Store[], currentIndex: number): Promise<Store> {
    const nextIndex = currentIndex % stores.length
    const selectedStore = stores[nextIndex]

    await prisma.rotation.updateMany({
      data: {
        currentIndex: nextIndex + 1,
      },
    })

    return selectedStore
  }

  private async weightedSelection(stores: Store[]): Promise<Store> {
    const totalWeight = stores.reduce((sum, store) => sum + store.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const store of stores) {
      random -= store.weight
      if (random <= 0) {
        return store
      }
    }

    return stores[0]
  }

  async getRotationMode(): Promise<RotationMode> {
    const rotation = await this.getOrCreateRotation()
    return rotation.mode as RotationMode
  }

  async setRotationMode(mode: RotationMode): Promise<void> {
    await prisma.rotation.updateMany({
      data: { mode },
    })
  }

  async resetRotation(): Promise<void> {
    await prisma.rotation.updateMany({
      data: { currentIndex: 0 },
    })
  }

  private async getOrCreateRotation() {
    let rotation = await prisma.rotation.findFirst()

    if (!rotation) {
      rotation = await prisma.rotation.create({
        data: {
          currentIndex: 0,
          mode: 'round-robin',
        },
      })
    }

    return rotation
  }

  async getRotationStats(startDate?: Date, endDate?: Date) {
    const where: any = {}

    if (startDate || endDate) {
      where.redirectedAt = {}
      if (startDate) where.redirectedAt.gte = startDate
      if (endDate) where.redirectedAt.lte = endDate
    }

    const logs = await prisma.checkoutLog.findMany({
      where,
      include: {
        store: true,
      },
    })

    const statsByStore = logs.reduce((acc, log) => {
      const storeId = log.storeId
      if (!acc[storeId]) {
        acc[storeId] = {
          storeName: log.store.name,
          totalRedirections: 0,
          completedCheckouts: 0,
          totalRevenue: 0,
          conversionRate: 0,
        }
      }

      acc[storeId].totalRedirections++
      if (log.completed) {
        acc[storeId].completedCheckouts++
        acc[storeId].totalRevenue += log.cartTotal
      }

      return acc
    }, {} as Record<string, any>)

    Object.keys(statsByStore).forEach(storeId => {
      const stats = statsByStore[storeId]
      stats.conversionRate = stats.totalRedirections > 0
        ? (stats.completedCheckouts / stats.totalRedirections) * 100
        : 0
    })

    return Object.values(statsByStore)
  }
}

export const rotationManager = new RotationManager()
