import { Request, Response } from "express"
import { ListInventoryByIdService } from "../services/ListInventoryByIdService"

class ListInventaryByIdController {
    async handle(req: Request, res: Response) {
        const id = req.query.id as string
        const userId = req.user_id

        if (!id) {
            return res.status(400).json({ error: "Id do inventário não enviado." })
        }

        const listInventoryByIdService = new ListInventoryByIdService()
        const inventory = await listInventoryByIdService.execute(id, userId)
        res.json(inventory)
    }
}

export { ListInventaryByIdController };