import express from "express";
import { connectDatabase } from "./database/mongodb";

const app = express();

app.use(express.json());

connectDatabase();

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
