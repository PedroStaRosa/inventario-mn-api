import { z } from "zod";

const unitSchema = ["UN", "KG", "LT", "SC", "PT", "CX"] as const;
export interface CreateProductProps {
  code: string;
  description: string;
  unit: (typeof unitSchema)[number];
}

const productSchema = z.object({
  code: z
    .string({ message: "code: Codigo do produto obrigatório" })
    .min(1, "Codigo do produto é obrigatório")
    .max(255, "Codigo do produto deve ter no máximo 255 caracteres"),
  description: z
    .string({
      message: "description: Descrição do produto obrigatório",
    })
    .min(1, "Descrição do produto é obrigatória")
    .max(255, "Descrição do produto deve ter no máximo 255 caracteres"),
  unit: z.enum(unitSchema, {
    error: (issue) =>
      issue.input === undefined
        ? "Unidade é obrigatória"
        : "Unidade inválida - UN, KG, LT, SC, PT, CX",
  }),
});

export const createProductSchema = z.object({
  body: productSchema,
});

export const createManyProductsSchema = z.object({
  body: z.object({
    products: z
      .array(productSchema, {
        message: "products: Array de produtos obrigatório",
      })
      .min(1, "Deve conter ao menos um produto")
      .max(1000, "Deve conter no máximo 1000 produtos"),
  }),
});

export const updateABCSalesSchema = z.object({
  query: z.object({
    id: z.uuid({
      message: "ID do produto obrigatório e deve ser um UUID válido",
    }),
  }),
});
