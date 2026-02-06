import prismaClient from "../../../prisma"

interface CreateProductProps {
    code: string,
    description: string
}

interface ProcessResult {
    created: CreateProductProps[];
    skipped: CreateProductProps[];
    errors: Array<{
        code: string;
        description: string;
        error: string;
    }>;
}

class CreateProductByFileService {
    async execute(products: CreateProductProps[], userId: string): Promise<ProcessResult> {
        const result: ProcessResult = {
            created: [],
            skipped: [],
            errors: []
        };

        const codes = products.map(p => p.code);
        const existing = await prismaClient.product.findMany({
            where: {
                code: { in: codes },
                userId: userId
            },
            select: { code: true },
        });
        const existingCodes = new Set(existing.map(p => p.code));

        const toCreate: CreateProductProps[] = [];

        for (const product of products) {
            if (existingCodes.has(product.code)) {
                result.skipped.push(product);
            } else {
                toCreate.push(product);
            }
        }

        try {
            await prismaClient.product.createMany({
                data: toCreate.map(p => ({
                    code: p.code.replace(/^0+/, ''),
                    description: p.description,
                    userId
                })),
                skipDuplicates: true,
            });

            result.created.push(...toCreate);
        } catch (error: any) {
            for (const product of toCreate) {
                result.errors.push({
                    code: product.code,
                    description: product.description,
                    error: error.message || "Erro ao cadastrar produto",
                });
            }
        }

        return result;
    }
}

export { CreateProductByFileService }