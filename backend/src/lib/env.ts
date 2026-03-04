export const env = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

export function assertEnv() {
  const missing: string[] = [];
  if (!env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!env.JWT_SECRET) missing.push("JWT_SECRET");
  if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  
  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(", ")}. Set them in .env.local`
    );
  }
}
