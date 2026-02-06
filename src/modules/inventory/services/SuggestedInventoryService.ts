import prismaClient from "../../../prisma"

class SuggestedInventoryService {
    async execute(userId: string, days: number, limit: number) {

        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - days);

        // total de registros que atendem o filtro
        const total = await prismaClient.product.count({
            where: {
                userId,
                OR: [
                    { lastInventory: { lt: limitDate } },
                    { lastInventory: null },
                ],
            },
        });

        /* const skip = Math.max(0, Math.floor(Math.random() * Math.max(total - 10, 0))); */
        const randomSkip = Math.floor(Math.random() * Math.max(0, total - limit));

        const products = await prismaClient.product.findMany({
            where: {
                userId,
                OR: [
                    { lastInventory: { lt: limitDate } },
                    { lastInventory: null },
                ],
            },
            skip: randomSkip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        })

        return products


    }
}

export { SuggestedInventoryService }