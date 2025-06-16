import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import * as schema from './shared/schema';
import ws from 'ws';

// Configure neon for WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Setup for source database using provided connection details
const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

// Setup for destination database (current Replit database)
const destPool = new Pool({ connectionString: process.env.DATABASE_URL });
const destDb = drizzle({ client: destPool, schema });

async function importData() {
  console.log('Starting data import...');
  
  try {
    // Import content
    console.log('Importing content...');
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
      "Short_description" as short_description,
      "URL" as url,
      "header" as header,
      "update" as update,
      "Imagelink" as imagelink
      FROM "Content" ORDER BY "ID"`;
    
    const content = await sourcePool.query(contentQuery);
    if (content.rows.length > 0) {
      for (const item of content.rows) {
        // Clean the data before inserting
        const cleanItem = {
          ...item,
          challengesubject: item.challengesubject ? (Array.isArray(item.challengesubject) ? item.challengesubject : [item.challengesubject]) : null,
          order: item.order ? item.order.toString() : null
        };
        await destDb.insert(schema.content).values(cleanItem).onConflictDoNothing();
      }
      console.log(`Imported ${content.rows.length} content items`);
    }

    // Import images
    console.log('Importing images...');
    const imageQuery = `SELECT 
      "ID" as id,
      "imagelink",
      "contentid",
      "default"
      FROM "image" ORDER BY "ID"`;
    
    const images = await sourcePool.query(imageQuery);
    if (images.rows.length > 0) {
      for (const image of images.rows) {
        await destDb.insert(schema.images).values(image).onConflictDoNothing();
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
      for (const question of questions.rows) {
        await destDb.insert(schema.questions).values(question).onConflictDoNothing();
      }
      console.log(`Imported ${questions.rows.length} questions`);
    }

    // Import assignments
    console.log('Importing assignments...');
    const assignments = await sourcePool.query('SELECT * FROM assignment ORDER BY id');
    if (assignments.rows.length > 0) {
      for (const assignment of assignments.rows) {
        await destDb.insert(schema.assignment).values(assignment).onConflictDoNothing();
      }
      console.log(`Imported ${assignments.rows.length} assignments`);
    }

    // Import assignment_student_try
    console.log('Importing assignment student tries...');
    const assignmentTries = await sourcePool.query('SELECT * FROM assignment_student_try ORDER BY id');
    if (assignmentTries.rows.length > 0) {
      for (const assignmentTry of assignmentTries.rows) {
        await destDb.insert(schema.assignment_student_try).values(assignmentTry).onConflictDoNothing();
      }
      console.log(`Imported ${assignmentTries.rows.length} assignment student tries`);
    }

    // Check for additional tables
    const tableQuery = `
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name NOT IN ('topic', 'content', 'image', 'question', 'matching')
      ORDER BY table_name;
    `;
    
    const additionalTables = await sourcePool.query(tableQuery);
    if (additionalTables.rows.length > 0) {
      console.log('\nAdditional tables found:');
      for (const table of additionalTables.rows) {
        const count = await sourcePool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
        console.log(`- ${table.table_name}: ${count.rows[0].count} records`);
      }
    }

    console.log('Data import completed successfully!');
    
    // Verify import
    const topicCount = await destDb.select().from(schema.topics);
    const contentCount = await destDb.select().from(schema.content);
    const questionCount = await destDb.select().from(schema.questions);
    const imageCount = await destDb.select().from(schema.images);
    const matchingCount = await destDb.select().from(schema.matching);
    
    console.log('\n=== Import Summary ===');
    console.log(`Topics: ${topicCount.length}`);
    console.log(`Content: ${contentCount.length}`);
    console.log(`Questions: ${questionCount.length}`);
    console.log(`Images: ${imageCount.length}`);
    console.log(`Matching: ${matchingCount.length}`);
    
  } catch (error) {
    console.error('Error during data import:', error);
    throw error;
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importData().catch(console.error);