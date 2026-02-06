import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
    JWT_SECRET_KEY: z.string().min(32, 'JWT_SECRET_KEY deve ter no mínimo 32 caracteres'),
    EXPRESS_PORT: z.string().regex(/^\d+$/).optional(),
    ALLOWED_ORIGINS: z.string()
});

export function validateEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Variáveis de ambiente inválidas:');
            error.issues.forEach(issue => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
        }
        process.exit(1);
    }
}