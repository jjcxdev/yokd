'use server'

import { db } from "@/lib/db"
import { folders } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm";

export async function createFolder(name: string, userId: string){
    const folderData = {
        id: crypto.randomUUID(),
        name,
        userId,
        createdAt:Date.now(),
    };

    await db.insert(folders).values(folderData)
}

export async function fetchFolders() {
    const data = await db
    .select()
    .from(folders)
    .orderBy((folders) =>[asc(folders.createdAt), asc(folders.name)]);
    return data;
}

export async function deleteFolder(folderId:string){
    const data = await db
    .delete(folders)
    .where(eq(folders.id, folderId));
}