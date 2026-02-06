import { User } from "../../../generated/prisma/client"
import prismaClient from "../../../prisma"
import compareHash from "../../../utils/compareHash"
import { generateToken } from "../../../utils/generateToken"



interface AuthUserProps {
  email: string,
  password: string
}

class AuthUserService {
  async execute({ email, password }: AuthUserProps) {

    const user = await prismaClient.user.findFirst({ where: { email: email } })

    const isPasswordValid = user ? await compareHash(password, user.password) : false;

    if (!user || !isPasswordValid) {
      throw new Error("Credenciais Invalidas.")
    }

    const userToken = generateToken(user)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token: userToken,
    };

  }
}

export { AuthUserService }