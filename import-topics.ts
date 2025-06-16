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

async function importTopics() {
  console.log('Importing topics...');
  
  try {
    // First check the structure of Topic table
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Topic' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const columns = await sourcePool.query(columnsQuery);
    console.log('Topic table columns:');
    for (const column of columns.rows) {
      console.log(`- ${column.column_name}: ${column.data_type}`);
    }

    // Import topics with proper column mapping
    const topicQuery = `SELECT 
      "ID" as id,
      "Topic" as topic,
      "Short Summary" as short_summary,
      "ChallengeSubject" as challengesubject,
      "Image" as image,
      "ParentID" as parentid,
      "ShowStudent" as showstudent
      FROM "Topic" ORDER BY "ID"`;
    
    const topics = await sourcePool.query(topicQuery);
    
    if (topics.rows.length > 0) {
      // Clean and import topics
      for (const topic of topics.rows) {
        const cleanTopic = {
          ...topic,
          topic: topic.topic || topic.id, // Use ID as topic name if topic is null
          showstudent: topic.showstudent === true || topic.showstudent === 'true'
        };
        
        await destDb.insert(schema.topics).values(cleanTopic).onConflictDoNothing();
      }
      console.log(`Imported ${topics.rows.length} topics`);
    }

    console.log('Topics import completed successfully!');
    
    // Verify import
    const importedTopics = await destDb.select().from(schema.topics);
    console.log(`Verification: ${importedTopics.length} topics now in database`);
    
    // Show sample of imported topics
    console.log('\nSample imported topics:');
    for (const topic of importedTopics.slice(0, 5)) {
      console.log(`- ${topic.id}: ${topic.topic}`);
    }
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importTopics().catch(console.error);