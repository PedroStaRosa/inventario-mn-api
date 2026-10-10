import { z } from "zod";

export const createInventoryByFileSchema = z.object({
  body: z.object({
    inventoryName: z
      .string({
        message: "inventoryName: Nome do inventario é obrigatório",
      })
      .min(1, "Nome do inventario é obrigatório")
      .max(255, "Nome do inventario deve ter no máximo 255 caracteres"),
  }),
});

export const idInventorySchema = z.object({
  query: z.object({
    id: z.uuid({
      message: "ID do inventario é obrigatório e deve ser um UUID válido",
    }),
  }),
});

export const idProductInventorySchema = z.object({
  query: z.object({
    id: z.uuid({
      message: "ID do produto é obrigatório e deve ser um UUID válido",
    }),
  }),
});

export const suggestedInventorySchema = z.object({
  query: z.object({
    days: z.coerce
      .number({
        message: "days: Dias de busca é obrigatório",
      })
      .min(1, "Dias de busca deve ser maior que 0")
      .max(365, "Dias de busca deve ser menor que 366"),
    limit: z.coerce.number().default(100),
  }),
});

const inventoryProductSchema = z.object({
  productId: z
    .string({ message: "productId: Codigo do produto é obrigatório." })
    .min(1, "productId é obrigatório"),

  unitInput: z.string().optional(),

  stockExpected: z.number({
    message: "stockExpected é obrigatório",
  }),

  stockCounted: z.number({
    message: "stockCounted é obrigatório",
  }),
});

export const createInventorySchema = z.object({
  body: z.object({
    inventoryName: z
      .string({
        message: "inventoryName: Nome do inventario é obrigatório",
      })
      .min(1, "Nome do inventario é obrigatório")
      .max(255, "Nome do inventario deve ter no máximo 255 caracteres"),
    inventoryItens: z
      .array(inventoryProductSchema, {
        message: "inventoryItens: Array de Itens do inventario é obrigatório",
      })
      .min(1, "Deve conter ao menos um produto inventariado"),
  }),
});
