import prismaClient from "../../../prisma";
import { InventoryType } from "../types/inventoryType"


class CreateInventoryService {
    async execute(data: InventoryType) {

        return prismaClient.$transaction(async (tx) => {

            const nameInventoryExists = await tx.inventory.findFirst({
                where: { name: data.name, userId: data.userId },
            });

            if (nameInventoryExists) {
                throw new Error("Inventory_Nome de inventário já se encontra cadastrado no banco.")
            }

            // 1️⃣ Cria o inventário
            const inventory = await tx.inventory.create({
                data: {
                    name: data.name,
                    userId: data.userId,
                }
            });

            // 2️⃣ Valida se todos os produtos existem e cria mapa código -> ID
            const productCodes = data.items.map(item => item.productId); // productId aqui é na verdade o código


            const products = await tx.product.findMany({
                where: { code: { in: productCodes }, userId: data.userId },
                select: { id: true, code: true },
            });

            // Cria um mapa de código para ID
            const codeToIdMap = new Map(products.map(p => [p.code, p.id]));

            // Valida se todos os produtos existem
            const missingCodes = productCodes.filter(code => !codeToIdMap.has(code));
            if (missingCodes.length > 0) {
                throw new Error(`Inventory_Produtos não encontrados: ${missingCodes.join(", ")}`);
            }

            // 3️⃣ Cria os InventoryItems usando os IDs reais dos produtos
            await tx.inventoryItem.createMany({
                data: data.items.map(item => ({
                    inventoryId: inventory.id,
                    productId: codeToIdMap.get(item.productId)!, // Converte código para ID
                    unitInput: item.unitInput || null,
                    stockExpected: item.stockExpected,
                    stockCounted: item.stockCounted,
                    difference: item.stockCounted - item.stockExpected || 0
                })),
            });

            // Atualiza a data do ultimo inventario para os produtos inventariados

            await tx.product.updateMany({
                where: {
                    code: {
                        in: productCodes,
                    },
                },
                data: {
                    lastInventory: new Date(),
                },
            })


            const inventoryWithItems = await tx.inventory.findUnique({
                where: { id: inventory.id },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    inventoryItems: {
                        select: {
                            stockExpected: true,
                            stockCounted: true,
                            difference: true,
                            product: {
                                select: {
                                    id: true,
                                    code: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            });
            // 4️⃣ Retorna sucesso
            return inventoryWithItems;
        });
    }
}

export { CreateInventoryService }