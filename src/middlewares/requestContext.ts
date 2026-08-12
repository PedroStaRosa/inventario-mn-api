import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { requestContext } from "../context/requestContext";

export function requestContextMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const headerRequestId = req.headers["x-request-id"];
    const requestId =
        typeof headerRequestId === "string" && headerRequestId.trim().length > 0
            ? headerRequestId.trim()
            : randomUUID();

    const store = {
        requestId,
        method: req.method,
        path: req.originalUrl,
        startedAt: Date.now(),
    };

    req.request_id = requestId;
    res.setHeader("x-request-id", requestId);

    requestContext.run(store, () => next());
}
