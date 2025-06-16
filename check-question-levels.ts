
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

async function checkQuestionLevels() {
  console.log('Checking question levels distribution...');
  
  try {
    // Count questions by level
    const levelCounts = await db.select({ 
      level: schema.questions.questionlevel,
      count: sql<number>`count(*)` 
    })
    .from(schema.questions)
    .groupBy(schema.questions.questionlevel)
    .orderBy(sql`count(*) DESC`);
    
    console.log('\nQuestion count by level:');
    console.log('========================');
    
    let totalWithLevel = 0;
    levelCounts.forEach(row => {
      const level = row.level || 'NULL/Empty';
      console.log(`${level}: ${row.count}`);
      if (row.level && row.level.trim() !== '') {
        totalWithLevel += row.count;
      }
    });
    
    // Count total questions
    const totalQuestions = await db.select({ count: sql<number>`count(*)` }).from(schema.questions);
    
    console.log('\nSummary:');
    console.log('========');
    console.log(`Total questions: ${totalQuestions[0].count}`);
    console.log(`Questions with level data: ${totalWithLevel}`);
    console.log(`Questions without level: ${totalQuestions[0].count - totalWithLevel}`);
    
    // Specific counts for easy, hard, overview
    const specificLevels = ['easy', 'hard', 'overview', 'Easy', 'Hard', 'Overview'];
    
    console.log('\nSpecific level counts:');
    console.log('=====================');
    
    for (const level of specificLevels) {
      const count = await db.select({ count: sql<number>`count(*)` })
        .from(schema.questions)
        .where(sql`LOWER(questionlevel) = ${level.toLowerCase()}`);
      
      if (count[0].count > 0) {
        console.log(`${level}: ${count[0].count}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking question levels:', error);
  } finally {
    await pool.end();
  }
}

checkQuestionLevels().catch(console.error);
