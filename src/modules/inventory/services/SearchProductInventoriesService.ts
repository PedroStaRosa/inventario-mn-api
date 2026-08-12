import prismaClient from "../../../prisma"

class SearchProductInventoriesService {
    async execute(productId: string, userId: string) {

        const productInventories = await prismaClient.product.findFirst(
            {
                where: { id: productId, userId },
                include: {
                    inventoryItems: true
                },
            })

        if (!productInventories) {
            throw new Error("Produto não encontrado")
        }
        return productInventories

    }
}

export { SearchProductInventoriesService }