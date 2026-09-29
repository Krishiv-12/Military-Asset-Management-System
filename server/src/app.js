import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import basesRoutes from "./modules/bases/bases.routes.js";
import equipmentRoutes from "./modules/equipment/equipment.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import purchasesRoutes from "./modules/purchases/purchases.routes.js";
import transfersRoutes from "./modules/transfers/transfers.routes.js";
import assignmentsRoutes from "./modules/assignments/assignments.routes.js";
import expendituresRoutes from "./modules/expenditures/expenditures.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/bases", basesRoutes);
app.use("/api/equipment-types", equipmentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchases", purchasesRoutes);
app.use("/api/transfers", transfersRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/expenditures", expendituresRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
