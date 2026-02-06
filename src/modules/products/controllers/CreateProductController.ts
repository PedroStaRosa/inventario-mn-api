import { Request, Response } from "express"
import { CreateProductService } from "../services/CreateProductService"


class CreateProductController {
    async handle(req: Request, res: Response) {
        try {
            const userId = req.user_id
            const { code, description } = req.body

            const productService = new CreateProductService()

            const product = await productService.execute({ code, description }, userId)

            res.status(201).json(product)
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                error: error.message || "Erro ao criar produto"
            });
        }

    }
}

export { CreateProductController }