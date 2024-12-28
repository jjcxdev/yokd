import type { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  console.log("Webhook endpoint hit");
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("No webhook secret found");
      return new Response(JSON.stringify({ error: "Missing webhook secret" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // log headers
    const headerPayLoad = await headers();
    const svix_id = headerPayLoad.get("svix-id");
    const svix_timestamp = headerPayLoad.get("svix-timestamp");
    const svix_signature = headerPayLoad.get("svix-signature");
    console.log("Received headers:", { svix_id, svix_timestamp });

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing svix headers");
      return new Response(JSON.stringify({ error: "Missing svix headers" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // get the body
    const payload = await req.json();
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    // verify the webhook
    console.log("Attempting verification with:", {
      secret: WEBHOOK_SECRET.substring(0, 4) + "...",
      headers: {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      },
    });

    const wh = new Webhook(WEBHOOK_SECRET);
    const evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Verification successful, event type:", evt.type);

    // handle the events
    if (evt.type === "user.created") {
      console.log("Processing user.created event");
      const timestamp = new Date(evt.data.created_at).getTime();
      await db.insert(users).values({
        id: evt.data.id,
        createdAt: timestamp,
        updatedAt: timestamp, // Set initial updatedAt to same as createdAt
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
