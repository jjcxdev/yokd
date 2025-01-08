import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// console.log('All env vars:', process.env);
// console.log('Checking Turso URL:', process.env.TURSO_CONNECTION_URL);
// console.log('Checking Turso Token:', process.env.TURSO_AUTH_TOKEN);

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_AUTH_TOKEN is not defined");
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);
