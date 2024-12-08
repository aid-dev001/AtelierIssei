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

  app.get("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid artwork ID" });
      }

      const artwork = await db.query.artworks.findFirst({
        where: eq(artworks.id, id),
      });
      
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      
      res.json(artwork);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      res.status(500).json({ error: "Failed to fetch artwork" });
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
      const contactData = {
        ...req.body,
        email: "isseiart2018@gmail.com", // 送信先メールアドレスを固定
      };
      const contact = await db.insert(contacts).values(contactData);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });
}
