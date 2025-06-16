import { Pool } from 'pg';
import { db } from './server/db';
import { assignment, assignment_student_try, student_try } from './shared/schema';

const sourcePool = new Pool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function importAssignments() {
  try {
    console.log('Starting assignment data import...');
    
    // Clear existing assignment data
    console.log('Clearing existing assignment data...');
    await db.delete(student_try);
    await db.delete(assignment_student_try);
    await db.delete(assignment);
    console.log('Existing data cleared.');

    // Import assignments
    console.log('Importing assignments...');
    const assignments = await sourcePool.query('SELECT * FROM assignment');
    
    const assignmentBatches = [];
    for (let i = 0; i < assignments.rows.length; i += 100) {
      const batch = assignments.rows.slice(i, i + 100).map(row => ({
        id: row.id,
        category: row.category,
        type: row.type,
        testtype: row.testtype,
        contentid: row.contentid,
        topicid: row.topicid,
        noofquestion: row.noofquestion,
        description: row.description,
        expiring_date: row.expiring_date,
        update: row.update,
        assignmentname: row.Assignmentname,
        status: row.status,
        typeofquestion: row.typeofquestion,
        tg_tao: row.tg_tao,
        imagelink: row.imagelink,
        subject: row.subject,
        question_id: row.Question_id
      }));
      assignmentBatches.push(batch);
    }

    for (let i = 0; i < assignmentBatches.length; i++) {
      await db.insert(assignment).values(assignmentBatches[i]);
      console.log(`Inserted assignment batch ${i + 1}/${assignmentBatches.length}`);
    }
    console.log(`✓ Imported ${assignments.rows.length} assignments`);

    // Import assignment student tries
    console.log('Importing assignment student tries...');
    const assignmentStudentTries = await sourcePool.query('SELECT * FROM assignment_student_try');
    
    const astBatches = [];
    for (let i = 0; i < assignmentStudentTries.rows.length; i += 100) {
      const batch = assignmentStudentTries.rows.slice(i, i + 100).map(row => ({
        id: row.ID,
        assignmentid: row.assignmentID,
        hocsinh_id: row.hocsinh_id,
        start_time: row.start_time,
        end_time: row.end_time,
        update: row.update,
        topicid: row.topicid,
        contentid: row.contentID,
        typeoftaking: row.typeoftaking
      }));
      astBatches.push(batch);
    }

    for (let i = 0; i < astBatches.length; i++) {
      await db.insert(assignment_student_try).values(astBatches[i]);
      console.log(`Inserted assignment student try batch ${i + 1}/${astBatches.length}`);
    }
    console.log(`✓ Imported ${assignmentStudentTries.rows.length} assignment student tries`);

    // Import student tries
    console.log('Importing student tries...');
    const studentTries = await sourcePool.query('SELECT * FROM "Student_try"');
    
    const stBatches = [];
    for (let i = 0; i < studentTries.rows.length; i += 100) {
      const batch = studentTries.rows.slice(i, i + 100).map(row => ({
        id: row.ID,
        hocsinh_id: row.hocsinh_id,
        assignment_student_try_id: row.assignment_student_try_id,
        question_id: row.question_id,
        time_start: row.Time_start,
        time_end: row.time_end,
        answer_choice: row.Answer_choice,
        quiz_result: row.Quiz_result,
        score: row.score,
        update: row.update,
        currentindex: row.currentindex,
        showcontent: row.showcontent,
        writing_answer: row.writing_answer
      }));
      stBatches.push(batch);
    }

    for (let i = 0; i < stBatches.length; i++) {
      await db.insert(student_try).values(stBatches[i]);
      if (i % 10 === 0 || i === stBatches.length - 1) {
        console.log(`Inserted student try batch ${i + 1}/${stBatches.length}`);
      }
    }
    console.log(`✓ Imported ${studentTries.rows.length} student tries`);

    // Verify import
    const finalAssignmentCount = await db.select().from(assignment);
    const finalAstCount = await db.select().from(assignment_student_try);
    const finalStCount = await db.select().from(student_try);

    console.log('\n=== Import Summary ===');
    console.log(`Assignments imported: ${finalAssignmentCount.length}`);
    console.log(`Assignment Student Tries imported: ${finalAstCount.length}`);
    console.log(`Student Tries imported: ${finalStCount.length}`);
    console.log('Assignment data import completed successfully!');

  } catch (error) {
    console.error('Error importing assignments:', error);
    throw error;
  } finally {
    await sourcePool.end();
  }
}

importAssignments();