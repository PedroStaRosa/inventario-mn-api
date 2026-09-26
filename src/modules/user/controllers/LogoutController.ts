import { Request, Response } from "express";
import { LogoutService } from "../services/LogoutService";

class LogoutController {
  async handle(req: Request, res: Response) {
    const { refreshToken } = req.body;

    const logoutService = new LogoutService();
    const result = await logoutService.execute({ refreshToken });

    return res.json(result);
  }
}

export { LogoutController };
