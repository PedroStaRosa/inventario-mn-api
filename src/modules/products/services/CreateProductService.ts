import prismaClient from "../../../prisma"
import { sanitizeProduct } from "../../../utils/sanitizeProducts"

interface CreateProductProps {
    code: string,
    description: string
}

class CreateProductService {
    async execute({ code, description }: CreateProductProps, userId: string) {


        const sanitizedProduct = sanitizeProduct({ code, description })
        const existProduct = await prismaClient.product.findFirst({ where: { code: sanitizedProduct.code, userId } })

        if (existProduct) {
            throw new Error("Produto já se encontra cadastrado no banco.")
        }

        const product = await prismaClient.product.create({ data: { code: sanitizedProduct.code, description: sanitizedProduct.description, userId: userId } })

        return product

    }
}

export { CreateProductService }