import express from "express";
import { connectDatabase } from "./database/mongodb";
import authRoutes from "./routes/auth.route";

const app = express();
app.use(express.json());

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
