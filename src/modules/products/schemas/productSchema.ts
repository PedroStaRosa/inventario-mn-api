import { z } from "zod";

const productSchema = z.object({
    code: z.string({ message: "code: Codigo do produto obrigatório" }),
    description: z.string({ message: "description: Descrição do produto obrigatório" })
});

export const createProductSchema = z.object({
    body: productSchema,
});

export const createManyProductsSchema = z.object({
    body: z.object({
        products: z.array(productSchema,
            { message: "products: Array de produtos obrigatório" }).min(1, "Deve conter ao menos um produto")
    }),
});