import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
// import errorHandler from "../src/middleware/error.middleware.js";
// import { apiLimiter } from "./middleware/rateLimit.middleware.js";

import cookieParser from "cookie-parser";
const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL_PROD,
  process.env.BACKEND_URL_PRE_PROD,
  process.env.BACKEND_URL_DEV,
];
// console.log("process.env.FRONTEND_URL,",allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static("uploads"));
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
// app.use(apiLimiter);
app.use("/api", routes);
// app.get("/:shortCode", redirectUrl);
// app.use(errorHandler);
export default app;