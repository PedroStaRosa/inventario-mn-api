import express from "express";
import cors from "cors";
import ProductsRoutes from "./modules/products/routes";
import UserRoutes from "./modules/user/routes";
import { Request, Response, NextFunction } from "express";
import InventoryRoutes from "./modules/inventory/routes";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();

/* app.use(cors()); */
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(express.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Routes
app.use(ProductsRoutes);
app.use(UserRoutes);
app.use(InventoryRoutes)
//Error Handler
app.use((error: Error, _: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Tratamento de erros do Multer
  if (error.message && error.message.includes("Inventory_")) {
    const errorMessage = error.message.split("_")[1]
    if (errorMessage!.includes("Nome de inventário já se encontra cadastrado no banco.")) {
      return res.status(400).json({ error: errorMessage });
    }
    if (errorMessage!.includes("Produtos não encontrados:")) {
      return res.status(404).json({ error: errorMessage });
    }
  }

  if (error.message.includes("Apenas arquivos CSV são permitidos")) {
    return res.status(400).json({ error: error.message });
  }

  if (error.message.includes("Credenciais")) {
    return res.status(401).json({ error: error.message });
  }

  if (error.message.includes("sem permissão")) {
    return res.status(403).json({ error: error.message });
  }

  if (error.message.includes("não encontrado")) {
    return res.status(404).json({ error: error.message });
  }

  if (error.message.includes("já existe") || error.message.includes("already exists")) {
    return res.status(409).json({ error: error.message });
  }

  return res.status(500).json({ error: "Erro interno do servidor" });
});

export default app;
