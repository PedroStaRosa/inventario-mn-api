import express from "express";
import cors from "cors";
import ProductsRoutes from "./modules/products/routes";
import UserRoutes from "./modules/user/routes";
import { Request, Response, NextFunction } from "express";
import InventoryRoutes from "./modules/inventory/routes";
import DashboardRoutes from "./modules/dashboard/routes";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { requestContextMiddleware } from "./middlewares/requestContext";
import { httpAccessLogger } from "./middlewares/httpAccessLogger";
import { mapErrorForClient } from "./utils/respondWithMappedError";
import { getLogger } from "./utils/logger";

const app = express();

app.set("trust proxy", 1);
/* app.use(cors()); */
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }),
);
app.use(helmet());
app.use(express.json());

app.use(requestContextMiddleware);
app.use(httpAccessLogger);

// Swagger Documentation
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

//Routes
app.use(ProductsRoutes);
app.use(UserRoutes);
app.use(InventoryRoutes);
app.use(DashboardRoutes);
//Error Handler
app.use((error: Error, _: Request, res: Response, next: NextFunction) => {
  getLogger().error({ err: error }, "Unhandled error");

  const mapped = mapErrorForClient(error);
  return res.status(mapped.status).json({ error: mapped.message });
});

export default app;
