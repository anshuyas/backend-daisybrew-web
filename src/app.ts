import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin/user.route";

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
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;
