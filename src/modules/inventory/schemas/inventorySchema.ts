import { z } from "zod";

export const createInventoryByFileSchema = z.object({
    body: z.object({
        inventoryName: z.string({ message: "inventoryName: Nome do inventario é obrigatório" })
    }),
});

export const idInventorySchema = z.object({
    query: z.object({
        id: z.string({ message: "id: Id do inventario é obrigatório" })
    })
})

export const idProductInventorySchema = z.object({
    query: z.object({
        id: z.string({ message: "id: Id do produto é obrigatório" })
    })
})

export const suggestedInventorySchema = z.object({
    query: z.object({
        days: z.coerce.number({
            message: "days: Dias de busca é obrigatório",
        }),
        limit: z.coerce.number().default(100),
    }),
});

const inventoryProductSchema = z.object({
    productId: z.string({ message: "productId: Codigo do produto é obrigatório." }).min(1, "productId é obrigatório"),

    unitInput: z.string().optional(),

    stockExpected: z.number({
        message: "stockExpected é obrigatório",
    }),

    stockCounted: z.number({
        message: "stockCounted é obrigatório",
    })
});


export const createInventorySchema = z.object({
    body: z.object({
        inventoryName: z.string({ message: "inventoryName: Nome do inventario é obrigatório" }),
        inventoryItens: z.array(inventoryProductSchema, { message: "inventoryItens: Array de Itens do inventario é obrigatório" }).min(1, "Deve conter ao menos um produto inventariado")
    })
})