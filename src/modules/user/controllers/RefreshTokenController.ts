import { Request, Response } from "express";
import { RefreshTokenService } from "../services/RefreshTokenService";

class RefreshTokenController {
    async handle(req: Request, res: Response) {
        const userId = req.user_id;

        const refreshTokenService = new RefreshTokenService();

        const result = await refreshTokenService.execute({ userId });

        return res.json(result);
    }
}

export { RefreshTokenController };

