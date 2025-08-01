import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create PostgreSQL connection
const client = postgres(databaseUrl);

// Create Drizzle instance
export const db = drizzle(client);

export { client as sql };
