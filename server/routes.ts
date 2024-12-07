import type { Express } from "express";
import { db } from "../db";
import { artworks, news, contacts } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  app.get("/api/artworks", async (req, res) => {
    try {
      const allArtworks = await db.query.artworks.findMany({
        orderBy: (artworks) => artworks.createdAt,
      });
      res.json(allArtworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const allNews = await db.query.news.findMany({
        orderBy: (news) => news.publishedAt,
      });
      res.json(allNews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contact = await db.insert(contacts).values(req.body);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });
}
