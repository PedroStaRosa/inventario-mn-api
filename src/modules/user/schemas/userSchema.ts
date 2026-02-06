import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "O nome precisa ser um texto" })
      .min(3, { message: "O nome precisa ter no minimo 3 letras" }),
    email: z.string({ message: "O email é obrigatório" }).email({ message: "Precisa ser um email valido" }),
    password: z
      .string({ message: "A senha é obrigatória" })
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres" })
      .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula" })
      .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula" })
      .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número" })
  }),
});

export const authUserSchema = z.object({
  body: z.object({
    email: z.string({ message: "O email é obrigatório" }).email({ message: "Precisa ser um email valido" }),
    password: z
      .string({ message: "A senha é obrigatória" })
      .min(1, { message: "A senha é obrigatória" }),
  }),
});
