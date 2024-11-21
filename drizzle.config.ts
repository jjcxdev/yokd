import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// load envs
dotenv.config();

console.log('Environment variables:',{
	DATABASE_URL: process.env.DATABASE_URL,
	DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN 
});

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!process.env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',

	dbCredentials: {
		url: process.env.DATABASE_URL,
		authToken: process.env.DATABASE_AUTH_TOKEN
	},

	verbose: true,
	strict: true,
	driver: 'turso',
	dialect: 'sqlite'
});
