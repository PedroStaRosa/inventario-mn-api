import { Request, Response } from "express";
import { getDashboardSchema } from "../schemas/dashboardSchema";
import { GetDashboardService } from "../services/GetDashboardService";

class GetDashboardController {
  async handle(req: Request, res: Response) {
    const userId = req.user_id;

    /*   const parsed = getDashboardSchema.parse({
      query: req.query,
    }); */

    /* const { days, recentInventoriesLimit, recentProductsLimit } = parsed.query; */

    const getDashboardService = new GetDashboardService();
    const dashboard = await getDashboardService.execute(
      userId /* , {
      days,
      recentInventoriesLimit,
      recentProductsLimit,
    } */,
    );

    return res.status(200).json(dashboard);
  }
}

export { GetDashboardController };
