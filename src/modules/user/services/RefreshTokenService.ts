import { User } from "../../../generated/prisma/client";
import prismaClient from "../../../prisma";
import jwt from "jsonwebtoken";
import { generateToken } from "../../../utils/generateToken";

interface RefreshTokenProps {
    userId: string;
}

class RefreshTokenService {
    async execute({ userId }: RefreshTokenProps) {
        const user = await prismaClient.user.findFirst({
            where: {
                id: userId,
                removedAt: null,
            },
        });

        if (!user) {
            throw new Error("Usuário não encontrado ou removido.");
        }

        const newToken = generateToken(user);

        return {
            token: newToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }
}

export { RefreshTokenService };

