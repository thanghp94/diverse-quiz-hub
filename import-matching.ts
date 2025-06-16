import { Pool as PgPool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './shared/schema';

// Source database connection
const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

// Destination database connection
const destPool = new PgPool({ connectionString: process.env.DATABASE_URL });
const destDb = drizzle({ client: destPool, schema });

async function importMatching() {
  try {
    console.log('Importing matching activities...');
    
    // Fetch all matching data
    const matchingQuery = `SELECT * FROM "matching" ORDER BY id`;
    const matchingData = await sourcePool.query(matchingQuery);
    
    console.log(`Found ${matchingData.rows.length} matching activities to import`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const activity of matchingData.rows) {
      try {
        const matchingRecord = {
          id: activity.id,
          type: activity.type,
          subject: activity.subject,
          topic: activity.topic,
          description: activity.description,
          prompt1: activity.prompt1,
          choice1: activity.choice1,
          prompt2: activity.prompt2,
          choice2: activity.choice2,
          prompt3: activity.prompt3,
          choice3: activity.choice3,
          prompt4: activity.prompt4,
          choice4: activity.choice4,
          prompt5: activity.prompt5,
          choice5: activity.choice5,
          prompt6: activity.prompt6,
          choice6: activity.choice6,
          order: activity.order
        };
        
        await destDb.insert(schema.matching).values(matchingRecord).onConflictDoNothing();
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`Imported ${imported} matching activities...`);
        }
        
      } catch (error) {
        console.error(`Error importing matching activity ${activity.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`\nMatching import completed:`);
    console.log(`- Imported: ${imported}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Total processed: ${matchingData.rows.length}`);
    
  } catch (error) {
    console.error('Error importing matching activities:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importMatching();