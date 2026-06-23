import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { authRoutes } from "./routes/auth-routes.js";
import { tripRoutes } from "./routes/trip-routes.js";
import type { AiService } from "./services/ai-service.js";
import type { Store } from "./store/store.js";

export const createApp = (store: Store, ai: AiService) => {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    pinoHttp({
      autoLogging: config.NODE_ENV !== "test",
      quietReqLogger: config.NODE_ENV === "test",
      redact: {
        paths: ["req.headers.cookie", "req.headers.authorization", "res.headers.set-cookie"],
        censor: "[Redacted]"
      }
    })
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: config.WEB_ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true
    })
  );
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "wayfare-api", timestamp: new Date().toISOString() });
  });
  app.use("/api/auth", authRoutes(store));
  app.use("/api/trips", tripRoutes(store, ai));
  app.use(notFound);
  app.use(errorHandler);
  return app;
};
