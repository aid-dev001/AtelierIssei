import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }
  if (process.env.NODE_ENV === 'production') {
    console.log("Using production database (DATABASE_URL)");
  } else {
    console.log("Using development database (DATABASE_URL)");
  }
  return url;
};

const dbUrl = getDatabaseUrl();

export const db = drizzle({
  connection: dbUrl,
  schema,
  ws: ws,
});
