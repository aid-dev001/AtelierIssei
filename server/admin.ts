import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from "../db";
import { eq } from "drizzle-orm";
import { adminUsers } from "@db/schema";

// Generate a random string for the admin URL path
export const ADMIN_URL_PATH = "6f4e2d1c3b8a9f7e5d2c1b4a8f7e3d2c1b4a8f7e3d2c1b4a8f7e3d2c1b4a8f";

// Fixed admin credentials
const ADMIN_USERNAME = 'admin_dae63fa78d78a44b';
const ADMIN_PASSWORD = 'gq+qhZZx7Tt06r1FDiI2QQ==';

// Hash the password for storage
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Function to initialize the admin user
export async function initializeAdmin() {
  try {
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, ADMIN_USERNAME),
    });

    if (!existingAdmin) {
      await db.insert(adminUsers).values({
        username: ADMIN_USERNAME,
        passwordHash: ADMIN_PASSWORD_HASH,
      });

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
