import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { setRequestUserId } from "../context/requestContext";
import prismaClient from "../prisma";

interface Payload {
  sub: string;
}

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Receber o token
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  const [, token] = authToken.split(" ");

  try {
    //Validar esse token.
    const { sub } = verify(
      token as string,
      process.env.JWT_SECRET_KEY as string,
      {
        algorithms: ["HS256"],
      },
    ) as Payload;

    const isUserActive = await prismaClient.user.findUnique({
      where: {
        id: sub,
        removedAt: null,
      },
      select: {
        id: true,
      },
    });
    if (!isUserActive) {
      return res.status(401).json({ message: "token invalid" });
    }
    //Recuperar o id do token e colocar dentro de uma variavel user_id dentro do req.
    req.user_id = sub;
    setRequestUserId(sub);

    return next();
  } catch (err) {
    return res.status(401).json({ message: "token invalid" });
  }
}
