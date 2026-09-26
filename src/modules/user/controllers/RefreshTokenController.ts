import { Request, Response } from "express";
import { RefreshTokenService } from "../services/RefreshTokenService";

class RefreshTokenController {
  async handle(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const refreshTokenService = new RefreshTokenService();
      const result = await refreshTokenService.execute({ refreshToken });
      return res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro ao renovar token" });
    }
  }
}

export { RefreshTokenController };
