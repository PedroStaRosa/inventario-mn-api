import { Request, Response } from "express";
import { ListProductService } from "../services/ListProductsService";


class ListProductsController {

  async handle(req: Request, res: Response) {
    try {
      const userId = req.user_id

      const productService = new ListProductService()
      const allProducts = await productService.execute(userId)

      return res.json({
        products: allProducts,
        total_products: allProducts.length
      })
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "Erro ao listar produtos"
      });
    }


  }
}

export { ListProductsController };