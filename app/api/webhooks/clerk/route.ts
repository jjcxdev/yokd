import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

export async function POST(req: Request) {
  console.log("Webhook endpoint hit");

  try{
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("No webhook secret found");
    return new Response(
      JSON.stringify({error: "Missing webhook secret"}),
      {
        status: 300,
        headers:{"Content-Type": "application/json"}
      }
    );
  }

  // log headers
  const headerPayLoad = await headers();
  const svix_id = headerPayLoad.get("svix-id");
  const svix_timestamp = headerPayLoad.get("svix-timestamp");
  const svix_signature = headerPayLoad.get("svix-signature");

  console.log("Received headers:", {svix_id, svix_timestamp});

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response(
      JSON.stringify({error: "Missing svix headers"}),
      {
        status:400,
        headers:{"Content-Type": "application/json"}
      }
    );
  }

  // get the body
  const payload = await req.json();
  console.log("Received payload:", JSON.stringify(payload, null, 2));

  // verify the webhook
  console.log("Attempting verification with:", {
    secret: WEBHOOK_SECRET.substring(0,4) + "...",
    headers:{
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }
  });

  const wh = new Webhook(WEBHOOK_SECRET);
  const evt = wh.verify(JSON.stringify(payload), {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  }) as WebhookEvent;

  console.log("Verification successful, event type:", evt.type);

  // handle the events
  switch (evt.type){
    case "user.created":
      console.log("Processing user.created event");
      await db.insert(users).values({
        id: evt.data.id,
        createdAt: new Date(evt.data.created_at).getTime(),
      });
      break;

      case "session.created":
        console.log("Processing session.created event");
        await db.insert(sessions).values({
          id: evt.data.id,
          userId: evt.data.user_id,
          expiresAt: new Date(evt.data.expire_at).getTime(),
        });
        break;
  }

  return new Response(
    JSON.stringify({success: true}),
    {
      status:200,
      headers:{"Content-Type": "application/json"}
    }
  );

  } catch (err: unknown) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({error:err instanceof Error ? err.message: "Unknown error occured"}),
      {
        status:500,
        headers: {"Content-Type": "application/json"}
      }
    );
  }
}
