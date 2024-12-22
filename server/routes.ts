import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { generateArtworkDescription, generateCollectionDescription, generateExhibitionDescription } from './openai';
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
  collections,
  voices,
} from "@db/schema";
import { eq, desc } from "drizzle-orm";

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

import contactRouter from './routes/contact';

export default function setupRoutes(app: express.Express) {
  // Contact routes
  app.use('/api', contactRouter);

  // Public routes
  app.get("/api/artworks", async (req, res) => {
    try {
      const allArtworks = await db.select().from(artworks).orderBy(desc(artworks.updatedAt));
      res.json(allArtworks);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
      res.status(500).json({ error: "作品の取得に失敗しました" });
    }
  });

  // Collections CRUD endpoints
  app.get("/api/collections", async (req, res) => {
    try {
      const allCollections = await db.select().from(collections).orderBy(desc(collections.updatedAt));
      console.log('Fetched collections:', allCollections);
      res.json(allCollections);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      res.status(500).json({ error: "コレクションの取得に失敗しました" });
    }
  });
  app.get("/api/collections/:id", async (req, res) => {
    try {
      const collection = await db.query.collections.findFirst({
        where: eq(collections.id, parseInt(req.params.id)),
      });
      
      if (!collection) {
        return res.status(404).json({ error: "コレクションが見つかりません" });
      }
      
      res.json(collection);
    } catch (error) {
      console.error("Failed to fetch collection:", error);
      res.status(500).json({ error: "コレクションの取得に失敗しました" });
    }
  });


  app.post(`/admin/${ADMIN_URL_PATH}/generate-collection-description`, requireAdmin, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "タイトルが必要です" });
    }

    const description = await generateCollectionDescription(title);
    res.json({ description });
  } catch (error) {
    console.error("Error generating collection description:", error);
    res.status(500).json({ error: "説明文の生成に失敗しました" });
  }
});

app.post(`/admin/${ADMIN_URL_PATH}/collections`, requireAdmin, async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      console.log('Received collection creation request:', req.body);
      
      const collectionData = {
        title: req.body.title,
        description: req.body.description || req.body.title,
        imageUrl: '/artworks/placeholder.png',
        year: currentYear,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Attempting to create collection with data:', collectionData);

      const [newCollection] = await db.insert(collections).values(collectionData).returning();
      console.log('Collection created successfully:', newCollection);
      
      res.json(newCollection);
    } catch (error) {
      console.error("Error creating collection:", error);
      res.status(500).json({ error: "コレクションの作成に失敗しました" });
    }
  });

  app.put(`/admin/${ADMIN_URL_PATH}/collections/:id`, requireAdmin, async (req, res) => {
    try {
      console.log('Updating collection:', req.params.id, 'with data:', req.body);
      const { id, ...updateData } = req.body;
      await db.update(collections)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(collections.id, parseInt(req.params.id)));
      
      const updatedCollection = await db.select().from(collections)
        .where(eq(collections.id, parseInt(req.params.id)))
        .then(rows => rows[0]);
      
      console.log('Collection updated successfully:', updatedCollection);
      res.json(updatedCollection);
    } catch (error) {
      console.error("Error updating collection:", error);
      res.status(500).json({ error: "コレクションの更新に失敗しました" });
    }
  });

  app.delete(`/admin/${ADMIN_URL_PATH}/collections/:id`, requireAdmin, async (req, res) => {
    try {
      console.log('Attempting to delete collection:', req.params.id);
      await db.delete(collections)
        .where(eq(collections.id, parseInt(req.params.id)));
      console.log('Collection deleted successfully');
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ error: "コレクションの削除に失敗しました" });
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
        orderBy: (artworks) => desc(artworks.updatedAt),
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
        // 画像のフルURLを生成
        const imageFullUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
        console.log('Attempting to generate description for image:', imageFullUrl);

        const { title, description } = await generateArtworkDescription(imageFullUrl);
        console.log('Successfully generated description:', { title, description });

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
        const isOpenAIError = error instanceof Error && error.message.includes('OpenAI');
        
        res.status(isOpenAIError ? 422 : 500).json({ 
          error: isOpenAIError ? "説明文の生成に失敗しました" : "サーバーエラーが発生しました",
          details: error instanceof Error ? error.message : "不明なエラー",
          imageUrl: req.file ? `/artworks/${req.file.filename}` : undefined
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
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        size: req.body.size,
        status: req.body.status,
        createdLocation: req.body.createdLocation,
        storedLocation: req.body.storedLocation,
        imageUrl: req.body.imageUrl || imageUrl,
        updatedAt: new Date(),
      };

      await db.insert(artworks).values(artworkData);
      res.json({ success: true, ...artworkData });
    } catch (error) {
      console.error("Error creating artwork:", error);
      res.status(500).json({ error: "作品の作成に失敗しました" });
    }
  });

  // Update artwork
  // Handle interior image upload
  app.post(`/admin/${ADMIN_URL_PATH}/upload`, requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "画像がアップロードされていません" });
      }

      const imageUrl = `/artworks/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "画像のアップロードに失敗しました" });
    }
  });

  app.put(`/admin/${ADMIN_URL_PATH}/artworks/:id`, requireAdmin, async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
      console.log('Updating artwork with data:', updateData);
      
      const artwork = await db.query.artworks.findFirst({
        where: eq(artworks.id, parseInt(req.params.id)),
      });

      if (!artwork) {
        return res.status(404).json({ error: "作品が見つかりません" });
      }

      // Clean up the update data
      const cleanedData: any = {
        title: updateData.title,
        description: updateData.description,
        imageUrl: updateData.imageUrl,
        price: updateData.price,
        size: updateData.size,
        status: updateData.status,
        createdLocation: updateData.createdLocation,
        storedLocation: updateData.storedLocation,
        exhibitionLocation: updateData.exhibitionLocation || null,
        isAvailable: updateData.isAvailable,
        collectionId: updateData.collectionId,
        interiorImageDescriptions: Array.isArray(updateData.interiorImageDescriptions) 
          ? updateData.interiorImageDescriptions 
          : [],
        updatedAt: new Date(),
      };

      // Handle interiorImageUrls separately
      if (updateData.interiorImageUrls !== undefined) {
        cleanedData.interiorImageUrls = Array.isArray(updateData.interiorImageUrls)
          ? updateData.interiorImageUrls.filter(Boolean)
          : [updateData.interiorImageUrls].filter(Boolean);
      }

      // Remove any undefined values
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });

      console.log('Cleaned update data:', cleanedData);

      await db.update(artworks)
        .set(cleanedData)
        .where(eq(artworks.id, parseInt(req.params.id)));
      
      const updatedArtwork = await db.query.artworks.findFirst({
        where: eq(artworks.id, parseInt(req.params.id)),
      });
      
      console.log('Updated artwork:', updatedArtwork);
      res.json(updatedArtwork);
    } catch (error) {
      console.error("Error updating artwork:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "作品の更新に失敗しました" });
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
  // Exhibitions CRUD endpoints
  app.get("/api/exhibitions", async (req, res) => {
    try {
      const allExhibitions = await db.select().from(exhibitions).orderBy(desc(exhibitions.startDate));
      res.json(allExhibitions);
    } catch (error) {
      console.error("Failed to fetch exhibitions:", error);
      res.status(500).json({ error: "展示会の取得に失敗しました" });
    }
  });

  app.post(`/admin/${ADMIN_URL_PATH}/generate-exhibition-description`, requireAdmin, async (req, res) => {
    try {
      const { title, location } = req.body;
      if (!title || !location) {
        return res.status(400).json({ error: "タイトルと場所が必要です" });
      }

      const { subtitle, description } = await generateExhibitionDescription(title, location);
      console.log('Generated exhibition content:', { subtitle, description });
      res.json({ subtitle, description });
    } catch (error) {
      console.error("Error generating exhibition description:", error);
      res.status(500).json({ error: "説明文の生成に失敗しました" });
    }
  });

  app.post(`/admin/${ADMIN_URL_PATH}/exhibitions`, requireAdmin, upload.array('subImages'), async (req, res) => {
    try {
      console.log('Received exhibition data:', req.body);
      console.log('Received files:', req.files);
      
      const subImageUrls = req.files ? (req.files as Express.Multer.File[]).map(file => `/artworks/${file.filename}`) : [];
      
      const exhibitionData = {
        title: req.body.title,
        subtitle: req.body.subtitle || '',
        description: req.body.description,
        location: req.body.location,
        address: req.body.address || '',
        imageUrl: req.body.imageUrl,
        subImageUrls: subImageUrls,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Attempting to create exhibition with cleaned data:', exhibitionData);

      console.log('Attempting to create exhibition with data:', exhibitionData);

      const [newExhibition] = await db.insert(exhibitions).values(exhibitionData).returning();
      console.log('Successfully created exhibition:', newExhibition);
      res.json(newExhibition);
    } catch (error) {
      console.error("Error creating exhibition:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      res.status(500).json({ 
        error: "展示会の作成に失敗しました",
        details: error instanceof Error ? error.message : "不明なエラー"
      });
    }
  });

  app.put(`/admin/${ADMIN_URL_PATH}/exhibitions/:id`, requireAdmin, upload.array('subImages'), async (req, res) => {
    try {
      const exhibitionId = parseInt(req.params.id);
      const subImageUrls = req.files ? (req.files as Express.Multer.File[]).map(file => `/artworks/${file.filename}`) : undefined;
      
      const updateData = {
        ...req.body,
        subImageUrls: subImageUrls || req.body.subImageUrls,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        updatedAt: new Date(),
      };

      await db.update(exhibitions)
        .set(updateData)
        .where(eq(exhibitions.id, exhibitionId));
      
      const updatedExhibition = await db.query.exhibitions.findFirst({
        where: eq(exhibitions.id, exhibitionId),
      });
      
      res.json(updatedExhibition);
    } catch (error) {
      console.error("Error updating exhibition:", error);
      res.status(500).json({ error: "展示会の更新に失敗しました" });
    }
  });

  app.delete(`/admin/${ADMIN_URL_PATH}/exhibitions/:id`, requireAdmin, async (req, res) => {
    try {
      await db.delete(exhibitions)
        .where(eq(exhibitions.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting exhibition:", error);
      res.status(500).json({ error: "展示会の削除に失敗しました" });
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
      console.error("Error submitting contact form:", error);
      res.status(500).json({ error: "お問い合わせの送信に失敗しました" });
    }
  });
  // Voices CRUD endpoints
  app.get("/api/voices", async (req, res) => {
    try {
      const allVoices = await db.select().from(voices).orderBy(desc(voices.createdAt));
      res.json(allVoices);
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      res.status(500).json({ error: "メッセージの取得に失敗しました" });
    }
  });

  app.post("/api/voices", async (req, res) => {
    try {
      console.log('Received voice data:', req.body);
      const voiceData = {
        name: req.body.name,
        content: req.body.content,
        imageUrl: req.body.imageUrl || null,
        rating: req.body.rating || 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newVoice] = await db.insert(voices).values(voiceData).returning();
      console.log('Voice created successfully:', newVoice);
      res.json(newVoice);
    } catch (error) {
      console.error("Error creating voice:", error);
      res.status(500).json({ 
        error: "メッセージの作成に失敗しました",
        details: error instanceof Error ? error.message : "不明なエラー"
      });
    }
  });

  app.put("/api/voices/:id", async (req, res) => {
    try {
      const voiceId = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      };

      await db.update(voices)
        .set(updateData)
        .where(eq(voices.id, voiceId));
      
      const updatedVoice = await db.query.voices.findFirst({
        where: eq(voices.id, voiceId),
      });
      
      res.json(updatedVoice);
    } catch (error) {
      console.error("Error updating voice:", error);
      res.status(500).json({ error: "メッセージの更新に失敗しました" });
    }
  });

}