import { User } from "../generated/prisma/client";
import jwt from "jsonwebtoken";

export const generateToken = (user: User): string => {
  if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRES_IN) {
    throw new Error("JWT_SECRET_KEY e JWT_EXPIRES_IN são obrigatórias");
  }

  const expiresIn = Number(process.env.JWT_EXPIRES_IN);
  if (!Number.isInteger(expiresIn) || expiresIn <= 0) {
    throw new Error("JWT_EXPIRES_IN deve ser um inteiro positivo em segundos");
  }

  return jwt.sign(
    {
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET_KEY as string,
    {
      algorithm: "HS256",
      subject: String(user.id),
      expiresIn,
    },
  );
};
