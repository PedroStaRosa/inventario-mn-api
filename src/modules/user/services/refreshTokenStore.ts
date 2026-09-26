import { User } from "../../../generated/prisma/client";
import prismaClient from "../../../prisma";
import {
  createOpaqueRefreshToken,
  getRefreshExpiresAt,
  hashRefreshToken,
} from "../../../utils/refreshToken";

export async function issueRefreshToken(userId: string): Promise<string> {
  const refreshToken = createOpaqueRefreshToken();

  await prismaClient.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(refreshToken),
      userId,
      expiresAt: getRefreshExpiresAt(),
    },
  });

  return refreshToken;
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prismaClient.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export type AuthTokensResult = {
  id: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string;
};

export function toAuthUserPayload(
  user: Pick<User, "id" | "name" | "email">,
  token: string,
  refreshToken: string,
): AuthTokensResult {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token,
    refreshToken,
  };
}
