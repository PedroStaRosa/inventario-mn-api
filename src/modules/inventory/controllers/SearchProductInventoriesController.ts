import { Request, Response } from "express"
import { SearchProductInventoriesService } from "../services/SearchProductInventoriesService"

class SearchProductInventoriesController {
    async handle(req: Request, res: Response) {
        const productId = req.query.id as string
        const user_id = req.user_id

        if (!productId || !user_id) {
            res.status(400).json({ message: "Erro nos campos enviados, revise os campos productId e token" })
        }

        const inventoryService = new SearchProductInventoriesService()

        const productInventories = await inventoryService.execute(productId, user_id)

        res.status(200).json(productInventories)
    }
}

export { SearchProductInventoriesController }