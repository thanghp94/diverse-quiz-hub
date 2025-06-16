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

async function importVideos() {
  try {
    console.log('Importing videos...');
    
    // Fetch all video data
    const videoQuery = `SELECT * FROM "Video" ORDER BY id`;
    const videoData = await sourcePool.query(videoQuery);
    
    console.log(`Found ${videoData.rows.length} videos to import`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const video of videoData.rows) {
      try {
        const videoRecord = {
          id: video.id,
          topicid: video.topicID,
          contentid: video.contentID,
          videolink: video.VideoLink,
          videoupload: video.VideoUpload,
          showvideo: video.ShowVideo,
          video_name: video.Name,
          description: video.Description,
          first: video.First,
          second: video.Second
        };
        
        await destDb.insert(schema.videos).values(videoRecord).onConflictDoNothing();
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`Imported ${imported} videos...`);
        }
        
      } catch (error) {
        console.error(`Error importing video ${video.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`\nVideo import completed:`);
    console.log(`- Imported: ${imported}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Total processed: ${videoData.rows.length}`);
    
  } catch (error) {
    console.error('Error importing videos:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importVideos();