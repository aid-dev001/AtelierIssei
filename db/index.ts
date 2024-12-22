import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

// 開発環境と本番環境でデータベース接続を切り替え
const getDatabaseUrl = () => {
  // NODE_ENV が production の場合は本番用データベースを使用
  if (process.env.NODE_ENV === 'production') {
    const productionUrl = process.env.PRODUCTION_DATABASE_URL;
    if (!productionUrl) {
      console.warn("PRODUCTION_DATABASE_URL is not set, falling back to DATABASE_URL");
      return process.env.DATABASE_URL;
    }
    console.log("Using production database");
    return productionUrl;
  }
  // それ以外の場合は開発用データベースを使用
  console.log("Using development database");
  return process.env.DATABASE_URL;
};

const dbUrl = getDatabaseUrl();
if (!dbUrl) {
  throw new Error(
    "Database URL must be set. Did you forget to provision a database?",
  );
}

export const db = drizzle({
  connection: dbUrl,
  schema,
  ws: ws,
});
