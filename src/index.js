import express from "express";
import { pool } from "../db/db_connect.js";
import PG from "pg";
const app = express();
const port = 8000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const client = await pool.connect();

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

const result = await client.query({
  rowMode: "array",
  text: "SELECT * FROM sport.match",
});

console.log(result.rows);
