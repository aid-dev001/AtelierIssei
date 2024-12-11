import { type Express } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { ADMIN_URL_PATH, requireAdmin } from "./admin";
import { 
  artworks, exhibitions, news, testimonials, 
  atelierPosts, contacts, adminUsers 
} from "@db/schema";

export default function setupRoutes(app: Express) {
  // Public API routes
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
      const artwork = await db.query.artworks.findFirst({
        where: eq(artworks.id, parseInt(req.params.id)),
      });
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artwork" });
    }
  });

  app.get("/api/exhibitions", async (req, res) => {
    try {
      const allExhibitions = await db.query.exhibitions.findMany({
        orderBy: (exhibitions) => exhibitions.startDate,
      });
      res.json(allExhibitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exhibitions" });
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

  // 管理者認証
  app.post(`/admin/${ADMIN_URL_PATH}/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.username, username),
      });

      if (!result) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, result.passwordHash);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.isAdmin = true;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // 管理者用API routes
  app.get(`/admin/${ADMIN_URL_PATH}/artworks`, requireAdmin, async (req, res) => {
    try {
      const allArtworks = await db.query.artworks.findMany({
        orderBy: (artworks) => artworks.createdAt,
      });
      res.json(allArtworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  app.post(`/admin/${ADMIN_URL_PATH}/artworks`, requireAdmin, async (req, res) => {
    try {
      const artwork = await db.insert(artworks).values(req.body);
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ error: "Failed to create artwork" });
    }
  });

  // Exhibition routes
  app.get(`/admin/${ADMIN_URL_PATH}/exhibitions`, requireAdmin, async (req, res) => {
    try {
      const allExhibitions = await db.query.exhibitions.findMany({
        orderBy: (exhibitions) => exhibitions.startDate,
      });
      res.json(allExhibitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exhibitions" });
    }
  });

  app.post(`/admin/${ADMIN_URL_PATH}/exhibitions`, requireAdmin, async (req, res) => {
    try {
      const exhibition = await db.insert(exhibitions).values(req.body);
      res.json(exhibition);
    } catch (error) {
      res.status(500).json({ error: "Failed to create exhibition" });
    }
  });

  // News routes
  app.get(`/admin/${ADMIN_URL_PATH}/news`, requireAdmin, async (req, res) => {
    try {
      const allNews = await db.query.news.findMany({
        orderBy: (news) => news.publishedAt,
      });
      res.json(allNews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post(`/admin/${ADMIN_URL_PATH}/news`, requireAdmin, async (req, res) => {
    try {
      const newsItem = await db.insert(news).values(req.body);
      res.json(newsItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create news" });
    }
  });

  // Testimonials routes
  app.get(`/admin/${ADMIN_URL_PATH}/testimonials`, requireAdmin, async (req, res) => {
    try {
      const allTestimonials = await db.query.testimonials.findMany({
        orderBy: (testimonials) => testimonials.createdAt,
      });
      res.json(allTestimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post(`/admin/${ADMIN_URL_PATH}/testimonials`, requireAdmin, async (req, res) => {
    try {
      const testimonial = await db.insert(testimonials).values(req.body);
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  // Atelier posts routes
  app.get(`/admin/${ADMIN_URL_PATH}/atelier-posts`, requireAdmin, async (req, res) => {
    try {
      const allPosts = await db.query.atelierPosts.findMany({
        orderBy: (posts) => posts.createdAt,
      });
      res.json(allPosts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch atelier posts" });
    }
  });

  app.post(`/admin/${ADMIN_URL_PATH}/atelier-posts`, requireAdmin, async (req, res) => {
    try {
      const post = await db.insert(atelierPosts).values(req.body);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create atelier post" });
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
