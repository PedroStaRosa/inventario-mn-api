import { z } from "zod";

export const createProductSchema = z.object({
    body: z.object({
        code: z
            .string({ message: "code: Codigo do produto obrigatório" }),
        description: z.string({ message: "description: Descrição do produto obrigatório" })
    }),
});