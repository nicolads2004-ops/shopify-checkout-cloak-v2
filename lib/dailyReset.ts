import { prisma } from './prisma'

export async function checkAndResetDailyRevenue(shopId: string) {
  const shop = await prisma.targetShop.findUnique({
    where: { id: shopId },
  })

  if (!shop) return null

  const now = new Date()
  const lastReset = new Date(shop.lastResetDate)
  
  const isSameDay = 
    now.getFullYear() === lastReset.getFullYear() &&
    now.getMonth() === lastReset.getMonth() &&
    now.getDate() === lastReset.getDate()

  if (!isSameDay) {
    await prisma.targetShop.update({
      where: { id: shopId },
      data: {
        dailyRevenue: 0,
        lastResetDate: now,
      },
    })
    return { ...shop, dailyRevenue: 0, lastResetDate: now }
  }

  return shop
}

export async function resetAllDailyRevenues() {
  const shops = await prisma.targetShop.findMany()
  const now = new Date()

  for (const shop of shops) {
    const lastReset = new Date(shop.lastResetDate)
    const isSameDay = 
      now.getFullYear() === lastReset.getFullYear() &&
      now.getMonth() === lastReset.getMonth() &&
      now.getDate() === lastReset.getDate()

    if (!isSameDay) {
      await prisma.targetShop.update({
        where: { id: shop.id },
        data: {
          dailyRevenue: 0,
          lastResetDate: now,
        },
      })
    }
  }
}
