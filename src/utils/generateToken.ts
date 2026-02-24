import { User } from "../generated/prisma/client";
import jwt from "jsonwebtoken"

export const generateToken = (user: User): string => {
    if (!process.env.JWT_SECRET_KEY || !process.env.JWT_EXPIRES_IN) {
        throw new Error("JWT_SECRET_KEY e JWT_EXPIRES_IN é obrigatória");
    }
    const expiresIn = parseInt(process.env.JWT_EXPIRES_IN as string);
    const token = jwt.sign(
        {
            name: user.name,
            email: user.email,
        },
        process.env.JWT_SECRET_KEY as string,
        {
            subject: String(user.id),
            expiresIn: expiresIn,
        }
    );

    return token;
}