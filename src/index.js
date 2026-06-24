import express from "express";
import { pool } from "../db/db_connect.js";
import http from "http";
import PG from "pg";
import { matchRouter } from "./routes/matches.js";
import { attachwss } from "./ws/server.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.SERVER_PORT;

// get db handle
const client = await pool.connect();

app.use(express.json());
app.use("/matches", matchRouter);


const broadcastmatchcreated = attachwss(server);
console.log(broadcastmatchcreated)
app.locals.broadcastmatchcreated = broadcastmatchcreated;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(PORT, () => {
  console.log(`http server is running at http://localhost:${PORT}`);
  console.log(`websocket server is running at ws://localhost:${PORT}/ws`);
});

await client.query("CREATE SCHEMA IF NOT EXISTS sport");

await client.query(
  `CREATE TABLE IF NOT EXISTS sport.MATCH (ID SERIAL PRIMARY KEY,
HomeTeam VARCHAR(80) NOT NULL,
AwayTeam VARCHAR(80) NOT NULL,
Sport VARCHAR(80) NOT NULL,
StartTime TIMESTAMPTZ,
EndTime TIMESTAMPTZ,
CreatedAt TIMESTAMPTZ DEFAULT NOW(),
Status VARCHAR(20) NOT NULL 
    CHECK(Status IN ('Scheduled','Live','Finished')) DEFAULT 'Scheduled',
HomeScore INTEGER DEFAULT 0,
AwayScore INTEGER DEFAULT 0)`,
);

await client.query(
  `CREATE TABLE IF NOT EXISTS sport.COMMENTARY (ID SERIAL PRIMARY KEY,
MatchID INTEGER REFERENCES sport.MATCH(ID),
MINUTE INTEGER,
SEQUENCENO INTEGER ,
PERIOD VARCHAR(80),
EventType VARCHAR(80),
ACTOR VARCHAR(80),
Team VARCHAR(80),
MESSAGE VARCHAR(256) NOT NULL,
TAGS TEXT[],
METADATA JSONB,
CreatedAt TIMESTAMPTZ DEFAULT NOW())`,
);

export const db = client;
