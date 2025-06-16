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

async function importQuestions() {
  console.log('Importing questions...');
  
  try {
    const questionQuery = `SELECT 
      "ID" as id,
      "Noi_dung" as noi_dung,
      "Cau_tra_loi_1" as cau_tra_loi_1, 
      "Cau_tra_loi_2" as cau_tra_loi_2,
      "Cau_tra_loi_3" as cau_tra_loi_3,
      "Cau_tra_loi_4" as cau_tra_loi_4,
      "Correct_choice" as correct_choice,
      "Explanation" as explanation,
      "ContentID" as contentid
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

    console.log('Questions import completed successfully!');
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importQuestions().catch(console.error);