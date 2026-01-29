import express from "express";
import cors from "cors";
import { connectDatabase } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin/user.route"; 

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use("/api/admin/users", adminUserRoutes);

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
