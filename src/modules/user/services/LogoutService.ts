import prismaClient from "../../../prisma";
import { hashRefreshToken } from "../../../utils/refreshToken";

interface LogoutProps {
  refreshToken: string;
}

class LogoutService {
  async execute({ refreshToken }: LogoutProps) {
    const tokenHash = hashRefreshToken(refreshToken);

    const stored = await prismaClient.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!stored || stored.revokedAt) {
      return { message: "Sessão encerrada." };
    }

    await prismaClient.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return { message: "Sessão encerrada." };
  }
}

export { LogoutService };
