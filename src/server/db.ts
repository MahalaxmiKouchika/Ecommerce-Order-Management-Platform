import dotenv from "dotenv";
dotenv.config({ override: true });

import pg from "pg";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const { Pool } = pg;

// Supabase API credentials
export const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";

export const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Read PostgreSQL / Supabase connection string from environment variables
const rawUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  process.env.SPRING_DATASOURCE_URL;

let connectionString: string | undefined = undefined;
if (rawUrl) {
  // Strip jdbc: prefix if present (e.g. jdbc:postgresql://...)
  connectionString = rawUrl.replace(/^jdbc:/, "");
}

let host = process.env.PGHOST || "localhost";
let port = 5432;

if (process.env.PGPORT) {
  if (process.env.PGPORT.includes(":")) {
    const parts = process.env.PGPORT.split(":");
    if (parts[0] && parts[0] !== "localhost" && parts[0] !== "") {
      host = parts[0];
    }
    port = parseInt(parts[1], 10) || 5432;
  } else {
    const parsed = parseInt(process.env.PGPORT, 10);
    if (!isNaN(parsed)) {
      port = parsed;
    }
  }
}

const user = process.env.PGUSER || "postgres";
const password = process.env.PGPASSWORD || "root";
const database = process.env.PGDATABASE || "ecommerce_db";

const isCloudSsl =
  Boolean(connectionString) &&
  (connectionString!.includes("sslmode=require") ||
    connectionString!.includes("neon.tech") ||
    connectionString!.includes("supabase.co") ||
    connectionString!.includes("supabase.com") ||
    connectionString!.includes("pooler.supabase.com"));

export const pgPool = new Pool(
  connectionString
    ? {
        connectionString,
        connectionTimeoutMillis: 5000,
        ssl: isCloudSsl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host,
        port,
        user,
        password,
        database,
        connectionTimeoutMillis: 3000,
      }
);

export let isPgConnected = false;

export function getDbInfo() {
  const isSupabase =
    (connectionString &&
      (connectionString.includes("supabase.co") ||
        connectionString.includes("supabase.com") ||
        connectionString.includes("pooler.supabase.com"))) ||
    Boolean(supabase);

  const isNeon = connectionString && connectionString.includes("neon.tech");

  return {
    connected: isPgConnected || Boolean(supabase),
    isPgConnected,
    isSupabaseClientConnected: Boolean(supabase),
    provider: isSupabase
      ? "Supabase (Cloud PostgreSQL)"
      : isNeon
      ? "Neon Serverless Postgres"
      : isPgConnected
      ? "PostgreSQL Database"
      : "In-Memory Store (Cloud Ready)",
    host: connectionString ? "Cloud Managed" : `${host}:${port}`,
  };
}

export async function initPostgres(): Promise<boolean> {
  // If connection string is provided, try connecting
  if (!connectionString && !process.env.DATABASE_URL && !process.env.PGHOST) {
    console.log(
      "[Database] No DATABASE_URL or PGHOST provided. Running on in-memory high-speed storage. (Set DATABASE_URL or SUPABASE_URL to connect to Cloud PostgreSQL)."
    );
    return false;
  }

  try {
    const client = await pgPool.connect();
    console.log(
      `[Database] Connected successfully to PostgreSQL database "${database}" (Cloud / Supabase ready)`
    );

    // Initialize tables matching JPA entities if not already created
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address_line TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'PLACED',
        total_amount NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT,
        product_name VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INT NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        tracking_number VARCHAR(255) NOT NULL,
        courier_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_location VARCHAR(255),
        latitude NUMERIC,
        longitude NUMERIC,
        estimated_delivery VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NOT NULL,
        comment TEXT NOT NULL,
        is_verified_purchase BOOLEAN DEFAULT false,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    isPgConnected = true;
    return true;
  } catch (err: any) {
    isPgConnected = false;
    console.warn(
      `[Database] Notice: Could not connect to external PostgreSQL (${err.message}). Using high-performance in-memory fallback store for the cloud preview.`
    );
    return false;
  }
}
