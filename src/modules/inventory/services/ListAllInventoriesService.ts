import prismaClient from "../../../prisma"

class ListAllInventoriesService {
    async execute(userId: string) {
        const listInventory = await prismaClient.inventory.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                inventoryItems: {
                    select: {
                        stockExpected: true,
                        stockCounted: true,
                        difference: true,
                        product: {
                            select: {
                                id: true,
                                code: true,
                                description: true,
                            },
                        },
                    },
                },
            }
        })

        return listInventory
    }
}

export { ListAllInventoriesService }