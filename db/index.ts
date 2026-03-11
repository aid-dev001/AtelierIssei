import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const productionUrl = process.env.PRODUCTION_DATABASE_URL;
    if (!productionUrl) {
      throw new Error(
        "Production environment requires PRODUCTION_DATABASE_URL to be set"
      );
    }
    console.log("Using production database (PRODUCTION_DATABASE_URL)");
    return productionUrl;
  }
  const devUrl = process.env.DATABASE_URL;
  if (!devUrl) {
    throw new Error(
      "Development environment requires DATABASE_URL to be set"
    );
  }
  console.log("Using development database (DATABASE_URL)");
  return devUrl;
};

const dbUrl = getDatabaseUrl();

export const db = drizzle({
  connection: dbUrl,
  schema,
  ws: ws,
});
