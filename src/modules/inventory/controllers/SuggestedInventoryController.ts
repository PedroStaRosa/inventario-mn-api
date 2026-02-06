import { suggestedInventorySchema } from "../schemas/inventorySchema";
import { SuggestedInventoryService } from "../services/SuggestedInventoryService"
import { Request, Response } from "express"
class SuggestedInventoryController {
    async handle(req: Request, res: Response) {
        const userId = req.user_id

        const parsed = suggestedInventorySchema.parse({
            query: req.query,
        });

        const { days, limit } = parsed.query;

        if (!days) {
            return res.status(400).json({ error: "Dias não enviado." })
        }

        const suggestedInventoryService = new SuggestedInventoryService()
        const suggestedInventory = await suggestedInventoryService.execute(userId, Number(days), Number(limit))
        res.json({ products: suggestedInventory, total: suggestedInventory.length })
    }
}

export { SuggestedInventoryController }