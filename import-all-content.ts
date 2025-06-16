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

async function importAllContent() {
  console.log('Importing all content from source database...');
  
  try {
    // Import content with all fields
    const contentQuery = `SELECT 
      "ID" as id,
      "TopicID" as topicid, 
      "imageID" as imageid,
      "VideoID" as videoid,
      "VideoID2" as videoid2,
      "ChallengeSubject" as challengesubject,
      "ParentID" as parentid,
      "Prompt" as prompt,
      "Information" as information,
      "Title" as title,
      "Short Blurb" as short_blurb,
      "Second Short Blurb" as second_short_blurb,
      "Mindmap" as mindmap,
      "MindmapURL" as mindmapurl,
      "Translation" as translation,
      "Vocabulary" as vocabulary,
      "ClassDone" as classdone,
      "StudentSeen" as studentseen,
      "Show" as show,
      "ShowTranslation" as showtranslation,
      "ShowStudent" as showstudent,
      "Order" as "order",
      "ContentGroup" as contentgroup,
      "TypeOfTaking" as typeoftaking,
      "Short Description" as short_description,
      "URL" as url,
      "Header" as header,
      "Update" as "update",
      "ImageLink" as imagelink
      FROM "Content" ORDER BY "ID"`;
    
    const content = await sourcePool.query(contentQuery);
    console.log(`Found ${content.rows.length} content records in source`);
    
    let imported = 0;
    for (const item of content.rows) {
      try {
        // Clean the data before inserting
        const cleanItem = {
          ...item,
          challengesubject: item.challengesubject ? (Array.isArray(item.challengesubject) ? item.challengesubject : [item.challengesubject]) : null,
          order: item.order ? item.order.toString() : null
        };
        await destDb.insert(schema.content).values(cleanItem).onConflictDoNothing();
        imported++;
        
        if (imported % 100 === 0) {
          console.log(`Imported ${imported} content items...`);
        }
      } catch (error) {
        console.error(`Error importing content ${item.id}:`, error);
      }
    }
    
    console.log(`Successfully imported ${imported} content items`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importAllContent().catch(console.error);