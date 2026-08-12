import { Request, Response } from "express"
import { CreateProductByFileService } from "../services/CreateProductByFileService";
import { getLogger } from "../../../utils/logger";




class CreateProductByFileController {
    async handle(req: Request, res: Response) {
        const userId = req.user_id
        const products = req.body.csvData
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Nenhum arquivo enviado." });
            }

            const productService = new CreateProductByFileService()

            const result = await productService.execute(products, userId)

            return res.json({
                created: result.created,
                total_created: result.created.length,
                skipped: result.skipped,
                total_skipped: result.skipped.length,
                errors: result.errors,
            });
        } catch (error) {
            getLogger().error({ err: error }, "Falha ao importar arquivo de produtos");
            return res.status(500).json({ error: "Falha ao importar arquivo" });
        }

    }
}

export { CreateProductByFileController }