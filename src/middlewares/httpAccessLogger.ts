import { NextFunction, Request, Response } from "express";
import { getLogger } from "../utils/logger";

const SKIP_PREFIXES = ["/api-docs"];

export function httpAccessLogger(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const startedAt = Date.now();

    res.on("finish", () => {
        if (SKIP_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
            return;
        }

        const durationMs = Date.now() - startedAt;
        const logger = getLogger();

        const payload = {
            type: "http_access",
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs,
            ip: req.ip,
            userAgent: req.get("user-agent") || undefined,
        };

        if (res.statusCode >= 500) {
            logger.error(payload, "HTTP request failed");
            return;
        }

        if (res.statusCode >= 400) {
            logger.warn(payload, "HTTP request completed with client error");
            return;
        }

        logger.info(payload, "HTTP request completed");
    });

    next();
}
