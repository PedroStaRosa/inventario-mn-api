import prismaClient from "../../../prisma";

class UpdateABCSalesService {
  async execute(id: string, userId: string) {
    try {
      const product = await prismaClient.product.findUnique({
        where: { id: id, userId: userId },
      });
      if (!product) {
        throw new Error("Produto não encontrado.");
      }
      const updatedProduct = await prismaClient.product.update({
        where: { id: id, userId: userId },
        data: { isAbcSales: !product.isAbcSales },
        select: {
          id: true,
          code: true,
          description: true,
          isAbcSales: true,
        },
      });
      return updatedProduct;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export { UpdateABCSalesService };
