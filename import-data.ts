import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import * as schema from './shared/schema';
import ws from 'ws';

// Configure neon for WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Setup for source database - handle different connection string formats
let sourcePool: any;
let isNeonSource = false;

const sourceUrl = process.env.SOURCE_DATABASE_URL;
if (sourceUrl?.includes('postgresql://') || sourceUrl?.includes('postgres://')) {
  if (sourceUrl.includes('neon.tech') || sourceUrl.includes('supabase.co')) {
    // Use Neon client for Neon/Supabase
    sourcePool = new Pool({ connectionString: sourceUrl });
    isNeonSource = true;
  } else {
    // Use regular pg Pool for other PostgreSQL databases
    sourcePool = new PgPool({ connectionString: sourceUrl });
  }
} else {
  // Assume it's an IP and try to construct a connection string
  console.log('Detected IP address format. Please provide the full connection details.');
  process.exit(1);
}

// Setup for destination database (current Replit database)
const destPool = new Pool({ connectionString: process.env.DATABASE_URL });
const destDb = drizzle({ client: destPool, schema });

async function importData() {
  console.log('Starting data import...');
  
  try {
    // Import topics
    console.log('Importing topics...');
    const topics = await sourcePool.query('SELECT * FROM topic ORDER BY id');
    if (topics.rows.length > 0) {
      for (const topic of topics.rows) {
        await destDb.insert(schema.topics).values(topic).onConflictDoNothing();
      }
      console.log(`Imported ${topics.rows.length} topics`);
    }

    // Import content
    console.log('Importing content...');
    const content = await sourcePool.query('SELECT * FROM content ORDER BY id');
    if (content.rows.length > 0) {
      for (const item of content.rows) {
        await destDb.insert(schema.content).values(item).onConflictDoNothing();
      }
      console.log(`Imported ${content.rows.length} content items`);
    }

    // Import images
    console.log('Importing images...');
    const images = await sourcePool.query('SELECT * FROM image ORDER BY id');
    if (images.rows.length > 0) {
      for (const image of images.rows) {
        await destDb.insert(schema.images).values(image).onConflictDoNothing();
      }
      console.log(`Imported ${images.rows.length} images`);
    }

    // Import questions
    console.log('Importing questions...');
    const questions = await sourcePool.query('SELECT * FROM question ORDER BY id');
    if (questions.rows.length > 0) {
      for (const question of questions.rows) {
        await destDb.insert(schema.questions).values(question).onConflictDoNothing();
      }
      console.log(`Imported ${questions.rows.length} questions`);
    }

    // Import matching activities
    console.log('Importing matching activities...');
    const matching = await sourcePool.query('SELECT * FROM matching ORDER BY id');
    if (matching.rows.length > 0) {
      for (const match of matching.rows) {
        await destDb.insert(schema.matching).values(match).onConflictDoNothing();
      }
      console.log(`Imported ${matching.rows.length} matching activities`);
    }

    // Check for additional tables
    const tableQuery = `
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT IN ('topic', 'content', 'image', 'question', 'matching')
      ORDER BY table_name;
    `;
    
    const additionalTables = await sourcePool.query(tableQuery);
    if (additionalTables.rows.length > 0) {
      console.log('\nAdditional tables found:');
      for (const table of additionalTables.rows) {
        const count = await sourcePool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
        console.log(`- ${table.table_name}: ${count.rows[0].count} records`);
      }
    }

    console.log('Data import completed successfully!');
    
    // Verify import
    const topicCount = await destDb.select().from(schema.topics);
    const contentCount = await destDb.select().from(schema.content);
    const questionCount = await destDb.select().from(schema.questions);
    const imageCount = await destDb.select().from(schema.images);
    const matchingCount = await destDb.select().from(schema.matching);
    
    console.log('\n=== Import Summary ===');
    console.log(`Topics: ${topicCount.length}`);
    console.log(`Content: ${contentCount.length}`);
    console.log(`Questions: ${questionCount.length}`);
    console.log(`Images: ${imageCount.length}`);
    console.log(`Matching: ${matchingCount.length}`);
    
  } catch (error) {
    console.error('Error during data import:', error);
    throw error;
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importData().catch(console.error);