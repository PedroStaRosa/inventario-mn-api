import prismaClient from "../../../prisma";

class ListInventoryByIdService {
    async execute(inventoryId: string, userId: string) {
        const inventoryExists = await prismaClient.inventory.findFirst(
            {
                where: { id: inventoryId, userId: userId }
                , select: {
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

        if (!inventoryExists) {
            throw new Error("Inventário não encontrado")
        }

        return inventoryExists
    }

}

export { ListInventoryByIdService };