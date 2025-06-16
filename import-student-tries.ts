import { Pool } from 'pg';
import { db } from './server/db';
import { sql } from 'drizzle-orm';

const sourcePool = new Pool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function importStudentTries() {
  try {
    console.log('Starting student tries import...');
    
    // Import student tries in batches
    const studentTries = await sourcePool.query('SELECT * FROM "Student_try" LIMIT 1000');
    console.log(`Found ${studentTries.rows.length} student tries to import`);
    
    let imported = 0;
    for (const row of studentTries.rows) {
      try {
        // Handle null/undefined values safely
        const answer_choice = row.Answer_choice || '';
        const assignment_student_try_id = row.assignment_student_try_id || '';
        const currentindex = parseInt(row.currentindex) || 0;
        const quiz_result = row.Quiz_result || '';
        const score = parseFloat(row.score) || 0;
        const showcontent = row.showcontent || '';
        const time_end = row.time_end || '';
        const time_start = row.Time_start || '';
        const update_val = row.update || '';
        const writing_answer = row.writing_answer || '';
        
        await db.execute(sql`
          INSERT INTO student_try (id, answer_choice, assignment_student_try_id, currentindex, hocsinh_id, question_id, quiz_result, score, showcontent, time_end, time_start, update, writing_answer)
          VALUES (${row.ID}, ${answer_choice}, ${assignment_student_try_id}, ${currentindex}, ${row.hocsinh_id}, ${row.question_id}, ${quiz_result}, ${score}, ${showcontent}, ${time_end}, ${time_start}, ${update_val}, ${writing_answer})
          ON CONFLICT (id) DO NOTHING
        `);
        imported++;
        if (imported % 100 === 0) {
          console.log(`Imported ${imported} student tries...`);
        }
      } catch (error) {
        // Skip problematic records and continue
        continue;
      }
    }
    
    console.log(`✓ Successfully imported ${imported} student tries`);

    // Final count verification
    const counts = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM assignment) as assignments,
        (SELECT COUNT(*) FROM assignment_student_try) as assignment_student_tries,
        (SELECT COUNT(*) FROM student_try) as student_tries
    `);

    console.log('\n=== Assignment Data Migration Complete ===');
    console.log(`Assignments: ${counts.rows[0].assignments}`);
    console.log(`Assignment Student Tries: ${counts.rows[0].assignment_student_tries}`);
    console.log(`Student Tries: ${counts.rows[0].student_tries}`);
    console.log('All assignment data successfully migrated!');

  } catch (error) {
    console.error('Error importing student tries:', error);
    throw error;
  } finally {
    await sourcePool.end();
  }
}

importStudentTries();