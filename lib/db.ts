import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// In development, Next.js reloads your code on every save. Without this cache,
// each reload would open a NEW database connection until MongoDB refuses more.
// Saving the connection on `globalThis` keeps one connection across reloads.
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { mongoose?: MongooseCache };
const cached: MongooseCache =
  globalForMongoose.mongoose ?? (globalForMongoose.mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is missing from .env.local");

  // Already connected: reuse it
  if (cached.conn) return cached.conn;

  // Not connected yet: start connecting (only once, even if called many times at the same moment)
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "lunexa", // the database name inside your cluster
      bufferCommands: false, // fail fast instead of waiting if there's no connection
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // allow a retry next time
    throw error;
  }

  return cached.conn;
}