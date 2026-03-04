import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

let db: Database.Database | null = null;

function ensureDirs() {
  const dbPath = env.DATABASE_URL;
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });
}

function migrate(database: Database.Database) {
  database.pragma("foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      type TEXT CHECK(type IN ('single','carousel','video')) NOT NULL,
      position INTEGER CHECK(position BETWEEN 1 AND 4),
      caption TEXT,
      hashtags TEXT,
      likes_count INTEGER DEFAULT 0,
      file_count INTEGER DEFAULT 1,
      storage_path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      UNIQUE(client_id, position)
    );

    CREATE INDEX IF NOT EXISTS idx_posts_client ON posts(client_id);
    CREATE INDEX IF NOT EXISTS idx_posts_position ON posts(client_id, position);
    CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
  `);
}

export function getDb() {
  if (db) return db;
  ensureDirs();
  db = new Database(env.DATABASE_URL);
  migrate(db);
  return db;
}

export type Client = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  client_id: string;
  type: "single" | "carousel" | "video";
  position: number;
  caption: string | null;
  hashtags: string | null;
  likes_count: number;
  file_count: number;
  storage_path: string;
  created_at: string;
  updated_at: string;
};
