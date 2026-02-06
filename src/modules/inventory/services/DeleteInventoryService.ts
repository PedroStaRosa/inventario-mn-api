import prismaClient from "../../../prisma"

class DeleteInventoryService {
    async execute(inventoryId: string, userId: string) {
        const inventoryExists = await prismaClient.inventory.findFirst({ where: { id: inventoryId, userId: userId } })

        if (!inventoryExists) {
            throw new Error("Inventario não encontrado")
        }
        /* 
                if (inventoryExists.userId != userId) {
                    throw new Error("Usuario sem permissão para excluir inventario.")
                } */

        const inventoryDeleted = await prismaClient.inventory.delete({ where: { id: inventoryId } })

        return inventoryDeleted
    }
}

export { DeleteInventoryService }