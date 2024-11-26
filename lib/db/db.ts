import { auth } from "@clerk/nextjs/server";
import { createClient as createLibSQLClient } from "@libsql/client";
import { createClient as createTursoClient } from "@tursodatabase/api";
import md5 from "md5";

// client for connecting and querying database
export const turso = createLibSQLClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// client for managing database
const tursoAdmin = createTursoClient({
  token: process.env.TURSO_USER_API_TOKEN!,
  org: process.env.TURSO_ORG_NAME!,
});

export async function getDatabaseName() {
  const { userId } = await auth();
  if (!userId) return null;
  return md5(userId);
}

export async function checkDatabaseExists() {
  const dbName = await getDatabaseName();
  if (!dbName) return false;

  try {
    await tursoAdmin.databases.get(dbName);
    return true;
  } catch {
    return false;
  }
}
