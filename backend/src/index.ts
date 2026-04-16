import app from "./app";
import { config } from "./config";

const host = process.env.HOST ?? "0.0.0.0";

app.listen(config.port, host, () => {
  console.log(`Server listening on http://${host}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
