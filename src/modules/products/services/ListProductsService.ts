import prismaClient from "../../../prisma"

class ListProductService {
    async execute(userId: string) {
        const products = await prismaClient.product.findMany({ where: { userId: userId } })

        return products
    }
}

export { ListProductService }