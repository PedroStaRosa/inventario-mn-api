
import { compare } from "bcryptjs";

const compareHash = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await compare(plainPassword, hashedPassword);
}

export default compareHash