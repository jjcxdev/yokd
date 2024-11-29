'use server'

import { db } from "@/lib/db"
import { folders } from "@/lib/db/schema"
import { asc } from "drizzle-orm";

export async function createFolderAction(name: string, userId: string){
    const folderData = {
        id: crypto.randomUUID(),
        name,
        userId,
    };

    await db.insert(folders).values(folderData)
}

export async function fetchFolders() {
    const data = await db
    .select()
    .from(folders)
    .orderBy((folders) =>[asc(folders.name), asc(folders.createdAt)]);
    return data;
}