import prismaClient from "../../../prisma"

interface CreateProductProps {
    code: string,
    description: string
}

class CreateProductService {
    async execute({ code, description }: CreateProductProps, userId: string) {

        const existProduct = await prismaClient.product.findFirst({ where: { code, userId } })

        if (existProduct) {
            throw new Error("Produto já se encontra cadastrado no banco.")
        }

        const product = await prismaClient.product.create({ data: { code: code, description: description, userId: userId } })

        return product

    }
}

export { CreateProductService }