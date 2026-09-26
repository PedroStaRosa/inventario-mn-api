import prismaClient from "../../../prisma";
import { generateToken } from "../../../utils/generateToken";
import {
  createOpaqueRefreshToken,
  getRefreshExpiresAt,
  hashRefreshToken,
} from "../../../utils/refreshToken";
import {
  revokeAllRefreshTokens,
  toAuthUserPayload,
} from "./refreshTokenStore";

interface RefreshTokenProps {
  refreshToken: string;
}

class RefreshTokenService {
  async execute({ refreshToken }: RefreshTokenProps) {
    const tokenHash = hashRefreshToken(refreshToken);

    const stored = await prismaClient.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });

    if (!stored) {
      throw new Error("Refresh token inválido.");
    }

    if (stored.revokedAt) {
      await revokeAllRefreshTokens(stored.userId);
      throw new Error("Refresh token inválido.");
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      await prismaClient.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      throw new Error("Refresh token expirado.");
    }

    if (stored.user.removedAt) {
      await revokeAllRefreshTokens(stored.userId);
      throw new Error("Usuário não encontrado ou removido.");
    }

    const newRefreshToken = createOpaqueRefreshToken();
    const newRefreshHash = hashRefreshToken(newRefreshToken);

    await prismaClient.$transaction([
      prismaClient.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      }),
      prismaClient.refreshToken.create({
        data: {
          tokenHash: newRefreshHash,
          userId: stored.userId,
          expiresAt: getRefreshExpiresAt(),
        },
      }),
    ]);

    const token = generateToken(stored.user);

    return toAuthUserPayload(stored.user, token, newRefreshToken);
  }
}

export { RefreshTokenService };
