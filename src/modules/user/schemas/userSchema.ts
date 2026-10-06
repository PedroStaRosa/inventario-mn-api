import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "O nome precisa ser um texto" })
      .min(3, { message: "O nome precisa ter no minimo 3 letras" })
      .max(255, { message: "O nome deve ter no máximo 255 caracteres" }),
    email: z
      .string({ message: "O email é obrigatório" })
      .email({ message: "Precisa ser um email valido" })
      .min(1, { message: "O email é obrigatório" })
      .max(255, { message: "O email deve ter no máximo 255 caracteres" }),
    password: z
      .string({ message: "A senha é obrigatória" })
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres" })
      .max(32, { message: "A senha deve ter no máximo 32 caracteres" })
      .regex(/[A-Z]/, {
        message: "A senha deve conter pelo menos uma letra maiúscula",
      })
      .regex(/[a-z]/, {
        message: "A senha deve conter pelo menos uma letra minúscula",
      })
      .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número" }),
  }),
});

export const authUserSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "O email é obrigatório" })
      .email({ message: "Precisa ser um email valido" })
      .min(1, { message: "O email é obrigatório" })
      .max(255, { message: "O email deve ter no máximo 255 caracteres" }),
    password: z
      .string({ message: "A senha é obrigatória" })
      .min(1, { message: "A senha é obrigatória" })
      .max(32, { message: "A senha deve ter no máximo 32 caracteres" }),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ message: "O refreshToken é obrigatório" })
      .min(1, { message: "O refreshToken é obrigatório" }),
  }),
});

export const logoutSchema = refreshTokenSchema;
