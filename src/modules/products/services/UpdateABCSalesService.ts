import prismaClient from "../../../prisma";
import { getLogger } from "../../../utils/logger";

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
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Produto não encontrado."
      ) {
        throw error;
      }
      getLogger().error({ err: error }, "Falha ao atualizar ABC de vendas");
      throw new Error("Erro interno ao atualizar produto.");
    }
  }
}

export { UpdateABCSalesService };
