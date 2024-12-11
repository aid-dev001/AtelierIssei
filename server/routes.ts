import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { generateArtworkDescription } from './openai';
import { db } from "../db";
import { ADMIN_URL_PATH, requireAdmin } from "./admin";
import { 
  artworks,
  exhibitions,
  news,
  testimonials,
  atelierPosts,
  contacts,
  adminUsers,
} from "@db/schema";
import { eq } from "drizzle-orm";

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/artworks';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB limit
  },
  fileFilter: (req, file, cb) => {
    // JPEGとPNGのみを許可
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error('JPEGまたはPNG形式の画像のみアップロード可能です'));
    }
  }
});

export default function setupRoutes(app: express.Express) {
  // Public routes
  app.get("/api/artworks", async (req, res) => {
    try {
      const allArtworks = await db.query.artworks.findMany({
        orderBy: (artworks) => artworks.createdAt,
      });
      res.json(allArtworks);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
      res.status(500).json({ error: "作品の取得に失敗しました" });
    }
  });

  app.get("/api/artworks/:id", async (req, res) => {
    try {
      const artwork = await db.query.artworks.findFirst({
        where: eq(artworks.id, parseInt(req.params.id)),
      });
      if (!artwork) {
        return res.status(404).json({ error: "作品が見つかりません" });
      }
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ error: "作品の取得に失敗しました" });
    }
  });

  // Admin authentication
  app.post(`/admin/${ADMIN_URL_PATH}/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.username, username),
      });

      if (!user) {
        return res.status(401).json({ error: "認証に失敗しました" });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: "認証に失敗しました" });
      }

      if (req.session) {
        req.session.isAdmin = true;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "ログインに失敗しました" });
    }
  });

  // Admin routes
  app.get(`/admin/${ADMIN_URL_PATH}/artworks`, requireAdmin, async (req, res) => {
    try {
      const allArtworks = await db.query.artworks.findMany({
        orderBy: (artworks) => artworks.createdAt,
      });
      res.json(allArtworks);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
      res.status(500).json({ error: "作品の取得に失敗しました" });
    }
  });

  // Generate description using OpenAI
  app.post(`/admin/${ADMIN_URL_PATH}/generate-description`, requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "画像がアップロードされていません" });
      }

      // アップロードされたファイルが存在することを確認
      if (!fs.existsSync(req.file.path)) {
        return res.status(500).json({ error: "アップロードされた画像の保存に失敗しました" });
      }

      // 画像の公開URLを生成
      const imageUrl = `/artworks/${req.file.filename}`;
      console.log('Generating description for image:', imageUrl);

      // OpenAI APIを使用して説明を生成
      try {
        const { title, description } = await generateArtworkDescription(`${req.protocol}://${req.get('host')}${imageUrl}`);
        console.log('Generated description:', { title, description });

        if (!title || !description) {
          throw new Error('タイトルまたは説明文の生成に失敗しました');
        }

        res.json({ 
          success: true,
          title, 
          description,
          imageUrl 
        });
      } catch (error) {
        console.error('Error in description generation:', error);
        res.status(422).json({ 
          error: error instanceof Error ? error.message : 'タイトルと説明文の生成に失敗しました',
          imageUrl 
        });
      }
    } catch (error) {
      console.error("Error in generate-description:", error);
      const isOpenAIError = error instanceof Error && error.message.includes('OpenAI');
      
      res.status(isOpenAIError ? 422 : 500).json({ 
        error: isOpenAIError ? "説明文の生成に失敗しました" : "サーバーエラーが発生しました",
        details: error instanceof Error ? error.message : "不明なエラー",
        imageUrl: req.file ? `/artworks/${req.file.filename}` : undefined
      });
    }
  });

  // Create artwork
  app.post(`/admin/${ADMIN_URL_PATH}/artworks`, requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "画像がアップロードされていません" });
      }

      const imageUrl = `/artworks/${req.file.filename}`;
      const artworkData = {
        ...req.body,
        imageUrl,
      };

      const artwork = await db.insert(artworks).values(artworkData);
      res.json({ ...artwork, imageUrl });
    } catch (error) {
      console.error("Error creating artwork:", error);
      res.status(500).json({ error: "作品の作成に失敗しました" });
    }
  });

  // Update artwork
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
      console.error("Error updating artwork:", error);
      res.status(500).json({ error: "作品の更新に失敗しました" });
    }
  });

  // Delete artwork
  app.delete(`/admin/${ADMIN_URL_PATH}/artworks/:id`, requireAdmin, async (req, res) => {
    try {
      await db.delete(artworks)
        .where(eq(artworks.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting artwork:", error);
      res.status(500).json({ error: "作品の削除に失敗しました" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = {
        ...req.body,
        email: "isseiart2018@gmail.com", // 送信先メールアドレスを固定
      };
      const contact = await db.insert(contacts).values(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ error: "お問い合わせの送信に失敗しました" });
    }
  });
}
