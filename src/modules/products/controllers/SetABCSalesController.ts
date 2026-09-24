import { Request, Response } from "express";
import { UpdateABCSalesService } from "../services/UpdateABCSalesService";

class UpdateABCSalesController {
  async handle(req: Request, res: Response) {
    try {
      const userId = req.user_id;
      const id = req.query.id as string;

      if (!id) {
        return res.status(400).json({ error: "Id do produto não enviado." });
      }

      const updateABCSalesService = new UpdateABCSalesService();
      const product = await updateABCSalesService.execute(id, userId);

      if (!product) {
        return res
          .status(404)
          .json({ error: "Produto não encontrado.", product: null });
      }
      return res.json({
        message: "ABC de venda definido com sucesso.",
        product: product,
      });
    } catch (error: any) {
      if (error instanceof Error) {
        return res.status(404).json({ error: error.message, product: null });
      }
      return res.status(500).json({
        error: error.message || "Erro ao definir ABC de venda",
      });
    }
  }
}

export default UpdateABCSalesController;
