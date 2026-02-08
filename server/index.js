import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "express-api" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
