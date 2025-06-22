// Backup of working storage implementation
import { users, topics, content, images, questions, matching, videos, matching_attempts, content_ratings, student_streaks, daily_activities, writing_prompts, writing_submissions, assignment, assignment_student_try, student_try, learning_progress, cron_jobs, student_try_content, pending_access_requests, type User, type InsertUser, type UpsertUser, type Topic, type Content, type Image, type Question, type Matching, type Video, type MatchingAttempt, type InsertMatchingAttempt, type ContentRating, type InsertContentRating, type StudentStreak, type InsertStudentStreak, type DailyActivity, type InsertDailyActivity, type WritingPrompt, type InsertWritingPrompt, type WritingSubmission, type InsertWritingSubmission, type LearningProgress, type InsertLearningProgress, type CronJob, type InsertCronJob } from "@shared/schema";
import { eq, isNull, ne, asc, sql, and, desc, inArray, gte, lte } from "drizzle-orm";
import * as schema from "@shared/schema";
import crypto from 'crypto';
import { db } from "./db";

export interface IStorage {
  writingSubmissions: typeof writing_submissions;
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  updateUserEmail(userId: string, newEmail: string): Promise<User>;
  updateUser(userId: string, updateData: Partial<User>): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  getTopics(): Promise<Topic[]>;
  getBowlChallengeTopics(): Promise<Topic[]>;
  getTopicById(id: string): Promise<Topic | undefined>;
  updateTopic(topicId: string, updateData: Partial<Topic>): Promise<Topic | undefined>;
  createTopic(topicData: any): Promise<Topic>;

  getContent(topicId?: string): Promise<Content[]>;
  getContentById(id: string): Promise<Content | undefined>;
  updateContent(id: string, updates: any): Promise<Content | undefined>;
  createContent(contentData: any): Promise<Content>;

  getContentGroups(): Promise<Array<{ contentgroup: string; url: string; content_count: number }>>;
  getContentByGroup(contentgroup: string): Promise<Content[]>;

  getImages(): Promise<Image[]>;
  getImageById(id: string): Promise<Image | undefined>;

  getQuestions(contentId?: string, topicId?: string, level?: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;

  getMatchingActivities(): Promise<Matching[]>;
  getMatchingById(id: string): Promise<Matching | undefined>;
  getMatchingByTopicId(topicId: string): Promise<Matching[]>;
  createMatching(matchingData: any): Promise<Matching>;

  getVideos(): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | undefined>;
  getVideosByContentId(contentId: string): Promise<Video[]>;

  createMatchingAttempt(attempt: InsertMatchingAttempt): Promise<MatchingAttempt>;
  getMatchingAttempts(studentId: string, matchingId?: string): Promise<MatchingAttempt[]>;
  getMatchingAttemptById(id: string): Promise<MatchingAttempt | undefined>;
  updateMatchingAttempt(id: string, updates: Partial<MatchingAttempt>): Promise<MatchingAttempt>;

  createContentRating(rating: InsertContentRating): Promise<ContentRating>;
  getContentRating(studentId: string, contentId: string): Promise<ContentRating | null>;
  getContentRatingsByStudent(studentId: string): Promise<ContentRating[]>;
  updateContentRating(studentId: string, contentId: string, rating: string): Promise<ContentRating>;
  incrementContentViewCount(studentId: string, contentId: string): Promise<ContentRating>;
  getContentRatingStats(contentId: string): Promise<{ easy: number; normal: number; hard: number }>;

  getStudentStreak(studentId: string): Promise<StudentStreak | undefined>;
  updateStudentStreak(studentId: string): Promise<StudentStreak>;
  getStreakLeaderboard(limit?: number): Promise<StudentStreak[]>;

  recordDailyActivity(studentId: string, points: number): Promise<DailyActivity>;
  getDailyActivity(studentId: string, date: Date): Promise<DailyActivity | undefined>;
  getLeaderboards(): Promise<any>;

  getWritingPrompts(): Promise<WritingPrompt[]>;
  getWritingPromptById(id: string): Promise<WritingPrompt | undefined>;
  getWritingPromptsByCategory(category: string): Promise<WritingPrompt[]>;

  createWritingSubmission(submission: InsertWritingSubmission): Promise<WritingSubmission>;
  getWritingSubmission(id: string): Promise<WritingSubmission | undefined>;
  getStudentWritingSubmissions(studentId: string): Promise<WritingSubmission[]>;
  updateWritingSubmission(id: string, updates: Partial<WritingSubmission>): Promise<WritingSubmission>;

  createAssignment(assignment: any): Promise<any>;
  getAssignmentById(id: string): Promise<any>;
  getAllAssignments(): Promise<any[]>;
  getLiveClassAssignments(): Promise<any[]>;
  duplicateAssignment(id: string, newType: string): Promise<any>;

  createAssignmentStudentTry(assignmentStudentTryData: any): Promise<any>;
  getAssignmentStudentTryById(id: string): Promise<any>;
  getAllAssignmentStudentTries(): Promise<any[]>;

  createStudentTry(studentTry: any): Promise<any>;
  getStudentTryById(id: string): Promise<any>;
  getAllStudentTries(): Promise<any[]>;
  updateStudentTry(id: string, updates: any): Promise<any>;

  getStudentLearningProgress(studentId: string): Promise<any[]>;
  createLearningProgress(progress: any): Promise<any>;
  updateLearningProgress(id: string, updates: any): Promise<any>;

  getContentProgress(studentId: string): Promise<any[]>;
  getPersonalContent(studentId: string): Promise<any[]>;

  getCronJob(jobName: string): Promise<CronJob | undefined>;
  createCronJob(job: InsertCronJob): Promise<CronJob>;
  updateCronJob(jobName: string, lastRun: Date, nextRun: Date): Promise<CronJob>;
  updateStudentTryContent(): Promise<void>;

  getStudentTriesLeaderboard(): Promise<any[]>;
  createPendingAccessRequest(request: any): Promise<any>;
  createStudentTryContent(record: any): Promise<any>;
  getStudentTryContentByStudent(studentId: string): Promise<any[]>;
  getRecentStudentTryContent(): Promise<any[]>;
  getLiveClassActivities(studentIds: string[], startTime: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  writingSubmissions = writing_submissions;
  
  private async executeWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        console.error(`Database operation failed (attempt ${attempt}/${retries}):`, error?.message || error);
        if (attempt === retries) {
          throw error;
        }
        if (error?.message?.includes('endpoint is disabled') || 
            error?.message?.includes('connection') ||
            error?.code === 'XX000') {
          console.log(`Retrying database operation in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, identifier));
    return result[0];
  }

  async updateUserEmail(userId: string, newEmail: string): Promise<User> {
    const result = await db.update(users)
      .set({ email: newEmail })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return this.executeWithRetry(async () => {
      const existing = await this.getUserByIdentifier(userData.id);
      if (existing) {
        const result = await db.update(users)
          .set({ ...userData, updated_at: new Date() })
          .where(eq(users.id, userData.id))
          .returning();
        return result[0];
      } else {
        const result = await db.insert(users).values(userData).returning();
        return result[0];
      }
    });
  }

  async getTopics(): Promise<Topic[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(topics);
    });
  }

  async getBowlChallengeTopics(): Promise<Topic[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(topics).where(isNull(topics.parentid));
    });
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    const result = await db.select().from(topics).where(eq(topics.id, id));
    return result[0];
  }

  async getContent(topicId?: string): Promise<Content[]> {
    return this.executeWithRetry(async () => {
      if (topicId) {
        return await db.select().from(content).where(eq(content.topicid, topicId));
      }
      return await db.select().from(content);
    });
  }

  async getContentById(id: string): Promise<Content | undefined> {
    const result = await db.select().from(content).where(eq(content.id, id));
    return result[0];
  }

  async getImages(): Promise<Image[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(images);
    });
  }

  async getImageById(id: string): Promise<Image | undefined> {
    const result = await db.select().from(images).where(eq(images.id, id));
    return result[0];
  }

  async getQuestions(contentId?: string, topicId?: string, level?: string) {
    return this.executeWithRetry(async () => {
      let query = db.select().from(questions);
      
      const conditions: any[] = [];
      if (contentId) conditions.push(eq(questions.contentid, contentId));
      if (topicId) conditions.push(eq(questions.topicid, topicId));
      if (level) conditions.push(eq(questions.level, level));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      return await query;
    });
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result[0];
  }

  async getMatchingActivities(): Promise<Matching[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(matching);
    });
  }

  async getMatchingById(id: string): Promise<Matching | undefined> {
    const result = await db.select().from(matching).where(eq(matching.id, id));
    return result[0];
  }

  async getMatchingByTopicId(topicId: string): Promise<Matching[]> {
    const result = await db.select().from(matching).where(eq(matching.topicid, topicId));
    return result;
  }

  async getVideos(): Promise<Video[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(videos);
    });
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.id, id));
    return result[0];
  }

  async getVideosByContentId(contentId: string): Promise<Video[]> {
    const result = await db.select().from(videos).where(eq(videos.contentid, contentId));
    return result;
  }

  async createMatchingAttempt(attempt: InsertMatchingAttempt): Promise<MatchingAttempt> {
    const result = await db.insert(matching_attempts).values(attempt).returning();
    return result[0];
  }

  async getMatchingAttempts(studentId: string, matchingId?: string): Promise<MatchingAttempt[]> {
    let query = db.select().from(matching_attempts).where(eq(matching_attempts.student_id, studentId));
    
    if (matchingId) {
      query = query.where(eq(matching_attempts.matching_id, matchingId));
    }
    
    return await query.orderBy(desc(matching_attempts.time_start));
  }

  async getMatchingAttemptById(id: string): Promise<MatchingAttempt | undefined> {
    const result = await db.select().from(matching_attempts).where(eq(matching_attempts.id, id));
    return result[0];
  }

  async updateMatchingAttempt(id: string, updates: Partial<MatchingAttempt>): Promise<MatchingAttempt> {
    const result = await db.update(matching_attempts)
      .set(updates)
      .where(eq(matching_attempts.id, id))
      .returning();
    return result[0];
  }

  async createContentRating(rating: InsertContentRating): Promise<ContentRating> {
    const result = await db.insert(content_ratings).values(rating).returning();
    return result[0];
  }

  async getContentRating(studentId: string, contentId: string): Promise<ContentRating | null> {
    const result = await db.select().from(content_ratings)
      .where(and(
        eq(content_ratings.student_id, studentId),
        eq(content_ratings.content_id, contentId)
      ));
    return result[0] || null;
  }

  async updateContentRating(studentId: string, contentId: string, rating?: string, personalNote?: string): Promise<ContentRating> {
    return this.executeWithRetry(async () => {
      const existing = await this.getContentRating(studentId, contentId);
      
      if (existing) {
        const updateData: any = { updated_at: new Date() };
        if (rating !== undefined) updateData.rating = rating;
        if (personalNote !== undefined) updateData.personal_note = personalNote;
        
        const result = await db.update(content_ratings)
          .set(updateData)
          .where(and(
            eq(content_ratings.student_id, studentId),
            eq(content_ratings.content_id, contentId)
          ))
          .returning();
        return result[0];
      } else {
        const newRating: InsertContentRating = {
          id: crypto.randomUUID(),
          student_id: studentId,
          content_id: contentId,
          rating: rating || null,
          personal_note: personalNote || null,
          view_count: 1,
          created_at: new Date(),
          updated_at: new Date()
        };
        return await this.createContentRating(newRating);
      }
    });
  }

  async incrementContentViewCount(studentId: string, contentId: string): Promise<ContentRating> {
    return this.executeWithRetry(async () => {
      const existing = await this.getContentRating(studentId, contentId);
      
      if (existing) {
        const result = await db.update(content_ratings)
          .set({ 
            view_count: (existing.view_count || 0) + 1,
            updated_at: new Date()
          })
          .where(and(
            eq(content_ratings.student_id, studentId),
            eq(content_ratings.content_id, contentId)
          ))
          .returning();
        return result[0];
      } else {
        const newRating: InsertContentRating = {
          id: crypto.randomUUID(),
          student_id: studentId,
          content_id: contentId,
          view_count: 1,
          created_at: new Date(),
          updated_at: new Date()
        };
        return await this.createContentRating(newRating);
      }
    });
  }

  async getContentRatingsByStudent(studentId: string): Promise<ContentRating[]> {
    const result = await db.select().from(content_ratings)
      .where(eq(content_ratings.student_id, studentId))
      .orderBy(desc(content_ratings.updated_at));
    return result;
  }

  async getContentRatingStats(contentId: string): Promise<{ easy: number; normal: number; hard: number }> {
    const result = await db.select().from(content_ratings)
      .where(eq(content_ratings.content_id, contentId));
    
    const stats = { easy: 0, normal: 0, hard: 0 };
    result.forEach(rating => {
      if (rating.rating === 'easy') stats.easy++;
      else if (rating.rating === 'normal') stats.normal++;
      else if (rating.rating === 'hard') stats.hard++;
    });
    
    return stats;
  }

  async getStudentStreak(studentId: string): Promise<StudentStreak | undefined> {
    const result = await db.select().from(student_streaks).where(eq(student_streaks.student_id, studentId));
    return result[0];
  }

  async updateStudentStreak(studentId: string): Promise<StudentStreak> {
    return this.executeWithRetry(async () => {
      const existing = await this.getStudentStreak(studentId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (existing) {
        const lastActivityDate = existing.last_activity_date ? new Date(existing.last_activity_date) : null;
        lastActivityDate?.setHours(0, 0, 0, 0);
        
        let newCurrentStreak = existing.current_streak || 0;
        let newLongestStreak = existing.longest_streak || 0;
        
        if (lastActivityDate) {
          const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            newCurrentStreak += 1;
          } else if (daysDiff > 1) {
            newCurrentStreak = 1;
          }
        } else {
          newCurrentStreak = 1;
        }
        
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }
        
        const result = await db.update(student_streaks)
          .set({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_activity_date: today,
            updated_at: new Date()
          })
          .where(eq(student_streaks.student_id, studentId))
          .returning();
        return result[0];
      } else {
        const newStreak: InsertStudentStreak = {
          id: crypto.randomUUID(),
          student_id: studentId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_points: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
        const result = await db.insert(student_streaks).values(newStreak).returning();
        return result[0];
      }
    });
  }

  async getStreakLeaderboard(limit: number = 10): Promise<StudentStreak[]> {
    const result = await db.select().from(student_streaks)
      .orderBy(desc(student_streaks.longest_streak), desc(student_streaks.current_streak))
      .limit(limit);
    return result;
  }

  async recordDailyActivity(studentId: string, points: number): Promise<DailyActivity> {
    return this.executeWithRetry(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existing = await this.getDailyActivity(studentId, today);
      
      if (existing) {
        const result = await db.update(daily_activities)
          .set({
            total_points: (existing.total_points || 0) + points,
            quiz_count: (existing.quiz_count || 0) + 1,
            updated_at: new Date()
          })
          .where(and(
            eq(daily_activities.student_id, studentId),
            eq(daily_activities.activity_date, today)
          ))
          .returning();
        return result[0];
      } else {
        const newActivity: InsertDailyActivity = {
          id: crypto.randomUUID(),
          student_id: studentId,
          activity_date: today,
          total_points: points,
          quiz_count: 1,
          created_at: new Date(),
          updated_at: new Date()
        };
        const result = await db.insert(daily_activities).values(newActivity).returning();
        return result[0];
      }
    });
  }

  async getDailyActivity(studentId: string, date: Date): Promise<DailyActivity | undefined> {
    const result = await db.select().from(daily_activities)
      .where(and(
        eq(daily_activities.student_id, studentId),
        eq(daily_activities.activity_date, date)
      ));
    return result[0];
  }

  async getLeaderboards(): Promise<any> {
    return this.executeWithRetry(async () => {
      const totalPointsResult = await db.execute(sql`
        SELECT 
          da.student_id,
          SUM(da.total_points) as total_points,
          u.full_name
        FROM daily_activities da
        LEFT JOIN users u ON da.student_id = u.id
        GROUP BY da.student_id, u.full_name
        ORDER BY total_points DESC
        LIMIT 10
      `);

      const bestStreakResult = await db.execute(sql`
        SELECT 
          ss.student_id,
          ss.longest_streak,
          u.full_name
        FROM student_streaks ss
        LEFT JOIN users u ON ss.student_id = u.id
        ORDER BY ss.longest_streak DESC
        LIMIT 10
      `);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayQuizzesResult = await db.execute(sql`
        SELECT 
          da.student_id,
          da.quiz_count as today_count,
          u.full_name
        FROM daily_activities da
        LEFT JOIN users u ON da.student_id = u.id
        WHERE da.activity_date = ${today}
        ORDER BY da.quiz_count DESC
        LIMIT 10
      `);

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      
      const weeklyQuizzesResult = await db.execute(sql`
        SELECT 
          da.student_id,
          SUM(da.quiz_count) as weekly_count,
          u.full_name
        FROM daily_activities da
        LEFT JOIN users u ON da.student_id = u.id
        WHERE da.activity_date >= ${weekStart}
        GROUP BY da.student_id, u.full_name
        ORDER BY weekly_count DESC
        LIMIT 10
      `);

      return {
        totalPoints: totalPointsResult.rows.map((row: any) => ({
          student_id: row.student_id,
          total_points: parseInt(row.total_points || 0),
          full_name: row.full_name
        })),
        bestStreak: bestStreakResult.rows.map((row: any) => ({
          student_id: row.student_id,
          longest_streak: parseInt(row.longest_streak || 0),
          full_name: row.full_name
        })),
        todayQuizzes: todayQuizzesResult.rows.map((row: any) => ({
          student_id: row.student_id,
          today_count: parseInt(row.today_count || 0),
          full_name: row.full_name
        })),
        weeklyQuizzes: weeklyQuizzesResult.rows.map((row: any) => ({
          student_id: row.student_id,
          weekly_count: parseInt(row.weekly_count || 0),
          full_name: row.full_name
        }))
      };
    });
  }

  async getWritingPrompts(): Promise<WritingPrompt[]> {
    return await db.select().from(writing_prompts);
  }

  async getWritingPromptById(id: string): Promise<WritingPrompt | undefined> {
    const result = await db.select().from(writing_prompts).where(eq(writing_prompts.id, id));
    return result[0];
  }

  async getWritingPromptsByCategory(category: string): Promise<WritingPrompt[]> {
    const result = await db.select().from(writing_prompts).where(eq(writing_prompts.category, category));
    return result;
  }

  async createWritingSubmission(submission: InsertWritingSubmission): Promise<WritingSubmission> {
    const submissionData = {
      ...submission,
      id: submission.id || crypto.randomUUID(),
      created_at: submission.created_at || new Date(),
      updated_at: submission.updated_at || new Date()
    };

    console.log('Storage: Creating writing submission with data:', submissionData);
    const result = await db.insert(writing_submissions).values(submissionData).returning();
    console.log('Storage: Writing submission created:', result[0]);
    return result[0];
  }

  async getWritingSubmission(id: string): Promise<WritingSubmission | undefined> {
    const result = await db.select().from(writing_submissions).where(eq(writing_submissions.id, id));
    return result[0] || undefined;
  }

  async getStudentWritingSubmissions(studentId: string): Promise<WritingSubmission[]> {
    return await db.select().from(writing_submissions)
      .where(eq(writing_submissions.student_id, studentId))
      .orderBy(desc(writing_submissions.created_at));
  }

  async updateWritingSubmission(id: string, updates: Partial<WritingSubmission>): Promise<WritingSubmission> {
    const result = await db.update(writing_submissions)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(writing_submissions.id, id))
      .returning();
    return result[0];
  }

  async createAssignment(assignmentInput: any): Promise<any> {
    const assignmentData = {
      id: assignmentInput.id || `assignment_${Date.now()}`,
      assignmentname: assignmentInput.assignmentname || `Quiz - ${assignmentInput.typeofquestion || 'Overview'}`,
      contentid: assignmentInput.contentid,
      question_id: assignmentInput.question_id,
      testtype: assignmentInput.testtype || 'content_quiz',
      typeofquestion: assignmentInput.typeofquestion || 'Overview',
      status: 'active'
    };

    try {
      const result = await db.insert(assignment).values(assignmentData).returning();
      return result[0] || assignmentData;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return {
        ...assignmentData,
        created_at: new Date()
      };
    }
  }

  async getAssignmentById(id: string): Promise<any> {
    const result = await db.select().from(assignment).where(eq(assignment.id, id));
    return result[0] || null;
  }

  async getAllAssignments(): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const result = await db.select().from(assignment);
      return result;
    });
  }

  async duplicateAssignment(id: string, newType: string): Promise<any> {
    return await this.executeWithRetry(async () => {
      const originalAssignment = await db.select().from(assignment).where(eq(assignment.id, id));
      if (!originalAssignment[0]) {
        throw new Error('Assignment not found');
      }

      const original = originalAssignment[0];
      const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newAssignment = {
        ...original,
        id: newId,
        type: newType,
        assignmentname: `${original.assignmentname} (${newType})`,
        created_at: new Date(),
        update: new Date().toISOString()
      };

      const result = await db.insert(assignment).values(newAssignment).returning();
      return result[0];
    });
  }

  async createAssignmentStudentTry(assignmentStudentTryData: any): Promise<any> {
    const data = {
      assignmentid: assignmentStudentTryData.assignmentid,
      hocsinh_id: assignmentStudentTryData.hocsinh_id,
      start_time: assignmentStudentTryData.start_time || new Date().toISOString(),
      contentID: assignmentStudentTryData.contentID,
      questionIDs: assignmentStudentTryData.questionIDs || '',
      typeoftaking: assignmentStudentTryData.typeoftaking || 'live_class'
    };

    try {
      const result = await db.insert(assignment_student_try).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating assignment_student_try:', error);
      return {
        ...data,
        id: Date.now()
      };
    }
  }

  async getAssignmentStudentTryById(id: string): Promise<any> {
    const result = await db.select().from(assignment_student_try).where(eq(assignment_student_try.id, parseInt(id)));
    return result[0] || null;
  }

  async getAllAssignmentStudentTries(): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const result = await db.select().from(assignment_student_try);
      return result;
    });
  }

  async getLiveClassAssignments(): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      
      const result = await db.execute(sql`
        SELECT * FROM assignment 
        WHERE created_at >= ${threeHoursAgo}
        ORDER BY created_at DESC
      `);
      
      return result.rows;
    });
  }

  async getAssignmentStudentProgress(assignmentId: string): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const result = await db.execute(sql`
        SELECT 
          ast.*,
          COUNT(st.id) as completed_questions,
          AVG(CASE WHEN st.quiz_result = '✅' THEN 1.0 ELSE 0.0 END) as accuracy
        FROM assignment_student_try ast
        LEFT JOIN student_try st ON ast.id = st.assignment_student_try_id
        WHERE ast.assignmentid = ${assignmentId}
        GROUP BY ast.id
        ORDER BY ast.start_time DESC
      `);
      
      return result.rows;
    });
  }

  async getStudentQuizProgress(assignmentStudentTryId: string): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const result = await db.select()
        .from(student_try)
        .where(eq(student_try.assignment_student_try_id, assignmentStudentTryId))
        .orderBy(desc(student_try.time_start));
      
      return result;
    });
  }

  async createStudentTry(studentTry: any): Promise<any> {
    const data = {
      id: studentTry.id || crypto.randomUUID(),
      hocsinh_id: studentTry.hocsinh_id,
      question_id: studentTry.question_id,
      assignment_student_try_id: studentTry.assignment_student_try_id,
      answer_choice: studentTry.answer_choice,
      quiz_result: studentTry.quiz_result,
      score: studentTry.score,
      time_start: studentTry.time_start || new Date(),
      time_end: studentTry.time_end,
      writing_answer: studentTry.writing_answer
    };

    try {
      const result = await db.insert(student_try).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating student_try:', error);
      return data;
    }
  }

  async getStudentTryById(id: string): Promise<any> {
    const result = await db.select().from(student_try).where(eq(student_try.id, id));
    return result[0] || null;
  }

  async getAllStudentTries(): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const result = await db.select().from(student_try);
      return result;
    });
  }

  async updateStudentTry(id: string, updates: any): Promise<any> {
    const result = await db.update(student_try)
      .set({ ...updates, update: new Date() })
      .where(eq(student_try.id, id))
      .returning();
    return result[0];
  }

  async getStudentLearningProgress(studentId: string): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const result = await db.select()
        .from(learning_progress)
        .where(eq(learning_progress.student_id, studentId))
        .orderBy(desc(learning_progress.updated_at));
      return result;
    });
  }

  async createLearningProgress(progress: any): Promise<any> {
    const data = {
      id: progress.id || crypto.randomUUID(),
      student_id: progress.student_id,
      content_id: progress.content_id,
      progress_percentage: progress.progress_percentage || 0,
      time_spent_minutes: progress.time_spent_minutes || 0,
      last_accessed: progress.last_accessed || new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.insert(learning_progress).values(data).returning();
    return result[0];
  }

  async updateLearningProgress(id: string, updates: any): Promise<any> {
    const result = await db.update(learning_progress)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(learning_progress.id, id))
      .returning();
    return result[0];
  }

  async updateContent(id: string, updates: { 
    short_description?: string; 
    short_blurb?: string; 
    imageid?: string; 
    videoid?: string; 
    videoid2?: string; 
  }): Promise<Content | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.update(content)
        .set(updates)
        .where(eq(content.id, id))
        .returning();
      return result[0];
    });
  }

  async getContentGroups(): Promise<Array<{ contentgroup: string; url: string; content_count: number }>> {
    return this.executeWithRetry(async () => {
      const result = await db.execute(sql`
        SELECT 
          contentgroup,
          url,
          COUNT(*) as content_count
        FROM content 
        WHERE contentgroup IS NOT NULL AND contentgroup != ''
        GROUP BY contentgroup, url
        ORDER BY content_count DESC
      `);

      return result.rows.map((row: any) => ({
        contentgroup: row.contentgroup,
        url: row.url || '',
        content_count: parseInt(row.content_count)
      }));
    });
  }

  async getContentByGroup(contentgroup: string): Promise<Content[]> {
    return this.executeWithRetry(async () => {
      const result = await db.select()
        .from(content)
        .where(eq(content.contentgroup, contentgroup));
      return result;
    });
  }

  async getStudentTriesLeaderboard(): Promise<any[]> {
    return this.executeWithRetry(async () => {
      const result = await db.execute(sql`
        SELECT 
          hocsinh_id,
          COUNT(*) as total_tries,
          SUM(CASE WHEN quiz_result = '✅' THEN 1 ELSE 0 END) as correct_answers,
          ROUND(
            (SUM(CASE WHEN quiz_result = '✅' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
            1
          ) as accuracy_percentage
        FROM student_try 
        GROUP BY hocsinh_id 
        ORDER BY total_tries DESC, accuracy_percentage DESC
        LIMIT 20
      `);

      return result.rows.map((row: any, index: number) => ({
        rank: index + 1,
        student_id: row.hocsinh_id,
        total_tries: parseInt(row.total_tries),
        correct_answers: parseInt(row.correct_answers),
        accuracy_percentage: parseFloat(row.accuracy_percentage)
      }));
    });
  }

  async getPersonalContent(studentId: string): Promise<any[]> {
    return this.executeWithRetry(async () => {
      const result = await db.execute(sql`
        SELECT 
          cr.id,
          cr.content_id as "contentId",
          c.title,
          COALESCE(t.topic, 'Unknown Topic') as topic,
          cr.personal_note,
          cr.rating as difficulty_rating,
          cr.updated_at
        FROM content_ratings cr
        JOIN content c ON cr.content_id = c.id
        LEFT JOIN topic t ON c.topicid = t.id
        WHERE cr.student_id = '${studentId}'
          AND (cr.personal_note IS NOT NULL AND cr.personal_note != '' OR cr.rating IS NOT NULL)
        ORDER BY cr.updated_at DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        contentId: row.contentId,
        title: row.title || 'Untitled Content',
        topic: row.topic,
        personal_note: row.personal_note,
        difficulty_rating: row.difficulty_rating,
        updated_at: row.updated_at
      }));
    });
  }

  async getContentProgress(studentId: string): Promise<any[]> {
    return this.executeWithRetry(async () => {
      const result = await db.execute(sql`
        SELECT DISTINCT
          c.id,
          c.topicid,
          COALESCE(t.topic, 'Unknown Topic') as topic,
          c.title,
          cr.rating as difficulty_rating,
          (SELECT COUNT(*) FROM question q WHERE q.contentid = c.id) as question_count,
          MAX(st.update) as completed_at,
          c.parentid,
          COUNT(CASE WHEN cr.rating = 'easy' THEN 1 END) as ok_count,
          COUNT(CASE WHEN cr.rating = 'hard' THEN 1 END) as really_bad_count
        FROM content c
        LEFT JOIN topic t ON c.topicid = t.id
        LEFT JOIN content_ratings cr ON cr.content_id = c.id AND cr.student_id = '${studentId}'
        LEFT JOIN question q ON q.contentid = c.id
        LEFT JOIN student_try st ON st.question_id = q.id AND st.hocsinh_id = '${studentId}'
        WHERE c.parentid IN ARRAY['1', '2', '3', '4', '5', '6', '7']
        GROUP BY c.id, c.topicid, t.topic, c.title, cr.rating, c.parentid
        ORDER BY c.title
      `);

      return result.rows;
    });
  }

  async getCronJob(jobName: string): Promise<CronJob | undefined> {
    const result = await db.select().from(cron_jobs).where(eq(cron_jobs.job_name, jobName));
    return result[0];
  }

  async createCronJob(job: InsertCronJob): Promise<CronJob> {
    const result = await db.insert(cron_jobs).values(job).returning();
    return result[0];
  }

  async updateCronJob(jobName: string, lastRun: Date, nextRun: Date): Promise<CronJob> {
    const result = await db.update(cron_jobs)
      .set({ last_run: lastRun, next_run: nextRun })
      .where(eq(cron_jobs.job_name, jobName))
      .returning();
    return result[0];
  }

  async updateStudentTryContent(): Promise<void> {
    return this.executeWithRetry(async () => {
      console.log('Starting student try content update...');
      
      const studentContentCombinations = await db.execute(sql`
        SELECT DISTINCT
          st.hocsinh_id,
          q.contentid,
          STRING_AGG(st.question_id ORDER BY st.time_start, ',') as question_ids
        FROM student_try st
        INNER JOIN question q ON q.id = st.question_id
        WHERE st.time_start >= ${new Date(Date.now() - 24 * 60 * 60 * 1000)}
          AND q.contentid IS NOT NULL
        GROUP BY st.hocsinh_id, q.contentid
      `);

      console.log(`Processing ${studentContentCombinations.rows.length} student-content combinations for question tracking`);
      
      for (const row of studentContentCombinations.rows) {
        const currentQuestionIds = row.question_ids;
        
        const existingRecord = await db.execute(sql`
          SELECT * FROM student_try_content 
          WHERE hocsinh_id = '${row.hocsinh_id}' 
            AND contentid = '${row.contentid}'
        `);

        if (existingRecord.rows.length > 0) {
          const newQuestionIds = currentQuestionIds;
          const timeEnd = new Date().toISOString();
          
          await db.execute(sql`
            UPDATE student_try_content 
            SET update = '${newQuestionIds}', time_end = '${timeEnd}'
            WHERE hocsinh_id = '${row.hocsinh_id}' 
              AND contentid = '${row.contentid}'
          `);
          
          console.log(`Updated existing record for student ${row.hocsinh_id}, content ${row.contentid}`);
        } else {
          await db.execute(sql`
            INSERT INTO student_try_content (id, contentid, hocsinh_id, student_try_id, time_start, time_end, update)
            VALUES (
              '${crypto.randomUUID()}',
              '${row.contentid}',
              '${row.hocsinh_id}',
              '${row.student_try_id}',
              '${new Date().toISOString()}',
              '${new Date().toISOString()}',
              '${row.question_ids}'
            )
          `);
          
          console.log(`Created new tracking record for student ${row.hocsinh_id}, content ${row.contentid}`);
        }
      }
      
      console.log(`Updated student try content tracking for ${studentContentCombinations.rows.length} records`);
    });
  }

  async createPendingAccessRequest(request: any): Promise<any> {
    const data = {
      id: crypto.randomUUID(),
      ...request
    };
    const result = await db.insert(pending_access_requests).values(data).returning();
    return result[0];
  }

  async createStudentTryContent(record: any): Promise<any> {
    const data = {
      id: crypto.randomUUID(),
      ...record
    };
    const result = await db.insert(student_try_content).values(data).returning();
    return result[0];
  }

  async getStudentTryContentByStudent(studentId: string): Promise<any[]> {
    const result = await db.select()
      .from(student_try_content)
      .where(eq(student_try_content.hocsinh_id, studentId));
    return result;
  }

  async getRecentStudentTryContent(): Promise<any[]> {
    const result = await db.select()
      .from(student_try_content)
      .orderBy(desc(student_try_content.time_start))
      .limit(100);
    return result;
  }

  async getLiveClassActivities(studentIds: string[], startTime: string): Promise<any[]> {
    return this.executeWithRetry(async () => {
      const studentIdsList = studentIds.map(id => `'${id}'`).join(',');
      
      const activitiesResult = await db.execute(sql`
        SELECT 
          u.id,
          COALESCE(u.full_name, u.first_name || ' ' || u.last_name, u.id) as student_name,
          -- Content viewed count
          (SELECT COUNT(*) FROM student_try_content stc 
           WHERE stc.hocsinh_id = u.id 
           AND stc.time_start >= '${startTime}') as content_viewed,
          -- Content rated count  
          (SELECT COUNT(*) FROM content_ratings cr 
           WHERE cr.student_id = u.id 
           AND cr.updated_at >= '${startTime}') as content_rated,
          -- Quiz accuracy (null for now)
          (SELECT COUNT(*) as attempts_count,
           AVG(CASE WHEN score > 0 THEN 1.0 ELSE 0.0 END) as accuracy
           FROM student_tries st 
           WHERE st.hocsinh_id = u.id 
           AND st.timestamp >= '${startTime}') as quiz_accuracy,
          -- Last activity timestamp
          GREATEST(
            (SELECT MAX(time_start) FROM student_try_content stc WHERE stc.hocsinh_id = u.id),
            (SELECT MAX(updated_at) FROM content_ratings cr WHERE cr.student_id = u.id),
            (SELECT MAX(timestamp) FROM student_tries st WHERE st.hocsinh_id = u.id)
          ) as last_activity
        FROM users u 
        WHERE u.id = ANY(ARRAY[${studentIdsList}])
        ORDER BY u.id
      `);

      return activitiesResult.rows.map((row: any) => ({
        student_id: row.id,
        student_name: row.student_name,
        content_viewed: parseInt(row.content_viewed || 0),
        content_rated: parseInt(row.content_rated || 0),
        quiz_accuracy: null,
        last_activity: row.last_activity,
        activities: []
      }));
    });
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.update(users)
        .set({ ...updateData, updated_at: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    });
  }

  async updateTopic(topicId: string, updateData: Partial<Topic>): Promise<Topic | undefined> {
    return this.executeWithRetry(async () => {
      const result = await db.update(topics)
        .set(updateData)
        .where(eq(topics.id, topicId))
        .returning();
      return result[0];
    });
  }

  async createTopic(topicData: any): Promise<Topic> {
    return this.executeWithRetry(async () => {
      if (!topicData.id) {
        topicData.id = crypto.randomBytes(4).toString('hex');
      }

      const result = await db
        .insert(topics)
        .values(topicData)
        .returning();
      return result[0];
    });
  }

  async createContent(contentData: any): Promise<Content> {
    return this.executeWithRetry(async () => {
      if (!contentData.id) {
        contentData.id = crypto.randomBytes(4).toString('hex');
      }

      const result = await db
        .insert(content)
        .values(contentData)
        .returning();
      return result[0];
    });
  }

  async createMatching(matchingData: any): Promise<Matching> {
    return this.executeWithRetry(async () => {
      if (!matchingData.id) {
        matchingData.id = crypto.randomBytes(4).toString('hex');
      }

      const result = await db
        .insert(matching)
        .values(matchingData)
        .returning();
      return result[0];
    });
  }
}

export const storage = new DatabaseStorage();