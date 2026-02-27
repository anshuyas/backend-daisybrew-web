import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminOrderRoutes from "./routes/admin/order.route";
import userRoutes from "./routes/user.route";
import orderRoutes from "./routes/order.route";
import notificationRoutes from "./routes/notification.route";
import adminNotificationRoutes from "./routes/admin/notification.route";
import adminMenuRoutes from "./routes/admin/menu.route";
import menuRoutes from "./routes/menu.route";
import reportsRoute from "./routes/admin/reports.route";
import path from "path";

const app = express();

/* Middlewares */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

/* Routes */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/menu", adminMenuRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/admin/reports", reportsRoute);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/menu", menuRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;
