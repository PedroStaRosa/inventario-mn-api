import { Request, Response } from "express";
import { ListProductService } from "../services/ListProductsService";
import { respondWithMappedError } from "../../../utils/respondWithMappedError";

class ListProductsController {
  async handle(req: Request, res: Response) {
    try {
      const userId = req.user_id;

      const productService = new ListProductService();
      const allProducts = await productService.execute(userId);

      return res.json({
        products: allProducts,
        total_products: allProducts.length,
      });
    } catch (error) {
      return respondWithMappedError(res, error, "Falha ao listar produtos");
    }
  }
}

export { ListProductsController };
