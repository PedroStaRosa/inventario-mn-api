import prismaClient from "../../../prisma";

class GetUserByTokenService {
    async execute(id: string) {
        const user = await prismaClient.user.findUnique({
            where: {
                id: id,
                removedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
}

export { GetUserByTokenService };