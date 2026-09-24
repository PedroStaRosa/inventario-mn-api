import { z } from "zod";

const unitSchema = ["UN", "KG", "LT", "SC", "PT"] as const;
export interface CreateProductProps {
  code: string;
  description: string;
  unit: (typeof unitSchema)[number];
}

const productSchema = z.object({
  code: z.string({ message: "code: Codigo do produto obrigatório" }),
  description: z.string({
    message: "description: Descrição do produto obrigatório",
  }),
  unit: z.enum(unitSchema, {
    error: (issue) =>
      issue.input === undefined
        ? "Unidade é obrigatória"
        : "Unidade inválida - UN, KG, LT, SC, PT",
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
      .min(1, "Deve conter ao menos um produto"),
  }),
});
