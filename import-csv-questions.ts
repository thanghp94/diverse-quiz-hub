
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema';
import { readFileSync } from 'fs';
import ws from 'ws';

// Configure neon for WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Setup for destination database
const destPool = new Pool({ connectionString: process.env.DATABASE_URL });
const destDb = drizzle({ client: destPool, schema });

function parseCSV(csvContent: string) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(';');
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(';');
    const record: any = {};
    
    headers.forEach((header, index) => {
      record[header.trim()] = values[index] ? values[index].trim() : null;
    });
    
    records.push(record);
  }
  
  return records;
}

async function clearExistingQuestions() {
  console.log('Clearing existing question data...');
  
  try {
    // Delete all existing questions
    await destDb.delete(schema.questions);
    console.log('All existing questions removed successfully');
  } catch (error) {
    console.error('Error clearing questions:', error);
    throw error;
  }
}

async function importCSVQuestions() {
  console.log('Starting CSV import process...');
  
  try {
    // First, clear existing questions
    await clearExistingQuestions();
    
    // Read the CSV file
    const csvContent = readFileSync('attached_assets/Question (3)_1750062204084.csv', 'utf-8');
    
    // Parse CSV data
    const records = parseCSV(csvContent);
    
    console.log(`Found ${records.length} records to import`);
    
    let imported = 0;
    let skipped = 0;
    
    // Process each record
    for (const record of records) {
      try {
        // Map CSV fields to database schema
        const questionData = {
          id: record.id,
          noi_dung: record.noi_dung,
          cau_tra_loi_1: record.cau_tra_loi_1,
          cau_tra_loi_2: record.cau_tra_loi_2,
          cau_tra_loi_3: record.cau_tra_loi_3,
          cau_tra_loi_4: record.cau_tra_loi_4,
          correct_choice: record.correct_choice,
          explanation: record.explanation,
          contentid: record.contentid,
          // Additional fields from CSV
          topic: record.topic,
          questionlevel: record.questionlevel,
          question_type: record.question_type,
          video: record.video,
          picture: record.picture,
          writing_choice: record.writing_choice,
          time: record.time,
          questionorder: record.questionorder,
          translation: record.translation,
          update: record.update,
          tg_tao: record.tg_tao,
          answer: record.answer,
          randomorder: record.randomorder
        };
        
        // Insert into the database
        await destDb.insert(schema.questions).values(questionData);
        imported++;
        
        if (imported % 10 === 0) {
          console.log(`Imported ${imported} questions...`);
        }
        
      } catch (error) {
        console.error(`Error importing question ${record.id}:`, error);
        skipped++;
      }
    }
    
    console.log(`\nCSV import completed:`);
    console.log(`- Imported: ${imported}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Total processed: ${records.length}`);
    
  } catch (error) {
    console.error('Error during CSV import:', error);
  } finally {
    await destPool.end();
  }
}

importCSVQuestions().catch(console.error);
