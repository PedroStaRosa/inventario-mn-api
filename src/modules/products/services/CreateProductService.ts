import prismaClient from "../../../prisma";
import { sanitizeProduct } from "../../../utils/sanitizeProducts";
import { CreateProductProps } from "../schemas/productSchema";

class CreateProductService {
  async execute(
    { code, description, unit }: CreateProductProps,
    userId: string,
  ) {
    const sanitizedProduct = sanitizeProduct({ code, description, unit });
    const existProduct = await prismaClient.product.findFirst({
      where: { code: sanitizedProduct.code, userId },
    });

    if (existProduct) {
      throw new Error("Produto já se encontra cadastrado no banco.");
    }

    const product = await prismaClient.product.create({
      data: {
        code: sanitizedProduct.code,
        description: sanitizedProduct.description,
        unit: sanitizedProduct.unit,
        userId: userId,
      },
    });

    return product;
  }
}

export { CreateProductService };
