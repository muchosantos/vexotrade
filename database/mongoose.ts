import mongoose from "mongoose";

// u principu ovaj code osigurava dobru konekciju sa bazom. Desava se po defaultu da pri svakoj akciji se otvara nova konekcija sto nije dobro, ovim codom se osigurava da se to ne desava i da se koristi cache verzija svaki put. 

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// hot reload ne stvara novu konekciju, koristi staru
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

// ovo se koristi zbog server actions next.js server actions se restartuju svaki put kada se uspotave nove akcije sto nama ne ide na ruku. Ne zelimo da rekreiramo nvoe vec da koristimo stare

export const connnectToDatabase = async () => {
  // provera da li imamo access
  if (!MONGODB_URI) throw new Error("Mongodb_URI must be set withinit .env");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  console.log(`Connected to DB to ${process.env.NODE_ENV} ${MONGODB_URI}`);
};
