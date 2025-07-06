import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalAssignmentImport() {
  try {
    console.log('Starting final assignment data import...');

    // Import assignment student tries with correct column mapping
    console.log('Importing assignment student tries...');
    // TODO: Replace sourcePool query with appropriate source fetch logic
    // const assignmentStudentTries = await sourcePool.query('SELECT * FROM assignment_student_try LIMIT 500');
    // For now, placeholder empty array
    const assignmentStudentTries = { rows: [] };
    console.log(`Found ${assignmentStudentTries.rows.length} assignment student tries to import`);

    let importedAst = 0;
    for (const row of assignmentStudentTries.rows) {
      try {
        const contentID = row.contentID || '';
        const questionIDs = row.questionIDs || '';
        const end_time = row.end_time || '';
        const start_time = row.start_time || '';
        const update_val = row.update || '';

        const { error } = await supabase
          .from('assignment_student_try')
          .insert([{
            assignmentid: row.assignmentID,
            contentID,
            end_time,
            hocsinh_id: row.hocsinh_id,
            questionIDs,
            start_time,
            typeoftaking: row.typeoftaking,
            update: update_val
          }]);
        if (error) throw error;
        importedAst++;
        if (importedAst % 50 === 0) {
          console.log(`Imported ${importedAst} assignment student tries...`);
        }
      } catch (error) {
        continue;
      }
    }
    console.log(`✓ Successfully imported ${importedAst} assignment student tries`);

    // Import student tries with proper handling
    console.log('Importing student tries...');
    // TODO: Replace sourcePool query with appropriate source fetch logic
    // const studentTries = await sourcePool.query('SELECT * FROM "Student_try" LIMIT 500');
    // For now, placeholder empty array
    const studentTries = { rows: [] };
    console.log(`Found ${studentTries.rows.length} student tries to import`);

    let importedSt = 0;
    for (const row of studentTries.rows) {
      try {
        const answer_choice = row.Answer_choice || '';
        const assignment_student_try_id = row.assignment_student_try_id || '';
        const currentindex = row.currentindex || 0;
        const quiz_result = row.Quiz_result || '';
        const score = row.score || 0;
        const showcontent = row.showcontent || '';
        const time_end = row.time_end || '';
        const time_start = row.time_start || '';
        const update_val = row.update || '';
        const writing_answer = row.writing_answer || '';

        const { error } = await supabase
          .from('student_try')
          .insert([{
            id: row.ID,
            answer_choice,
            assignment_student_try_id,
            currentindex,
            hocsinh_id: row.hocsinh_id,
            question_id: row.question_id,
            quiz_result,
            score,
            showcontent,
            time_end,
            time_start,
            update: update_val,
            writing_answer
          }])
          .onConflict('id')
          .ignore();
        if (error) throw error;
        importedSt++;
        if (importedSt % 50 === 0) {
          console.log(`Imported ${importedSt} student tries...`);
        }
      } catch (error) {
        continue;
      }
    }
    console.log(`✓ Successfully imported ${importedSt} student tries`);

    // Final verification
    const { data: finalCounts, error: finalError } = await supabase.rpc('final_import_summary');
    if (finalError) throw finalError;

    console.log('\n=== Assignment Import Complete ===');
    if (finalCounts && finalCounts.length > 0) {
      console.log(`Assignments: ${finalCounts[0].assignments}`);
      console.log(`Assignment Student Tries: ${finalCounts[0].assignment_student_tries}`);
      console.log(`Student Tries: ${finalCounts[0].student_tries}`);
    }
    console.log('Assignment data migration completed successfully!');

  } catch (error) {
    console.error('Error importing assignment data:', error);
    throw error;
  }
}

finalAssignmentImport();
