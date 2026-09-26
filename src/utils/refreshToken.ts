import { createHash, randomBytes } from "crypto";

export function createOpaqueRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getRefreshExpiresAt(): Date {
  const seconds = Number(process.env.JWT_REFRESH_EXPIRES_IN);
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error(
      "JWT_REFRESH_EXPIRES_IN deve ser um inteiro positivo em segundos",
    );
  }

  return new Date(Date.now() + seconds * 1000);
}
