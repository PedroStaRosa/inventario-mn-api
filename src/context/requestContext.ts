import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContextStore = {
    requestId: string;
    userId?: string;
    method: string;
    path: string;
    startedAt: number;
};

export const requestContext = new AsyncLocalStorage<RequestContextStore>();

export function getRequestContext(): RequestContextStore | undefined {
    return requestContext.getStore();
}

export function setRequestUserId(userId: string): void {
    const store = requestContext.getStore();
    if (store) {
        store.userId = userId;
    }
}
