export const env = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  DATABASE_URL: process.env.DATABASE_URL || "./database/instapreview.db",
};

export function assertEnv() {
  const missing: string[] = [];
  if (!env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!env.JWT_SECRET) missing.push("JWT_SECRET");
  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(", ")}. Set them in .env.local`
    );
  }
}
