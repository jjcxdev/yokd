'use server'

import { db } from "@/lib/db"
import { folders } from "@/lib/db/schema"

export async function createFolderAction(name: string, userId: string){
    const folderData = {
        id: crypto.randomUUID(),
        name,
        userId,
    };

    await db.insert(folders).values(folderData)
}