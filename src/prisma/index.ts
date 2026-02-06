import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL é obrigatória");
}

const connectionString = `${process.env.DATABASE_URL! as string}`;
const adapter = new PrismaPg({ connectionString });

const prismaClient = new PrismaClient({ adapter });

export default prismaClient;