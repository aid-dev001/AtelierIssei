import { defineConfig } from "drizzle-kit";

// 開発環境と本番環境でデータベース接続を切り替え
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const productionUrl = process.env.PRODUCTION_DATABASE_URL;
    if (!productionUrl) {
      console.warn("PRODUCTION_DATABASE_URL is not set, falling back to DATABASE_URL");
      return process.env.DATABASE_URL;
    }
    console.log("Using production database for migrations");
    return productionUrl;
  }
  console.log("Using development database for migrations");
  return process.env.DATABASE_URL;
};

const dbUrl = getDatabaseUrl();
if (!dbUrl) {
  throw new Error("Database URL must be set, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
