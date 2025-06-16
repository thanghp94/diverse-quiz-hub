
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Configure neon for WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function checkQuestionsStats() {
  console.log('Checking questions table statistics...');
  
  try {
    // Count total rows in questions table
    const totalCount = await db.select({ count: sql<number>`count(*)` }).from(schema.questions);
    console.log(`Total rows in questions table: ${totalCount[0].count}`);
    
    // Check if questionlevel has any non-null entries
    const questionLevelCount = await db.select({ count: sql<number>`count(*)` })
      .from(schema.questions)
      .where(sql`questionlevel IS NOT NULL AND questionlevel != ''`);
    console.log(`Rows with questionlevel data: ${questionLevelCount[0].count}`);
    
    // Show sample questionlevel values
    const sampleLevels = await db.select({ 
      id: schema.questions.id,
      questionlevel: schema.questions.questionlevel 
    })
    .from(schema.questions)
    .where(sql`questionlevel IS NOT NULL AND questionlevel != ''`)
    .limit(10);
    
    console.log('\nSample questionlevel values:');
    sampleLevels.forEach(row => {
      console.log(`- ID: ${row.id}, Level: ${row.questionlevel}`);
    });
    
    // Check unique questionlevel values
    const uniqueLevels = await db.selectDistinct({ 
      questionlevel: schema.questions.questionlevel 
    })
    .from(schema.questions)
    .where(sql`questionlevel IS NOT NULL AND questionlevel != ''`);
    
    console.log('\nUnique questionlevel values:');
    uniqueLevels.forEach(row => {
      console.log(`- ${row.questionlevel}`);
    });
    
  } catch (error) {
    console.error('Error checking questions stats:', error);
  } finally {
    await pool.end();
  }
}

checkQuestionsStats().catch(console.error);
