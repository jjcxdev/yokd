import { createClient } from '@tursodatabase/api';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import md5 from 'md5';

const turso = createClient({
  token: process.env.TURSO_USER_API_TOKEN!,
  org: process.env.TURSO_ORG_NAME!,
});

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET){
    throw new Error ('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature){
    return new Response('Error: Missing svix headers', {status: 400});
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Webhook verification failed', { status: 400 });
  }

  if (evt.type === 'user.created') {
    const databaseName = md5(evt.data.id);

    try {
      await turso.databases.create(databaseName, {
        schema: process.env.TURSO_SCHEMA_DATABASE_NAME!,
      });
    } catch (err) {
      return new Response('Database creation failed', { status: 500 });
    }
  }
}