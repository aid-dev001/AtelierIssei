import { defineConfig } from "drizzle-kit";

// 開発環境と本番環境でデータベース接続を切り替え
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // 本番環境では明示的にPRODUCTION_DATABASE_URLが必要
    const productionUrl = process.env.PRODUCTION_DATABASE_URL;
    if (!productionUrl) {
      throw new Error(
        "Production environment requires PRODUCTION_DATABASE_URL to be set for migrations"
      );
    }
    // 本番環境での意図しないマイグレーションを防ぐ
    if (!process.env.ALLOW_PRODUCTION_MIGRATION) {
      throw new Error(
        "Production migrations are disabled. Set ALLOW_PRODUCTION_MIGRATION=true to enable"
      );
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
