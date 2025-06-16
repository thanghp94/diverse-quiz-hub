
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { readFileSync } from 'fs';
import * as schema from './shared/schema';
import ws from 'ws';

// Configure neon for WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Destination database connection
const destPool = new Pool({ connectionString: process.env.DATABASE_URL });
const destDb = drizzle({ client: destPool, schema });

function parseCSV(csvContent: string) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(';');
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const values = line.split(';');
      const record: any = {};
      
      headers.forEach((header, index) => {
        const cleanHeader = header.replace('﻿', '').trim(); // Remove BOM and whitespace
        record[cleanHeader] = values[index] || null;
      });
      
      records.push(record);
    }
  }
  
  return records;
}

async function importVideoCSV() {
  console.log('Starting video CSV import process...');
  
  try {
    // Read the CSV file
    const csvContent = readFileSync('attached_assets/Video_1750113249025.csv', 'utf-8');
    
    // Parse CSV data
    const records = parseCSV(csvContent);
    
    console.log(`Found ${records.length} video records to import`);
    
    let imported = 0;
    let skipped = 0;
    
    // Process each record
    for (const record of records) {
      try {
        // Map CSV fields to database schema
        const videoData = {
          id: record.id || null,
          topicid: record.topicID || null,
          contentid: record.contentid || null,
          videolink: record.videolink || null,
          videoupload: record.videoupload || null,
          showvideo: record.showvideo || null,
          video_name: record.name || null,
          description: record.description || null,
          first: record.first || null,
          second: record.second || null
        };
        
        // Insert into the database
        await destDb.insert(schema.videos).values(videoData).onConflictDoNothing();
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`Imported ${imported} videos...`);
        }
        
      } catch (error) {
        console.error(`Error importing video ${record.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`\nVideo CSV import completed:`);
    console.log(`- Imported: ${imported}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Total processed: ${records.length}`);
    
  } catch (error) {
    console.error('Error during video CSV import:', error);
  } finally {
    await destPool.end();
  }
}

importVideoCSV().catch(console.error);
