import { Router } from "express";
import {
  createCommentrySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";

import { db } from "../index.js";
import { matchIdParamSchema } from "../validation/matches.js";

export const commentryRouter = Router({ mergeParams: true });

commentryRouter.get("/", (req, res) => {
  res.status(200).json({ message: "Commentary List" });
});

commentryRouter.post("/", async (req, res) => {
  const id = matchIdParamSchema.safeParse(req.params);
  if (!id.success) {
    res
      .status(400)
      .json({ error: "Invalid match Id", message: data.error.issues });
    return;
  }

  const data = createCommentrySchema.safeParse(req.body);

  if (!data.success) {
    res.status(400).json({
      error: "Invalid Commentary Payload",
      message: data.error.issues,
    });
    return;
  }

  try {
    const result = await db.query(
      `INSERT INTO sport.COMMENTARY (matchID,minute,sequenceno,period,eventType,actor,team,message,tags,metadata,createdAt)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        id.data.id,
        data.data.minute,
        data.data.sequenceno,
        data.data.period,
        data.data.eventType,
        data.data.actor,
        data.data.team,
        data.data.message,
        data.data.tags,
        data.data.metadata,
        new Date(),
      ],
    );
    if (result.rowCount === 1) {
      if (req.app.locals.broadcastcommentary) {
        res.app.locals.broadcastcommentary(id.data.id, result.rows);
      }
      res.status(201).json({
        commentary: result.rows,
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to create commentart.",
      message: JSON.stringify("Failed during commentart creation."),
    });
  }
});
