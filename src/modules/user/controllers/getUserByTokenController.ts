import { Request, Response } from "express";
import { GetUserByTokenService } from "../services/GetUserByTokenService";

class GetUserByTokenController {
  async handle(req: Request, res: Response) {
    try {
      const userId = req.user_id;
      const getUserByTokenService = new GetUserByTokenService();
      const user = await getUserByTokenService.execute(userId);
      return res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("User not found")) {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export { GetUserByTokenController };
