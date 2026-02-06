import app from "./app";
import { validateEnv } from "./config/validateEnv";


validateEnv();

const PORT = Number(process.env.EXPRESS_PORT) || 3000;
app.listen(PORT ?? 3000, () => {
  console.log(`Server is running on port ${PORT}`);
});