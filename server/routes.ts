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
        orderBy: (artworks, { desc }) => [desc(artworks.createdAt)],
      });

      if (!allArtworks || allArtworks.length === 0) {
        // サンプルデータを挿入
        await db.insert(artworks).values([
          {
            title: 'Urban Dreams',
            description: '都市の夢想を描いた作品',
            imageUrl: '/artworks/12648.jpg',
            price: '250000',
            size: 'F15(65.2×53.0cm)',
            status: 'available',
            createdLocation: '銀座',
            storedLocation: '銀座',
            isAvailable: true,
          },
          {
            title: 'Serenity',
            description: '静寂の中の輝き',
            imageUrl: '/artworks/12653.jpg',
            price: '180000',
            size: 'F10(53.0×45.5cm)',
            status: 'available',
            createdLocation: '銀座',
            storedLocation: '銀座',
            isAvailable: true,
          },
          {
            title: 'Harmony',
            description: '調和の表現',
            imageUrl: '/artworks/12658.jpg',
            price: '220000',
            size: 'F12(60.6×50.0cm)',
            status: 'available',
            createdLocation: '銀座',
            storedLocation: '銀座',
            isAvailable: true,
          },
        ]);

        const newArtworks = await db.query.artworks.findMany({
          orderBy: (artworks, { desc }) => [desc(artworks.createdAt)],
        });
        
        res.json(newArtworks);
      } else {
        res.json(allArtworks);
      }
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
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
      const user = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.username, username),
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.isAdmin = true;
      res.json({ success: true });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // 管理者用API routes
  app.get(`/admin/${ADMIN_URL_PATH}/artworks`, requireAdmin, async (req, res) => {
    try {
      const allArtworks = await db.query.artworks.findMany({
        orderBy: (artworks, { desc }) => [desc(artworks.createdAt)],
      });
      
      if (!allArtworks || allArtworks.length === 0) {
        // サンプルデータを挿入
        await db.insert(artworks).values([
          {
            title: 'Urban Dreams',
            description: '都市の夢想を描いた作品',
            imageUrl: '/artworks/12648.jpg',
            price: '250000',
            size: 'F15(65.2×53.0cm)',
            status: 'available',
            createdLocation: '銀座',
            storedLocation: '銀座',
            isAvailable: true,
          },
          {
            title: 'Serenity',
            description: '静寂の中の輝き',
            imageUrl: '/artworks/12653.jpg',
            price: '180000',
            size: 'F10(53.0×45.5cm)',
            status: 'available',
            createdLocation: '銀座',
            storedLocation: '銀座',
            isAvailable: true,
          },
        ]);

        const initialArtworks = await db.query.artworks.findMany({
          orderBy: (artworks, { desc }) => [desc(artworks.createdAt)],
        });
        console.log('Initial artworks loaded:', initialArtworks);
        res.json(initialArtworks);
      } else {
        console.log('Existing artworks found:', allArtworks);
        res.json(allArtworks);
      }
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
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

  app.put(`/admin/${ADMIN_URL_PATH}/artworks/:id`, requireAdmin, async (req, res) => {
    try {
      await db.update(artworks)
        .set(req.body)
        .where(eq(artworks.id, parseInt(req.params.id)));
      
      const updatedArtwork = await db.query.artworks.findFirst({
        where: eq(artworks.id, parseInt(req.params.id)),
      });
      
      res.json(updatedArtwork);
    } catch (error) {
      res.status(500).json({ error: "Failed to update artwork" });
    }
  });

  app.delete(`/admin/${ADMIN_URL_PATH}/artworks/:id`, requireAdmin, async (req, res) => {
    try {
      await db.delete(artworks)
        .where(eq(artworks.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete artwork" });
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
