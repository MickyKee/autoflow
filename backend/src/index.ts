import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "autoflow-api" });
});

const port = Number(process.env.API_PORT ?? 4000);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`AutoFlow API listening on http://localhost:${port}`);
  });
}

export { app };
