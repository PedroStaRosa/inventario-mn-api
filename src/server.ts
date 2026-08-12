import "dotenv/config";
import app from "./app";
import { validateEnv } from "./config/validateEnv";
import { baseLogger } from "./utils/logger";


validateEnv();

const PORT = Number(process.env.EXPRESS_PORT) || 3000;
app.listen(PORT ?? 3000, () => {
  baseLogger.info({ port: PORT }, "Server is running");
});
