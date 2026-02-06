import prismaClient from "../../../prisma";
import hashInfo from "../../../utils/createHash";

interface CreateUserProps {
    name: string;
    email: string;
    password: string;
}

class CreateUserService {
    async execute({ email, name, password }: CreateUserProps) {
        const userAlreadyExists = await prismaClient.user.findUnique({
            where: {
                email,
            },
        });

        if (userAlreadyExists) {
            throw new Error("User already exists");
        }
        const passwordHash = await hashInfo(password);

        const user = await prismaClient.user.create({
            data: {
                name,
                email,
                password: passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return user;
    }

}

export { CreateUserService }