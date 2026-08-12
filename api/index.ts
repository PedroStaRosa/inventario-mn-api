import "dotenv/config";
import app from "../src/app";
import { validateEnv } from "../src/config/validateEnv";

// Valida variáveis na cold start da função
validateEnv();

export default app;
