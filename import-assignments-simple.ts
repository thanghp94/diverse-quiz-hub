import { Pool } from 'pg';
import { db } from './server/db';

const sourcePool = new Pool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function importAssignmentsSimple() {
  try {
    console.log('Starting assignment data import...');
    
    // Import assignments using raw SQL
    console.log('Importing assignments...');
    const assignments = await sourcePool.query('SELECT * FROM assignment');
    
    // Clear existing assignment data first
    await db.execute({text: `DELETE FROM student_try`});
    await db.execute({text: `DELETE FROM assignment_student_try`});
    await db.execute({text: `DELETE FROM assignment`});
    console.log('Cleared existing assignment data.');

    // Insert assignments in batches
    for (let i = 0; i < assignments.rows.length; i += 100) {
      const batch = assignments.rows.slice(i, i + 100);
      
      for (const row of batch) {
        await db.execute({
          text: `
            INSERT INTO assignment (id, category, type, testtype, contentid, topicid, noofquestion, description, expiring_date, update, "Assignmentname", status, typeofquestion, tg_tao, imagelink, subject, "Question_id", created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
            ON CONFLICT (id) DO NOTHING
          `,
          values: [
            row.id,
            row.category,
            row.type,
            row.testtype,
            row.contentid,
            row.topicid,
            row.noofquestion,
            row.description,
            row.expiring_date,
            row.update,
            row.Assignmentname,
            row.status,
            row.typeofquestion,
            row.tg_tao,
            row.imagelink,
            row.subject,
            row.Question_id
          ]
        });
      }
      console.log(`Imported assignment batch ${Math.floor(i/100) + 1}/${Math.ceil(assignments.rows.length/100)}`);
    }
    console.log(`✓ Imported ${assignments.rows.length} assignments`);

    // Import assignment student tries
    console.log('Importing assignment student tries...');
    const assignmentStudentTries = await sourcePool.query('SELECT * FROM assignment_student_try');
    
    for (let i = 0; i < assignmentStudentTries.rows.length; i += 100) {
      const batch = assignmentStudentTries.rows.slice(i, i + 100);
      
      for (const row of batch) {
        await db.execute(`
          INSERT INTO assignment_student_try (id, assignmentid, contentid, end_time, hocsinh_id, start_time, topicid, typeoftaking, update)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `, [
          row.ID,
          row.assignmentID,
          row.contentID,
          row.end_time,
          row.hocsinh_id,
          row.start_time,
          row.topicid,
          row.typeoftaking,
          row.update
        ]);
      }
      console.log(`Imported assignment student try batch ${Math.floor(i/100) + 1}/${Math.ceil(assignmentStudentTries.rows.length/100)}`);
    }
    console.log(`✓ Imported ${assignmentStudentTries.rows.length} assignment student tries`);

    // Import student tries
    console.log('Importing student tries...');
    const studentTries = await sourcePool.query('SELECT * FROM "Student_try"');
    
    for (let i = 0; i < studentTries.rows.length; i += 100) {
      const batch = studentTries.rows.slice(i, i + 100);
      
      for (const row of batch) {
        await db.execute(`
          INSERT INTO student_try (id, answer_choice, assignment_student_try_id, currentindex, hocsinh_id, question_id, quiz_result, score, showcontent, time_end, time_start, update, writing_answer)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING
        `, [
          row.ID,
          row.Answer_choice,
          row.assignment_student_try_id,
          row.currentindex,
          row.hocsinh_id,
          row.question_id,
          row.Quiz_result,
          row.score,
          row.showcontent,
          row.time_end,
          row.Time_start,
          row.update,
          row.writing_answer
        ]);
      }
      if (i % 1000 === 0 || i === studentTries.rows.length - 100) {
        console.log(`Imported student try batch ${Math.floor(i/100) + 1}/${Math.ceil(studentTries.rows.length/100)}`);
      }
    }
    console.log(`✓ Imported ${studentTries.rows.length} student tries`);

    // Verify import
    const finalAssignmentCount = await db.execute('SELECT COUNT(*) FROM assignment');
    const finalAstCount = await db.execute('SELECT COUNT(*) FROM assignment_student_try');
    const finalStCount = await db.execute('SELECT COUNT(*) FROM student_try');

    console.log('\n=== Import Summary ===');
    console.log(`Assignments imported: ${finalAssignmentCount.rows[0].count}`);
    console.log(`Assignment Student Tries imported: ${finalAstCount.rows[0].count}`);
    console.log(`Student Tries imported: ${finalStCount.rows[0].count}`);
    console.log('Assignment data import completed successfully!');

  } catch (error) {
    console.error('Error importing assignments:', error);
    throw error;
  } finally {
    await sourcePool.end();
  }
}

importAssignmentsSimple();