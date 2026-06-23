import express from "express";

const app = express();
const port = 8000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "rt_sport_db",
  port: 5432,
  password: "AkjjHeso123@#",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60,
});

pool.connect();

pool.on("connect", (client) => {
  console.log("client connected to DB");
});

pool.on("error", (err) => {
  console.log(`error while connecting to DB ${err.message}`);
});
