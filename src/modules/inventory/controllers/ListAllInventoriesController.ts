import { Request, Response } from "express"
import { ListAllInventoriesService } from "../services/ListAllInventoriesService"

class ListAllInventoriesController {
    async handle(req: Request, res: Response) {
        const userId = req.user_id

        const listInventoryService = new ListAllInventoriesService()

        const inventoryList = await listInventoryService.execute(userId)

        res.status(200).json(inventoryList)
    }
}

export { ListAllInventoriesController }