import app from "./app";
import { config } from "./config";

// const host = process.env.HOST ?? '0.0.0.0'

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);

  console.log(`Environment: ${config.nodeEnv}`);
});
