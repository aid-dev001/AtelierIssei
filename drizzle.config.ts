import { defineConfig } from "drizzle-kit";

// 開発環境と本番環境でデータベース接続を切り替え
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const productionUrl = process.env.PRODUCTION_DATABASE_URL;
    if (!productionUrl) {
      throw new Error(
        "PRODUCTION_DATABASE_URL must be set in production environment",
      );
    }
    return productionUrl;
  }
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
