import { genSalt, hash } from "bcryptjs";

const hashInfo = async (key: string) => {
    const salt = await genSalt(10);
    const keyHash = await hash(key, salt);
    return keyHash;
  }

  export default hashInfo