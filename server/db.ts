import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure websocket for serverless environment
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection with optimized settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 15000,
  maxUses: 7500,
  allowExitOnIdle: false,
});

export const db = drizzle({ client: pool, schema });

// Add a function to wake up the database with retry logic
export async function wakeUpDatabase() {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test database connection with a simple query
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Database connection verified');
      return true;
    } catch (error) {
      lastError = error;
      console.error(`Database wake up attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${attempt * 2000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  
  console.error('Database wake up failed after all retries:', lastError);
  return false;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await pool.end();
  process.exit(0);
});
