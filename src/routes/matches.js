import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../index.js";

import { getMatchStatus } from "../utils/match.js";

export const matchRouter = Router();

matchRouter.get("/", async (req, res) => {
  const query = listMatchesQuerySchema.safeParse(req.query);
  if (!query.success) {
    res
      .status(400)
      .json({ error: "Invalid Query", message: query.error.issues });
    return;
  }
  const limit = Math.min(query.limit ?? 5, 100);

  try {
    const result = await db.query(
      `SELECT * FROM sport.MATCH ORDER BY createdAt DESC LIMIT ${limit}`,
    );
    res.status(200).json({ matchesList: result.rows });
    return;
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch match.",
      message: JSON.stringify(error),
    });
  }
});

matchRouter.post("/", async (req, res) => {
  const data = createMatchSchema.safeParse(req.body);
  if (!data.success) {
    res
      .status(400)
      .json({ error: "Invalid Payload", message: data.error.issues });
    return;
  }
  try {
    const result = await db.query(
      `INSERT INTO sport.MATCH
   (HomeTeam,AwayTeam,Sport,StartTime,EndTime,CreatedAt,Status,HomeScore,AwayScore)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        data.data.homeTeam,
        data.data.awayTeam,
        data.data.sport,
        new Date(data.data.startTime),
        new Date(data.data.endTime),
        new Date(),
        getMatchStatus(data.data.startTime, data.data.endTime),
        data.data.homeScore,
        data.data.awayScore,
      ],
    );
    if (result.rowCount === 1) {
      res.status(201).json({
        message: "Match Created",
      });
    } else {
      res.status(500).json({
        error: "Failed to create match.",
        message: "Failed during match creation",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to create match.",
      message: JSON.stringify(error),
    });
  }
});
