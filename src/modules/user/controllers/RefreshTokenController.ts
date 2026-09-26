import { Request, Response } from "express";
import { RefreshTokenService } from "../services/RefreshTokenService";
import { respondWithMappedError } from "../../../utils/respondWithMappedError";

class RefreshTokenController {
  async handle(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const refreshTokenService = new RefreshTokenService();
      const result = await refreshTokenService.execute({ refreshToken });
      return res.json(result);
    } catch (error) {
      return respondWithMappedError(res, error, "Falha ao renovar token");
    }
  }
}

export { RefreshTokenController };
