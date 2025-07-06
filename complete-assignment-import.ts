import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Assuming source database remains PostgreSQL, keep sourcePool if needed
// If source is also Supabase, replace accordingly

async function completeAssignmentImport() {
  try {
    console.log('Starting remaining assignment data import...');

    // Import assignment student tries
    console.log('Importing assignment student tries...');
    // TODO: Replace sourcePool query with appropriate source fetch logic
    // const assignmentStudentTries = await sourcePool.query('SELECT * FROM assignment_student_try LIMIT 1000');
    // For now, placeholder empty array
    const assignmentStudentTries = { rows: [] };
    console.log(`Found ${assignmentStudentTries.rows.length} assignment student tries to import`);

    let importedAst = 0;
    for (const row of assignmentStudentTries.rows) {
      try {
        const { error } = await supabase
          .from('assignment_student_try')
          .insert([{
            assignmentid: row.assignmentID,
            contentID: row.contentID,
            end_time: row.end_time,
            hocsinh_id: row.hocsinh_id,
            questionIDs: row.questionIDs,
            start_time: row.start_time,
            typeoftaking: row.typeoftaking,
            update: row.update
          }]);
        if (error) throw error;
        importedAst++;
        if (importedAst % 100 === 0) {
          console.log(`Imported ${importedAst} assignment student tries...`);
        }
      } catch (error) {
        console.log(`Error importing assignment student try ${row.ID}:`, error.message);
      }
    }
    console.log(`✓ Imported ${importedAst} assignment student tries`);

    // Import student tries (limit to manageable batch)
    console.log('Importing student tries...');
    // TODO: Replace sourcePool query with appropriate source fetch logic
    // const studentTries = await sourcePool.query('SELECT * FROM "Student_try" LIMIT 2000');
    // For now, placeholder empty array
    const studentTries = { rows: [] };
    console.log(`Found ${studentTries.rows.length} student tries to import`);

    let importedSt = 0;
    for (const row of studentTries.rows) {
      try {
        const { error } = await supabase
          .from('student_try')
          .insert([{
            id: row.ID,
            answer_choice: row.Answer_choice,
            assignment_student_try_id: row.assignment_student_try_id,
            currentindex: row.currentindex,
            hocsinh_id: row.hocsinh_id,
            question_id: row.question_id,
            quiz_result: row.Quiz_result,
            score: row.score,
            showcontent: row.showcontent,
            time_end: row.time_end,
            time_start: row.Time_start,
            update: row.update,
            writing_answer: row.writing_answer
          }])
          .onConflict('id')
          .ignore();
        if (error) throw error;
        importedSt++;
        if (importedSt % 200 === 0) {
          console.log(`Imported ${importedSt} student tries...`);
        }
      } catch (error) {
        console.log(`Error importing student try ${row.ID}:`, error.message);
      }
    }
    console.log(`✓ Imported ${importedSt} student tries`);

    // Final verification
    const { data: finalCounts, error: finalError } = await supabase.rpc('final_import_summary');
    if (finalError) throw finalError;

    console.log('\n=== Final Import Summary ===');
    if (finalCounts && finalCounts.length > 0) {
      console.log(`Assignments: ${finalCounts[0].assignments}`);
      console.log(`Assignment Student Tries: ${finalCounts[0].assignment_student_tries}`);
      console.log(`Student Tries: ${finalCounts[0].student_tries}`);
    }
    console.log('Assignment data import completed successfully!');

  } catch (error) {
    console.error('Error importing assignment data:', error);
    throw error;
  }
}

completeAssignmentImport();
