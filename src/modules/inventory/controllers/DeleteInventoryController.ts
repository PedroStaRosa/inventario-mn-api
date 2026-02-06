import { Request, Response } from "express"
import { DeleteInventoryService } from "../services/DeleteInventoryService"

class DeleteInventoryController {
    async handle(req: Request, res: Response) {
        const userId = req.user_id
        const id = req.query.id as string

        if (!id) {
            res.status(400).json({ message: "Id do inventário não enviado." })
        }

        const deleteInventoryService = new DeleteInventoryService()

        const inventoryDeleted = await deleteInventoryService.execute(id, userId)

        res.json({ message: `Inventário ${inventoryDeleted.name} deletado com sucesso` })
    }
}

export { DeleteInventoryController }