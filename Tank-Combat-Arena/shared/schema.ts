import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  score: integer("score").notNull(),
  kills: integer("kills").notNull(),
  accuracy: integer("accuracy").notNull(),
  survivalTime: integer("survival_time").notNull(), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScoreSchema = createInsertSchema(scores).pick({
  username: true,
  score: true,
  kills: true,
  accuracy: true,
  survivalTime: true,
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type CreateScoreRequest = InsertScore;
