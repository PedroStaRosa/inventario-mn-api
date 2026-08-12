import pino from "pino";
import { getRequestContext } from "../context/requestContext";

const isProduction = process.env.NODE_ENV === "production";

const baseLogger = pino({
    level: process.env.LOG_LEVEL || "info",
    base: {
        service: "inventario-mn-api",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(isProduction
        ? {}
        : {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname,service",
                },
            },
        }),
});

/** Logger raiz (startup, validação de env, etc.) */
export { baseLogger };

/**
 * Logger com bindings do request atual (requestId, userId).
 * Fora de um request HTTP, retorna o logger raiz.
 */
export function getLogger() {
    const ctx = getRequestContext();

    if (!ctx) {
        return baseLogger;
    }

    return baseLogger.child({
        requestId: ctx.requestId,
        ...(ctx.userId ? { userId: ctx.userId } : {}),
    });
}
