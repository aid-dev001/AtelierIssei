import { pgTable, text, integer, timestamp, numeric, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { pgTable, text, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
// Admin Users table for secure authentication
export const adminUsers = pgTable("admin_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const artworks = pgTable("artworks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  price: numeric("price").notNull(),
  size: text("size"),
  status: text("status").notNull().default('available'),
  createdLocation: text("created_location").notNull().default('銀座'),
  storedLocation: text("stored_location").notNull().default('銀座'),
  exhibitionLocation: text("exhibition_location"),
  interiorImageUrls: text("interior_image_urls").array(),
  interiorImageDescriptions: text("interior_image_descriptions").array().notNull().default(['', '']),
  isAvailable: boolean("is_available").default(true).notNull(),
  collectionId: integer("collection_id").references(() => collections.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull().default('/artworks/placeholder.png'),
  year: integer("year").notNull().default(new Date().getFullYear()),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const exhibitions = pgTable("exhibitions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  details: text("details"),
  location: text("location").notNull(),
  address: text("address"),
  imageUrl: text("image_url").notNull(),
  subImageUrls: text("sub_image_urls").array(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  quote: text("quote").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const atelierPosts = pgTable("atelier_posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  location: text("location").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  period: text("period").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const news = pgTable("news", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const artwork_images = pgTable("artwork_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  image_data: text("image_data").notNull(),
  filename: text("filename").notNull(),
  mime_type: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export schemas and types
export const insertAdminUserSchema = createInsertSchema(adminUsers);
export const selectAdminUserSchema = createSelectSchema(adminUsers);
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = z.infer<typeof selectAdminUserSchema>;

export const insertArtworkSchema = createInsertSchema(artworks);
export const selectArtworkSchema = createSelectSchema(artworks);
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = z.infer<typeof selectArtworkSchema>;

export const insertCollectionSchema = createInsertSchema(collections);
export const selectCollectionSchema = createSelectSchema(collections);
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = z.infer<typeof selectCollectionSchema>;

export const insertExhibitionSchema = createInsertSchema(exhibitions);
export const selectExhibitionSchema = createSelectSchema(exhibitions);
export type InsertExhibition = z.infer<typeof insertExhibitionSchema>;
export type Exhibition = z.infer<typeof selectExhibitionSchema>;

export const insertTestimonialSchema = createInsertSchema(testimonials);
export const selectTestimonialSchema = createSelectSchema(testimonials);
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = z.infer<typeof selectTestimonialSchema>;

export const insertAtelierPostSchema = createInsertSchema(atelierPosts);
export const selectAtelierPostSchema = createSelectSchema(atelierPosts);
export type InsertAtelierPost = z.infer<typeof insertAtelierPostSchema>;
export type AtelierPost = z.infer<typeof selectAtelierPostSchema>;

export const insertNewsSchema = createInsertSchema(news);
export const selectNewsSchema = createSelectSchema(news);
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = z.infer<typeof selectNewsSchema>;

export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = z.infer<typeof selectContactSchema>;
