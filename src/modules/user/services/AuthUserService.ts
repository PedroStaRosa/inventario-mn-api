import prismaClient from "../../../prisma";
import compareHash from "../../../utils/compareHash";
import { generateToken } from "../../../utils/generateToken";
import { issueRefreshToken, toAuthUserPayload } from "./refreshTokenStore";

interface AuthUserProps {
  email: string;
  password: string;
}

class AuthUserService {
  async execute({ email, password }: AuthUserProps) {
    const user = await prismaClient.user.findFirst({
      where: {
        email,
        removedAt: null,
      },
    });

    const isPasswordValid = user
      ? await compareHash(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      throw new Error("Credenciais Invalidas.");
    }

    const token = generateToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    return toAuthUserPayload(user, token, refreshToken);
  }
}

export { AuthUserService };
