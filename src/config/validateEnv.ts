import z from "zod";
import { baseLogger } from "../utils/logger";

const envSchema = z.object({
    DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
    JWT_SECRET_KEY: z.string().min(32, 'JWT_SECRET_KEY deve ter no mínimo 32 caracteres'),
    EXPRESS_PORT: z.string().regex(/^\d+$/).optional(),
    ALLOWED_ORIGINS: z.string(),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

export function validateEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            baseLogger.fatal(
                {
                    issues: error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                    })),
                },
                "Variáveis de ambiente inválidas"
            );
        }
        process.exit(1);
    }
}