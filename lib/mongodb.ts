import { MongoClient, type Db } from "mongodb";

/* Single shared client (survives Next.js hot reloads in dev). URI comes from .env only.
   After a failed connection we fail fast for 30 s so pages never hang on an unreachable database. */
const g = globalThis as unknown as { _mongo?: Promise<MongoClient>; _mongoDownUntil?: number };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (g._mongoDownUntil && Date.now() < g._mongoDownUntil) throw new Error("MongoDB temporarily unavailable");
  if (!g._mongo) {
    g._mongo = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 }).connect().catch((e) => {
      g._mongo = undefined;
      g._mongoDownUntil = Date.now() + 30_000;
      throw e;
    });
  }
  return g._mongo;
}

export async function getDb(): Promise<Db> {
  return (await client()).db(process.env.MONGODB_DB || "threatx");
}

export async function disconnectFromMongoDB() {
  if (g._mongo) { await (await g._mongo).close(); g._mongo = undefined; }
}
