import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import * as schema from './shared/schema';
import ws from 'ws';

// Configure neon for WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Setup for source database
const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

// Setup for destination database
const destPool = new Pool({ connectionString: process.env.DATABASE_URL });
const destDb = drizzle({ client: destPool, schema });

async function importRemainingData() {
  console.log('Importing remaining data...');
  
  try {
    // Import images
    console.log('Importing images...');
    const imageQuery = `SELECT 
      id,
      "Imagelink" as imagelink,
      contentid,
      "Default" as "default"
      FROM "image" ORDER BY id`;
    
    const images = await sourcePool.query(imageQuery);
    if (images.rows.length > 0) {
      // Batch insert images
      const batchSize = 100;
      for (let i = 0; i < images.rows.length; i += batchSize) {
        const batch = images.rows.slice(i, i + batchSize);
        await destDb.insert(schema.images).values(batch).onConflictDoNothing();
        console.log(`Imported images batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(images.rows.length/batchSize)}`);
      }
      console.log(`Imported ${images.rows.length} images`);
    }

    // Import questions
    console.log('Importing questions...');
    const questionQuery = `SELECT 
      "ID" as id,
      "noi_dung",
      "cau_tra_loi_1", 
      "cau_tra_loi_2",
      "cau_tra_loi_3",
      "cau_tra_loi_4",
      "correct_choice",
      "explanation",
      "contentid"
      FROM "Question" ORDER BY "ID"`;
    
    const questions = await sourcePool.query(questionQuery);
    if (questions.rows.length > 0) {
      // Batch insert questions
      const batchSize = 50;
      for (let i = 0; i < questions.rows.length; i += batchSize) {
        const batch = questions.rows.slice(i, i + batchSize);
        await destDb.insert(schema.questions).values(batch).onConflictDoNothing();
        console.log(`Imported questions batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(questions.rows.length/batchSize)}`);
      }
      console.log(`Imported ${questions.rows.length} questions`);
    }

    // Import assignments (smaller table)
    console.log('Importing assignments...');
    const assignments = await sourcePool.query('SELECT * FROM assignment ORDER BY id LIMIT 1000');
    if (assignments.rows.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < assignments.rows.length; i += batchSize) {
        const batch = assignments.rows.slice(i, i + batchSize);
        await destDb.insert(schema.assignment).values(batch).onConflictDoNothing();
      }
      console.log(`Imported ${assignments.rows.length} assignments`);
    }

    console.log('Data import completed successfully!');
    
    // Final verification
    const contentCount = await destDb.select().from(schema.content);
    const questionCount = await destDb.select().from(schema.questions);
    const imageCount = await destDb.select().from(schema.images);
    
    console.log('\n=== Final Import Summary ===');
    console.log(`Content: ${contentCount.length}`);
    console.log(`Questions: ${questionCount.length}`);
    console.log(`Images: ${imageCount.length}`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importRemainingData().catch(console.error);