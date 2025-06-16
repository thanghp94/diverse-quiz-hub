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

async function importUsersFromUsersTable() {
  try {
    console.log('Importing users from Users table...');
    
    // Fetch all user data from Users table
    const usersQuery = `SELECT * FROM "Users" ORDER BY "ID"`;
    const usersData = await sourcePool.query(usersQuery);
    
    console.log(`Found ${usersData.rows.length} users to import`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const user of usersData.rows) {
      try {
        const userRecord = {
          id: user.ID,
          first_name: user.First_Name,
          last_name: user.Last_Name,
          full_name: user.Full_Name,
          assignment_student_try_id: user.assignment_student_try_Id,
          assignment_id: user.assignmentID,
          email: user.Email,
          topic_id: user.topicID,
          content_id: user.contentID,
          typeoftaking: user.typeoftaking,
          question_id: user.Question_ID,
          meraki_email: user.MerakiEmail,
          answer_choice: user.Answer_choice,
          quiz_result: user.quiz_result,
          show: user.Show,
          category: user.Category,
          session_shown_ids: user.Session_Shown_IDs,
          content_viewed: user.ContentViewed,
          total_score: user.totalScore,
          question_viewed: user.QuestionViewed,
          time_start: user.time_start?.toString(),
          time_end: user.time_end?.toString(),
          correct_answer: user.Correct_answer,
          show_content: user.ShowContent,
          current_index: user.CurrentIndex,
          writing_answer: user.writing_answer
        };
        
        await destDb.insert(schema.users).values(userRecord).onConflictDoNothing();
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`Imported ${imported} users...`);
        }
        
      } catch (error) {
        console.error(`Error importing user ${user.ID}:`, error);
        skipped++;
      }
    }
    
    console.log(`\nUser import completed:`);
    console.log(`- Imported: ${imported}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Total processed: ${usersData.rows.length}`);
    
  } catch (error) {
    console.error('Error importing users:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importUsersFromUsersTable();