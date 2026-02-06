import { User } from "../generated/prisma/client";
import jwt from "jsonwebtoken"

export const generateToken = (user: User): string => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY é obrigatória");
    }
    const token = jwt.sign(
        {
            name: user.name,
            email: user.email,
        },
        process.env.JWT_SECRET_KEY as string,
        {
            subject: String(user.id),
            expiresIn: "1d",
        }
    );

    return token;
}