import prismaClient from "../../../prisma";

/* type GetDashboardParams = {
  days: number;
  recentInventoriesLimit: number;
  recentProductsLimit: number;
}; */

class GetDashboardService {
  async execute(userId: string /* params: GetDashboardParams */) {
    /*  const { days, recentInventoriesLimit, recentProductsLimit } = params; */
    const days = 30;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - days);
    // Calcula o plusLimitDate: 60 dias atrás de hoje, mas até 30 dias atrás
    const plusLimitDate = new Date();
    plusLimitDate.setDate(plusLimitDate.getDate() - days * 2);

    const [
      productsTotal,
      inventoriesTotal,
      inventoriesLastDays,
      productsNeverInventoried,
      productsInventoriedLastDays,
      recentInventories,
      recentlyInventoriedProducts,
      comparativeDifferenceBylimitDate,
    ] = await Promise.all([
      // productsTotal
      // Pesquisa a quantidade total de produtos cadastrados pelo usuário
      // Retorna um número inteiro
      prismaClient.product.count({
        where: { userId },
      }),
      // inventoriesTotal
      // Pesquisa a quantidade total de inventários realizados pelo usuário
      // Retorna um número inteiro
      prismaClient.inventory.count({
        where: { userId },
      }),
      // inventoriesLastDays
      // Pesquisa a quantidade de inventários realizados nos últimos X dias
      // Retorna um número inteiro
      prismaClient.inventory.count({
        where: {
          userId,
          createdAt: { gte: limitDate },
        },
      }),
      // productsNeverInventoried
      // Pesquisa quantos produtos nunca passaram por inventário
      // Retorna um número inteiro
      prismaClient.product.count({
        where: {
          userId,
          lastInventory: null,
        },
      }),
      // productsInventoriedLastDays
      // Pesquisa quantos produtos foram inventariados nos últimos X dias
      // Retorna um número inteiro
      prismaClient.product.count({
        where: {
          userId,
          lastInventory: { gte: limitDate },
        },
      }),
      // recentInventories
      // Pesquisa os inventários recentes do usuário nos últimos X dias
      // Retorna um array de objetos com informações dos inventários
      prismaClient.inventory.findMany({
        where: { userId, createdAt: { gte: limitDate } },
        orderBy: { createdAt: "desc" },
        /* take: recentInventoriesLimit, */
        select: {
          id: true,
          name: true,
          createdAt: true,
          inventoryItems: {
            select: {
              difference: true,
            },
          },
          _count: {
            select: { inventoryItems: true },
          },
        },
      }),
      // recentlyInventoriedProducts
      // Pesquisa os produtos que foram inventariados recentemente (nos últimos X dias)
      // Retorna um array de objetos com informações dos produtos
      prismaClient.product.findMany({
        where: {
          userId,
          lastInventory: { not: null, gte: limitDate },
        },
        orderBy: { lastInventory: "desc" },
        /*         take: recentProductsLimit, */
        select: {
          id: true,
          code: true,
          description: true,
          unit: true,
          lastInventory: true,
        },
      }),
      // comparativeDifferenceBylimitDate
      // Pesquisa a diferença comparativa entre os inventários realizados no ultimo periodo
      // Retorna um array de objetos com informações dos produtos
      prismaClient.inventory.findMany({
        where: {
          userId,
          createdAt: { gte: plusLimitDate, lte: limitDate },
        },
        orderBy: { createdAt: "desc" },
        select: {
          _count: { select: { inventoryItems: true } },
          id: true,
          name: true,
          createdAt: true,
          inventoryItems: { select: { difference: true } },
        },
      }),
    ]);

    const currentPeriod = {
      totalInventories: recentInventories.length,
      totalItems: recentInventories.reduce(
        (acc, inventory) => acc + inventory._count.inventoryItems,
        0,
      ),
      totalDifference: recentInventories.reduce(
        (acc, inventory) =>
          acc +
          inventory.inventoryItems.reduce(
            (acc, item) => acc + Math.abs(Number(item.difference)),
            0,
          ),
        0,
      ),
    };

    const previousPeriod = {
      totalInventories: comparativeDifferenceBylimitDate.length,
      totalItems: comparativeDifferenceBylimitDate.reduce(
        (acc, inventory) => acc + inventory._count.inventoryItems,
        0,
      ),
      totalDifference: comparativeDifferenceBylimitDate.reduce(
        (acc, inventory) =>
          acc +
          inventory.inventoryItems.reduce(
            (acc, item) => acc + Math.abs(Number(item.difference)),
            0,
          ),
        0,
      ),
    };

    return {
      period: {
        days,
        current: { from: limitDate, to: new Date().toISOString() },
        previous: { from: plusLimitDate, to: limitDate },
        /* from: limitDate.toISOString(),
        to: new Date().toISOString(),
        plusTo: plusLimitDate.toISOString(), */
      },
      totals: {
        products: productsTotal,
        inventories: inventoriesTotal,
        inventoriesLastDays,
        productsNeverInventoried,
        productsInventoriedLastDays,
      },

      /* recentInventories: recentInventories.map((inventory) => ({
        id: inventory.id,
        name: inventory.name,
        createdAt: inventory.createdAt,
        itemsCount: inventory._count.inventoryItems,
        difference: inventory.inventoryItems.reduce(
          (acc, item) => acc + Math.abs(Number(item.difference)),
          0,
        ),
      })), */
      recentlyInventoriedProducts,
      currentPeriod,
      previousPeriod,
    };
  }
}

export { GetDashboardService };
