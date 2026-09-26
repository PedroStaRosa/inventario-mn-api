import { Request, Response } from "express";
import { CreateManyProductsService } from "../services/CreateManyProductsService";
import { respondWithMappedError } from "../../../utils/respondWithMappedError";

class CreateManyProductsController {
  async handle(req: Request, res: Response) {
    const userId = req.user_id;
    const products = req.body.products;
    try {
      if (!products) {
        return res.status(400).json({ error: "Nenhum produto enviado." });
      }

      const productService = new CreateManyProductsService();

      const result = await productService.execute(products, userId);

      return res.json({
        created: result.created,
        total_created: result.created.length,
        skipped: result.skipped,
        total_skipped: result.skipped.length,
        errors: result.errors,
      });
    } catch (error) {
      return respondWithMappedError(
        res,
        error,
        "Falha ao importar produtos em lote",
      );
    }
  }
}

export { CreateManyProductsController };
