import { Request, Response } from "express";
import { CreateProductService } from "../services/CreateProductService";
import { respondWithMappedError } from "../../../utils/respondWithMappedError";

class CreateProductController {
  async handle(req: Request, res: Response) {
    try {
      const userId = req.user_id;
      const { code, description, unit } = req.body;

      const productService = new CreateProductService();

      const product = await productService.execute(
        { code, description, unit },
        userId,
      );

      res.status(201).json(product);
    } catch (error) {
      return respondWithMappedError(res, error, "Falha ao criar produto");
    }
  }
}

export { CreateProductController };
