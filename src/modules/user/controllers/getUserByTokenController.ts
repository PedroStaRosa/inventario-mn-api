import { Request, Response } from "express";
import { GetUserByTokenService } from "../services/GetUserByTokenService";
import { respondWithMappedError } from "../../../utils/respondWithMappedError";

class GetUserByTokenController {
  async handle(req: Request, res: Response) {
    try {
      const userId = req.user_id;
      const getUserByTokenService = new GetUserByTokenService();
      const user = await getUserByTokenService.execute(userId);
      return res.json(user);
    } catch (error) {
      return respondWithMappedError(
        res,
        error,
        "Falha ao obter usuário autenticado",
      );
    }
  }
}

export { GetUserByTokenController };
