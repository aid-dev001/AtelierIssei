import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from "../db";
import { eq } from "drizzle-orm";

// Generate a random string for the admin URL path
export const ADMIN_URL_PATH = crypto.randomBytes(32).toString('hex');

// Generate a random username and password
const ADMIN_USERNAME = `admin_${crypto.randomBytes(8).toString('hex')}`;
const ADMIN_PASSWORD = crypto.randomBytes(16).toString('base64');

// Hash the password for storage
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Function to initialize the admin user
export async function initializeAdmin() {
  try {
    const result = await db.execute(
      "SELECT * FROM admin_users WHERE username = $1",
      [ADMIN_USERNAME]
    );
    const existingAdmin = result.rows[0];

    if (!existingAdmin) {
      await db.execute(
        "INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)",
        [ADMIN_USERNAME, ADMIN_PASSWORD_HASH]
      );

      console.log('管理者アカウント情報 (この情報は安全に保管してください):');
      console.log(`管理者URL: /admin/${ADMIN_URL_PATH}`);
      console.log(`ユーザー名: ${ADMIN_USERNAME}`);
      console.log(`パスワード: ${ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error('管理者ユーザーの初期化に失敗しました:', error);
  }
}

// Middleware to check admin authentication
export function requireAdmin(req: any, res: any, next: any) {
  if (req.session?.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
