// Temporary fix for live class monitoring storage method

import { db } from './server/database';
import { sql } from 'drizzle-orm';

export async function getLiveClassActivitiesFixed(studentIds: string[], startTime: string): Promise<any[]> {
  try {
    const results = [];
    
    // Process each student individually to avoid complex query parameter issues
    for (const studentId of studentIds) {
      // Get student info
      const studentInfo = await db.execute(sql`
        SELECT id, COALESCE(full_name, first_name || ' ' || last_name) as student_name
        FROM users WHERE id = ${studentId}
      `);
      
      if (studentInfo.rows.length === 0) continue;
      
      const student = studentInfo.rows[0] as any;
      
      // Get content views count
      const contentViews = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM student_try_content stc
        WHERE stc.hocsinh_id = ${studentId} 
          AND stc.time_start >= ${startTime}
      `);
      
      // Get content ratings count
      const contentRatings = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM content_ratings cr
        WHERE cr.student_id = ${studentId} 
          AND cr.created_at >= ${startTime}
      `);
      
      // Get recent activities
      const activities = await db.execute(sql`
        SELECT 'content_view' as type, c.id as content_id, c.title as content_title, 
               stc.time_start as timestamp, NULL as rating, NULL as quiz_score
        FROM student_try_content stc
        JOIN content c ON stc.contentid = c.id
        WHERE stc.hocsinh_id = ${studentId} AND stc.time_start >= ${startTime}
        UNION ALL
        SELECT 'content_rating' as type, cr.content_id, c.title as content_title,
               cr.created_at as timestamp, cr.rating::text as rating, NULL as quiz_score
        FROM content_ratings cr
        JOIN content c ON cr.content_id = c.id
        WHERE cr.student_id = ${studentId} AND cr.created_at >= ${startTime}
        ORDER BY timestamp DESC
        LIMIT 20
      `);
      
      results.push({
        student_id: student.id,
        student_name: student.student_name,
        content_viewed: parseInt((contentViews.rows[0] as any)?.count) || 0,
        content_rated: parseInt((contentRatings.rows[0] as any)?.count) || 0,
        quiz_accuracy: null,
        last_activity: activities.rows.length > 0 ? (activities.rows[0] as any).timestamp : null,
        activities: activities.rows || []
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error in getLiveClassActivitiesFixed:', error);
    throw error;
  }
}