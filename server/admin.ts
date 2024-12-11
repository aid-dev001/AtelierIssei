import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from "../db";
import { adminUsers } from "@db/schema";
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
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.username, ADMIN_USERNAME),
    });

    if (!existingAdmin) {
      await db.insert(adminUsers).values({
        username: ADMIN_USERNAME,
        passwordHash: ADMIN_PASSWORD_HASH,
      });

      console.log('Admin credentials (SAVE THESE SECURELY):');
      console.log(`Admin URL: /admin/${ADMIN_URL_PATH}`);
      console.log(`Username: ${ADMIN_USERNAME}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error('Failed to initialize admin user:', error);
  }
}

// Middleware to check admin authentication
export function requireAdmin(req: any, res: any, next: any) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
