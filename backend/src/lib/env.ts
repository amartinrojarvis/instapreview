// Lee variables directamente de process.env cada vez (para Vercel)
export const env = {
  get ADMIN_PASSWORD() { return process.env.ADMIN_PASSWORD || ""; },
  get JWT_SECRET() { return process.env.JWT_SECRET || ""; },
  get NEXT_PUBLIC_SUPABASE_URL() { return process.env.NEXT_PUBLIC_SUPABASE_URL || ""; },
  get SUPABASE_SERVICE_ROLE_KEY() { return process.env.SUPABASE_SERVICE_ROLE_KEY || ""; },
};

export function assertEnv() {
  const missing: string[] = [];
  if (!env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!env.JWT_SECRET) missing.push("JWT_SECRET");
  if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  
  if (missing.length) {
    throw new Error(
      `Missing required env vars: ${missing.join(", ")}`
    );
  }
}
