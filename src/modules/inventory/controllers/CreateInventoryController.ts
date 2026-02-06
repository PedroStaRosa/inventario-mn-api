import { Request, Response } from "express"
import { CreateInventoryService } from "../services/CreateInventoryService"
import { InventoryType } from "../types/inventoryType"

class CreateInventoryController {
    async handle(req: Request, res: Response) {

        const userId = req.user_id
        const { inventoryName, inventoryItens } = req.body

        const data: InventoryType = {
            userId,
            name: inventoryName,
            items: inventoryItens
        }
        const inventoryService = new CreateInventoryService()

        const newInventory = await inventoryService.execute(data)

        res.json({
            newInventory
        })
    }
}

export { CreateInventoryController }