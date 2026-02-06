import { Request, Response } from "express"
import { CreateInventoryService } from "../services/CreateInventoryService";
import { InventoryType } from "../types/inventoryType";
class CreateInventoryByFileController {
    async handle(req: Request, res: Response) {
        const userId = req.user_id
        const inventoryProducts = req.body.csvData
        const inventoryName = req.body.inventoryName
        /* try { */
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado." });
        }

        const newInventory: InventoryType = {
            items: inventoryProducts,
            name: inventoryName,
            userId
        }

        const inventoryService = new CreateInventoryService()

        const inventory = await inventoryService.execute(newInventory)

        res.json({ data: inventory, total_itens: inventory?.inventoryItems.length })

    }
}

export { CreateInventoryByFileController }