import mongoose from "mongoose";

let cached = (global as unknown as { mongoose: typeof mongoose | null }).mongoose;

if (!cached) {
  cached = (global as unknown as { mongoose: typeof mongoose | null }).mongoose = null;
}

// Track connection state
let lastConnectionError = false;
let lastErrorTime = 0;
let lastErrorType: "timeout" | "auth" | "network" | "other" = "other";

// Use a promise-based approach to handle concurrent connection attempts
let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Extract the database name from a MongoDB URI.
 * For SRV: mongodb+srv://user:pass@cluster.mongodb.net/myDb?options → myDb
 * For standard: mongodb://user:pass@host:port/myDb?options → myDb
 */
function extractDbName(uri: string): string {
  try {
    // Remove query params
    const withoutQuery = uri.split("?")[0];
    // Get the part after the last '/'
    const parts = withoutQuery.split("/");
    if (parts.length >= 4) {
      // For SRV: mongodb+srv://user:pass@host/dbName
      // For standard: mongodb://user:pass@host:port/dbName
      const db = parts[parts.length - 1];
      if (db && !db.includes(":") && !db.includes("@") && !db.includes(".")) {
        return db;
      }
    }
    return "portfolio";
  } catch {
    return "portfolio";
  }
}

export async function connectDB() {
  // Already connected
  if (cached && cached.connections[0].readyState === 1) {
    return cached;
  }

  // If connection failed recently, apply cooldown
  if (lastConnectionError && Date.now() - lastErrorTime < getCooldownMs()) {
    throw new Error("MongoDB unavailable. Will retry shortly.");
  }

  // If already connecting, wait for the existing connection attempt
  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGO_URI!;
  const isAtlas = uri.includes("mongodb.net") || uri.includes("mongodb+srv://");
  const dbName = extractDbName(uri);

  const opts = {
    bufferCommands: true,
    maxPoolSize: 10,
    // For Atlas: longer timeouts to handle slow internet
    // For local: shorter timeouts since it should be fast
    serverSelectionTimeoutMS: isAtlas ? 30000 : 3000,
    socketTimeoutMS: isAtlas ? 60000 : 45000,
    connectTimeoutMS: isAtlas ? 15000 : 3000,
    // Atlas needs these for SRV record resolution
    ...(isAtlas ? { family: 4 } : {}),
    // Explicitly set database name to ensure correct DB
    dbName,
  };

  connectionPromise = mongoose.connect(uri, opts)
    .then((conn) => {
      console.log(`MongoDB connected successfully to database: ${conn.connection.name}`);
      cached = conn;
      lastConnectionError = false;
      lastErrorType = "other";
      connectionPromise = null;
      return conn;
    })
    .catch((error) => {
      lastConnectionError = true;
      lastErrorTime = Date.now();
      connectionPromise = null;

      // Categorize error for better cooldown handling
      const errMsg = error?.message || "";
      if (errMsg.includes("whitelist") || errMsg.includes("IP") || errMsg.includes("authentication") || errMsg.includes("auth")) {
        lastErrorType = "auth";
        console.error("MongoDB auth/IP error — check your Atlas IP whitelist and credentials:", errMsg);
      } else if (errMsg.includes("timed out") || errMsg.includes("Timeout")) {
        lastErrorType = "timeout";
        console.error("MongoDB connection timeout — slow internet or unreachable server:", errMsg);
      } else if (errMsg.includes("ECONNREFUSED") || errMsg.includes("ECONNRESET")) {
        lastErrorType = "network";
        console.error("MongoDB network error:", errMsg);
      } else {
        lastErrorType = "other";
        console.error("MongoDB connection failed:", errMsg);
      }

      throw error;
    });

  return connectionPromise;
}

/**
 * Dynamic cooldown based on error type:
 * - Auth/IP whitelist errors: 60s (user needs to fix Atlas settings)
 * - Timeout errors: 5s (might just be slow internet, retry soon)
 * - Network errors: 10s (might be temporary)
 * - Other errors: 15s
 */
function getCooldownMs(): number {
  switch (lastErrorType) {
    case "auth": return 60000;
    case "timeout": return 5000;
    case "network": return 10000;
    default: return 15000;
  }
}

export function isMongoConfigured(): boolean {
  const uri = process.env.MONGO_URI;
  if (!uri) return false;
  // Atlas URLs are always considered configured
  if (uri.includes("mongodb.net") || uri.includes("mongodb+srv://")) return true;
  // For local MongoDB, check if we had a recent failure
  if (lastConnectionError && Date.now() - lastErrorTime < getCooldownMs()) return false;
  return true;
}

export function isConnected(): boolean {
  return !!(cached && cached.connections[0].readyState === 1);
}

export function getConnectionErrorType(): string {
  return lastErrorType;
}
