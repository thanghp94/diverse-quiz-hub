import { users, topics, content, images, questions, matching, videos, matching_attempts, content_ratings, student_streaks, daily_activities, writing_prompts, writing_submissions, assignment, assignment_student_try, student_try, learning_progress, type User, type InsertUser, type Topic, type Content, type Image, type Question, type Matching, type Video, type MatchingAttempt, type InsertMatchingAttempt, type ContentRating, type InsertContentRating, type StudentStreak, type InsertStudentStreak, type DailyActivity, type InsertDailyActivity, type WritingPrompt, type InsertWritingPrompt, type WritingSubmission, type InsertWritingSubmission, type LearningProgress, type InsertLearningProgress } from "@shared/schema";
import { db } from "./db";
import { eq, isNull, ne, asc, sql, and, desc, inArray, gte, lte } from "drizzle-orm";
import * as schema from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Topics
  getTopics(): Promise<Topic[]>;
  getBowlChallengeTopics(): Promise<Topic[]>;
  getTopicById(id: string): Promise<Topic | undefined>;

  // Content
  getContent(topicId?: string): Promise<Content[]>;
  getContentById(id: string): Promise<Content | undefined>;
  updateContent(id: string, updates: { short_description?: string; short_blurb?: string; imageid?: string; videoid?: string; videoid2?: string }): Promise<Content | undefined>;

  // Content Groups
  getContentGroups(): Promise<Array<{ contentgroup: string; url: string; content_count: number }>>;
  getContentByGroup(contentgroup: string): Promise<Content[]>;

  // Images
  getImages(): Promise<Image[]>;
  getImageById(id: string): Promise<Image | undefined>;

  // Questions
  getQuestions(contentId?: string, topicId?: string, level?: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;

  // Matching
  getMatchingActivities(): Promise<Matching[]>;
  getMatchingById(id: string): Promise<Matching | undefined>;
  getMatchingByTopicId(topicId: string): Promise<Matching[]>;

  // Videos
  getVideos(): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | undefined>;
  getVideosByContentId(contentId: string): Promise<Video[]>;

  // Matching Attempts
  createMatchingAttempt(attempt: InsertMatchingAttempt): Promise<MatchingAttempt>;
  getMatchingAttempts(studentId: string, matchingId?: string): Promise<MatchingAttempt[]>;
  getMatchingAttemptById(id: string): Promise<MatchingAttempt | undefined>;
  updateMatchingAttempt(id: string, updates: Partial<MatchingAttempt>): Promise<MatchingAttempt>;

  // Content Ratings
  createContentRating(rating: InsertContentRating): Promise<ContentRating>;
  getContentRating(studentId: string, contentId: string): Promise<ContentRating | null>;
  updateContentRating(studentId: string, contentId: string, rating: string): Promise<ContentRating>;
  getContentRatingStats(contentId: string): Promise<{ easy: number; normal: number; hard: number }>;

  // Student Streaks
  getStudentStreak(studentId: string): Promise<StudentStreak | undefined>;
  updateStudentStreak(studentId: string): Promise<StudentStreak>;
  getStreakLeaderboard(limit?: number): Promise<StudentStreak[]>;

  // Daily Activities
  recordDailyActivity(studentId: string, points: number): Promise<DailyActivity>;
  getDailyActivity(studentId: string, date: Date): Promise<DailyActivity | undefined>;
  getLeaderboards(): Promise<{
    totalPoints: Array<{ student_id: string; total_points: number; full_name?: string }>;
    bestStreak: Array<{ student_id: string; longest_streak: number; full_name?: string }>;
    todayQuizzes: Array<{ student_id: string; today_count: number; full_name?: string }>;
    weeklyQuizzes: Array<{ student_id: string; weekly_count: number; full_name?: string }>;
  }>;

  // Writing Prompts
  getWritingPrompts(): Promise<WritingPrompt[]>;
  getWritingPromptById(id: string): Promise<WritingPrompt | undefined>;
  getWritingPromptsByCategory(category: string): Promise<WritingPrompt[]>;

  // Writing Submissions
  createWritingSubmission(submission: InsertWritingSubmission): Promise<WritingSubmission>;
  getWritingSubmission(id: string): Promise<WritingSubmission | undefined>;
  getStudentWritingSubmissions(studentId: string): Promise<WritingSubmission[]>;
  updateWritingSubmission(id: string, updates: Partial<WritingSubmission>): Promise<WritingSubmission>;

  // Assignments
  createAssignment(assignment: any): Promise<any>;
  getAssignmentById(id: string): Promise<any>;
  getAllAssignments(): Promise<any[]>;
  getLiveClassAssignments(): Promise<any[]>;
  duplicateAssignment(id: string, newType: string): Promise<any>;

  // Assignment Student Tries
  createAssignmentStudentTry(assignmentStudentTryData: any): Promise<any>;
  getAssignmentStudentTryById(id: string): Promise<any>;
  getAllAssignmentStudentTries(): Promise<any[]>;

  // Student Tries
  createStudentTry(studentTry: any): Promise<any>;
  getStudentTryById(id: string): Promise<any>;
  getAllStudentTries(): Promise<any[]>;
  updateStudentTry(id: string, updates: any): Promise<any>;

  // Learning Progress
  getStudentLearningProgress(studentId: string): Promise<any[]>;
  createLearningProgress(progress: any): Promise<any>;
  updateLearningProgress(id: string, updates: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  private async executeWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        console.error(`Database operation failed (attempt ${attempt}/${retries}):`, error?.message || error);

        if (attempt === retries) {
          throw error;
        }

        // If it's a connection issue, wait and retry
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
    return this.executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(
      sql`${users.email} = ${email} OR ${users.meraki_email} = ${email}`
    );
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Topics
  async getTopics(): Promise<Topic[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(topics).orderBy(asc(topics.topic));
    });
  }

  async getBowlChallengeTopics(): Promise<Topic[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(topics)
        .where(
          sql`${topics.parentid} IS NULL 
          AND ${topics.topic} IS NOT NULL 
          AND ${topics.topic} != ''
          AND ${topics.topic} NOT IN ('Art', 'Bowl', 'Challenge', 'Debate', 'History', 'Literature', 'Media', 'Music', 'Science and Technology', 'Social Studies', 'Special areas', 'Teaching lesson', 'Writing')`
        )
        .orderBy(asc(topics.topic));
    });
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    const result = await db.select().from(topics).where(eq(topics.id, id));
    return result[0];
  }

  // Content
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

  // Images
  async getImages(): Promise<Image[]> {
    return this.executeWithRetry(async () => {
      return await db.select().from(images);
    });
  }

  async getImageById(id: string): Promise<Image | undefined> {
    const result = await db.select().from(images).where(eq(images.id, id));
    return result[0];
  }

  // Questions
  async getQuestions(contentId?: string, topicId?: string, level?: string) {
    try {
      console.log(`Storage: getQuestions called with contentId: ${contentId}, topicId: ${topicId}, level: ${level}`);
      
      let query = db.select().from(schema.questions);
      const conditions = [];

      if (contentId) {
        conditions.push(eq(schema.questions.contentid, contentId));
        console.log(`Added contentId condition: ${contentId}`);
      } else if (topicId) {
        // For topic-level queries, first get all content IDs for this topic
        console.log(`Getting content IDs for topicId: ${topicId}`);
        const contentInTopic = await db
          .select({ id: schema.content.id })
          .from(schema.content)
          .where(eq(schema.content.topicid, topicId));
        
        const contentIds = contentInTopic.map(c => c.id);
        console.log(`Found ${contentIds.length} content items in topic ${topicId}:`, contentIds);
        
        if (contentIds.length > 0) {
          // Filter questions by these content IDs
          conditions.push(inArray(schema.questions.contentid, contentIds));
          console.log(`Added content IDs condition for topic: ${topicId}`);
        } else {
          console.log(`No content found for topic ${topicId}, returning empty result`);
          return [];
        }
      }

      if (level && level !== 'Overview') {
        // For level filtering, use case-insensitive comparison
        const levelCondition = sql`LOWER(TRIM(${schema.questions.questionlevel})) = ${level.toLowerCase()}`;
        conditions.push(levelCondition);
        console.log(`Added level condition for: ${level.toLowerCase()}`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const questions = await query;

      console.log(`Found ${questions.length} questions for contentId: ${contentId}, topicId: ${topicId}, level: ${level}`);

      // If we're filtering by level and got no results, let's check what levels are available
      if (level && level !== 'Overview' && questions.length === 0 && (contentId || topicId)) {
        console.log(`No questions found for level "${level}". Checking available levels...`);
        
        let debugQuery;
        if (contentId) {
          debugQuery = db.select({ level: schema.questions.questionlevel }).from(schema.questions).where(eq(schema.questions.contentid, contentId));
        } else if (topicId) {
          // For topic-level debug, check levels across all content in the topic
          const contentInTopic = await db
            .select({ id: schema.content.id })
            .from(schema.content)
            .where(eq(schema.content.topicid, topicId));
          
          const contentIds = contentInTopic.map(c => c.id);
          if (contentIds.length > 0) {
            debugQuery = db.select({ level: schema.questions.questionlevel }).from(schema.questions).where(inArray(schema.questions.contentid, contentIds));
          } else {
            return [];
          }
        }

        if (debugQuery) {
          const availableLevels = await debugQuery;
          const uniqueLevels = [...new Set(availableLevels.map(q => q.level).filter(Boolean))];
          console.log(`Available levels for this content/topic:`, uniqueLevels);
          
          // Try to match with available levels case-insensitively
          const matchingLevel = uniqueLevels.find(l => l && l.toLowerCase() === level.toLowerCase());
          if (matchingLevel) {
            console.log(`Found matching level with different case: "${matchingLevel}"`);
            // Re-run query with the correctly cased level
            const correctedConditions = [...conditions];
            correctedConditions[correctedConditions.length - 1] = sql`LOWER(TRIM(${schema.questions.questionlevel})) = ${matchingLevel.toLowerCase()}`;
            const correctedQuery = db.select().from(schema.questions).where(and(...correctedConditions));
            const correctedQuestions = await correctedQuery;
            console.log(`Found ${correctedQuestions.length} questions with corrected level case`);
            return correctedQuestions;
          }
        }
      }

      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const result = await db.select().from(questions).where(eq(questions.id, id));
    return result[0];
  }

  // Matching
  async getMatchingActivities(): Promise<Matching[]> {
    return await db.select().from(matching);
  }

  async getMatchingById(id: string): Promise<Matching | undefined> {
    const result = await db.select().from(matching).where(eq(matching.id, id));
    return result[0];
  }

  async getMatchingByTopicId(topicId: string): Promise<Matching[]> {
    return await db.select().from(matching).where(eq(matching.topicid, topicId));
  }

  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.id, id));
    return result[0] || undefined;
  }

  async getVideosByContentId(contentId: string): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.contentid, contentId));
  }

  async createMatchingAttempt(attempt: InsertMatchingAttempt): Promise<MatchingAttempt> {
    const result = await db.insert(matching_attempts).values(attempt).returning();
    return result[0];
  }

  async getMatchingAttempts(studentId: string, matchingId?: string): Promise<MatchingAttempt[]> {
    if (matchingId) {
      return await db.select().from(matching_attempts)
        .where(and(
          eq(matching_attempts.student_id, studentId),
          eq(matching_attempts.matching_id, matchingId)
        ))
        .orderBy(desc(matching_attempts.created_at));
    }

    return await db.select().from(matching_attempts)
      .where(eq(matching_attempts.student_id, studentId))
      .orderBy(desc(matching_attempts.created_at));
  }

  async getMatchingAttemptById(id: string): Promise<MatchingAttempt | undefined> {
    const result = await db.select().from(matching_attempts).where(eq(matching_attempts.id, id));
    return result[0] || undefined;
  }

  async updateMatchingAttempt(id: string, updates: Partial<MatchingAttempt>): Promise<MatchingAttempt> {
    const result = await db.update(matching_attempts)
      .set(updates)
      .where(eq(matching_attempts.id, id))
      .returning();
    return result[0];
  }

  // Content Ratings
  async createContentRating(rating: InsertContentRating): Promise<ContentRating> {
    const result = await db.insert(content_ratings).values(rating).returning();
    return result[0];
  }

  async getContentRating(studentId: string, contentId: string): Promise<ContentRating | null> {
    return this.executeWithRetry(async () => {
      const result = await db.select().from(content_ratings)
        .where(and(
          eq(content_ratings.student_id, studentId),
          eq(content_ratings.content_id, contentId)
        ));
      return result[0] || null;
    });
  }

  async updateContentRating(studentId: string, contentId: string, rating: string): Promise<ContentRating> {
    const existing = await this.getContentRating(studentId, contentId);
    if (existing) {
      const result = await db.update(content_ratings)
        .set({ rating, updated_at: new Date() })
        .where(and(
          eq(content_ratings.student_id, studentId),
          eq(content_ratings.content_id, contentId)
        ))
        .returning();
      return result[0];
    } else {
      return await this.createContentRating({
        id: crypto.randomUUID(),
        student_id: studentId,
        content_id: contentId,
        rating
      });
    }
  }

  async getContentRatingStats(contentId: string): Promise<{ easy: number; normal: number; hard: number }> {
    const ratings = await db.select().from(content_ratings)
      .where(eq(content_ratings.content_id, contentId));

    return {
      easy: ratings.filter(r => r.rating === 'ok').length,
      normal: ratings.filter(r => r.rating === 'normal').length,
      hard: ratings.filter(r => r.rating === 'really_bad').length
    };
  }

  // Student Streaks
  async getStudentStreak(studentId: string): Promise<StudentStreak | undefined> {
    const result = await db.select().from(student_streaks)
      .where(eq(student_streaks.student_id, studentId));
    return result[0] || undefined;
  }

  async updateStudentStreak(studentId: string): Promise<StudentStreak> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.getStudentStreak(studentId);
    const todayActivity = await this.getDailyActivity(studentId, today);

    if (!existing) {
      const result = await db.insert(student_streaks).values({
        id: crypto.randomUUID(),
        student_id: studentId,
        current_streak: todayActivity ? 1 : 0,
        longest_streak: todayActivity ? 1 : 0,
        last_activity_date: todayActivity ? today : null
      }).returning();
      return result[0];
    }

    let newCurrentStreak = existing.current_streak || 0;
    let newLongestStreak = existing.longest_streak || 0;

    if (todayActivity) {
      const lastActivity = existing.last_activity_date;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        lastDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          newCurrentStreak += 1;
        } else if (daysDiff > 1) {
          newCurrentStreak = 1;
        }
      } else {
        newCurrentStreak = 1;
      }

      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    }

    const result = await db.update(student_streaks)
      .set({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: todayActivity ? today : existing.last_activity_date,
        updated_at: new Date()
      })
      .where(eq(student_streaks.student_id, studentId))
      .returning();
    return result[0];
  }

  async getStreakLeaderboard(limit: number = 10): Promise<StudentStreak[]> {
    return await db.select().from(student_streaks)
      .orderBy(desc(student_streaks.longest_streak))
      .limit(limit);
  }

  // Daily Activities
  async recordDailyActivity(studentId: string, points: number): Promise<DailyActivity> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.getDailyActivity(studentId, today);

    if (existing) {
      const result = await db.update(daily_activities)
        .set({
          activities_count: (existing.activities_count || 0) + 1,
          points_earned: (existing.points_earned || 0) + points
        })
        .where(eq(daily_activities.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(daily_activities).values({
        id: crypto.randomUUID(),
        student_id: studentId,
        activity_date: today,
        activities_count: 1,
        points_earned: points
      }).returning();
      return result[0];
    }
  }

  async getDailyActivity(studentId: string, date: Date): Promise<DailyActivity | undefined> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const result = await db.select().from(daily_activities)
      .where(and(
        eq(daily_activities.student_id, studentId),
        eq(daily_activities.activity_date, targetDate)
      ));
    return result[0] || undefined;
  }

  async getLeaderboards(): Promise<{
    totalPoints: Array<{ student_id: string; total_points: number; full_name?: string }>;
    bestStreak: Array<{ student_id: string; longest_streak: number; full_name?: string }>;
    todayQuizzes: Array<{ student_id: string; today_count: number; full_name?: string }>;
    weeklyQuizzes: Array<{ student_id: string; weekly_count: number; full_name?: string }>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Total points leaderboard
    const totalPointsResult = await db.select({
      student_id: daily_activities.student_id,
      total_points: sql<number>`SUM(${daily_activities.points_earned})`,
      full_name: users.full_name
    })
    .from(daily_activities)
    .leftJoin(users, eq(daily_activities.student_id, users.id))
    .groupBy(daily_activities.student_id, users.full_name)
    .orderBy(desc(sql`SUM(${daily_activities.points_earned})`))
    .limit(10);

    // Best streak leaderboard
    const bestStreakResult = await db.select({
      student_id: student_streaks.student_id,
      longest_streak: student_streaks.longest_streak,
      full_name: users.full_name
    })
    .from(student_streaks)
    .leftJoin(users, eq(student_streaks.student_id, users.id))
    .orderBy(desc(student_streaks.longest_streak))
    .limit(10);

    // Today's quizzes leaderboard
    const todayQuizzesResult = await db.select({
      student_id: daily_activities.student_id,
      today_count: daily_activities.activities_count,
      full_name: users.full_name
    })
    .from(daily_activities)
    .leftJoin(users, eq(daily_activities.student_id, users.id))
    .where(eq(daily_activities.activity_date, today))
    .orderBy(desc(daily_activities.activities_count))
    .limit(10);

    // Weekly quizzes leaderboard
    const weeklyQuizzesResult = await db.select({
      student_id: daily_activities.student_id,
      weekly_count: sql<number>`SUM(${daily_activities.activities_count})`,
      full_name: users.full_name
    })
    .from(daily_activities)
    .leftJoin(users, eq(daily_activities.student_id, users.id))
    .where(sql`${daily_activities.activity_date} >= ${weekAgo}`)
    .groupBy(daily_activities.student_id, users.full_name)
    .orderBy(desc(sql`SUM(${daily_activities.activities_count})`))
    .limit(10);

    return {
      totalPoints: totalPointsResult.map(r => ({
        student_id: r.student_id,
        total_points: r.total_points,
        full_name: r.full_name || undefined
      })),
      bestStreak: bestStreakResult.map(r => ({
        student_id: r.student_id,
        longest_streak: r.longest_streak || 0,
        full_name: r.full_name || undefined
      })),
      todayQuizzes: todayQuizzesResult.map(r => ({
        student_id: r.student_id,
        today_count: r.today_count || 0,
        full_name: r.full_name || undefined
      })),
      weeklyQuizzes: weeklyQuizzesResult.map(r => ({
        student_id: r.student_id,
        weekly_count: r.weekly_count,
        full_name: r.full_name || undefined
      }))
    };
  }

  // Writing Prompts
  async getWritingPrompts(): Promise<WritingPrompt[]> {
    return await db.select().from(writing_prompts).orderBy(asc(writing_prompts.category));
  }

  async getWritingPromptById(id: string): Promise<WritingPrompt | undefined> {
    const result = await db.select().from(writing_prompts).where(eq(writing_prompts.id, id));
    return result[0] || undefined;
  }

  async getWritingPromptsByCategory(category: string): Promise<WritingPrompt[]> {
    return await db.select().from(writing_prompts)
      .where(eq(writing_prompts.category, category))
      .orderBy(asc(writing_prompts.title));
  }

  // Writing Submissions
  async createWritingSubmission(submission: InsertWritingSubmission): Promise<WritingSubmission> {
    const result = await db.insert(writing_submissions).values(submission).returning();
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

  // Assignments
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
      // Return a simple assignment object if database insert fails
      return {
        id: assignmentData.id,
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
      // First get the original assignment
      const originalAssignment = await db.select().from(assignment).where(eq(assignment.id, id));
      if (!originalAssignment[0]) {
        throw new Error('Assignment not found');
      }

      const original = originalAssignment[0];
      const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a duplicate with new type and id
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

  // Assignment Student Tries
  async createAssignmentStudentTry(assignmentStudentTryData: any): Promise<any> {
    console.log('Creating assignment_student_try with input:', assignmentStudentTryData);

    const data = {
      assignmentid: assignmentStudentTryData.assignmentid || null,
      contentid: assignmentStudentTryData.contentid || assignmentStudentTryData.contentID || null,
      hocsinh_id: assignmentStudentTryData.hocsinh_id,
      questionids: assignmentStudentTryData.questionids || assignmentStudentTryData.questionIDs || JSON.stringify([]),
      start_time: assignmentStudentTryData.start_time || new Date().toISOString(),
      typeoftaking: assignmentStudentTryData.typeoftaking || 'Overview'
    };

    console.log('Inserting assignment_student_try data:', data);

    try {
      const result = await db.insert(assignment_student_try).values(data).returning();
      console.log('Assignment_student_try created successfully:', result[0]);
      return result[0];
    } catch (error) {
      console.error('Error creating assignment_student_try:', error);
      throw error;
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

  // Live Class Assignment Methods
  async getLiveClassAssignments(): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      // Get current UTC time
      const now = new Date();
      
      // Calculate 3 hours ago in UTC (assignments created within last 3 hours)
      const threeHoursAgo = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      
      // Convert to Vietnam timezone for display
      const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      
      console.log('Current UTC time:', now.toISOString());
      console.log('Vietnam time (display):', vietnamTime.toISOString());
      console.log('Looking for assignments created after UTC:', threeHoursAgo.toISOString());
      
      // Query assignments that were created within the last 3 hours
      const result = await db.select()
        .from(assignment)
        .where(
          sql`${assignment.created_at} >= ${threeHoursAgo.toISOString()}`
        )
        .orderBy(desc(assignment.created_at));
      
      console.log('Found live assignments:', result.length);
      if (result.length > 0) {
        console.log('Assignment creation dates:', result.map(a => ({ id: a.id, assignmentname: a.assignmentname, created_at: a.created_at })));
      }
      return result;
    });
  }

  async getAssignmentStudentProgress(assignmentId: string): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      // Get all student tries for this assignment with student details
      const result = await db.select({
        assignment_student_try: assignment_student_try,
        student_tries: student_try,
        user: users
      })
      .from(assignment_student_try)
      .leftJoin(student_try, eq(student_try.assignment_student_try_id, assignment_student_try.id))
      .leftJoin(users, eq(users.id, assignment_student_try.hocsinh_id))
      .where(eq(assignment_student_try.assignmentid, assignmentId))
      .orderBy(assignment_student_try.start_time);
      
      return result;
    });
  }

  async getStudentQuizProgress(assignmentStudentTryId: string): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      // Get detailed quiz progress for a specific assignment student try
      const result = await db.select()
        .from(student_try)
        .where(eq(student_try.assignment_student_try_id, assignmentStudentTryId.toString()))
        .orderBy(student_try.time_start);
      
      return result;
    });
  }

  // Student Tries
  async createStudentTry(studentTry: any): Promise<any> {
    return this.executeWithRetry(async () => {
      // Create student_try record with all question response data
      const studentTryData = {
        id: `try_${Date.now()}`,
        assignment_student_try_id: studentTry.assignment_student_try_id?.toString() || null,
        hocsinh_id: studentTry.hocsinh_id,
        question_id: studentTry.question_id || null,
        answer_choice: studentTry.answer_choice || null,
        correct_answer: studentTry.correct_answer || null,
        quiz_result: studentTry.quiz_result || null,
        time_start: studentTry.time_start || null,
        time_end: studentTry.time_end || null,
        currentindex: studentTry.currentindex || null,
        showcontent: studentTry.showcontent || null
      };

      console.log('Creating student_try with data:', studentTryData);

      const studentTryResult = await db.insert(student_try).values(studentTryData).returning();
      console.log('Student_try created successfully:', studentTryResult[0]);
      return studentTryResult[0];
    });
  }

  async getStudentTryById(id: string): Promise<any> {
    const result = await db.select().from(student_try).where(eq(student_try.id, id));
    return result[0] || null;
  }

  async getAllStudentTries(): Promise<any[]> {
    const result = await db.select().from(student_try);
    return result;
  }

  async updateStudentTry(id: string, updates: any): Promise<any> {
    const result = await db.update(student_try)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(student_try.id, id))
      .returning();
    return result[0];
  }

  // Learning Progress Methods
  async getStudentLearningProgress(studentId: string): Promise<any[]> {
    return await this.executeWithRetry(async () => {
      const result = await db.select()
        .from(schema.learning_progress)
        .where(eq(schema.learning_progress.student_id, studentId));
      return result;
    });
  }

  async createLearningProgress(progress: any): Promise<any> {
    return await this.executeWithRetry(async () => {
      const result = await db.insert(schema.learning_progress)
        .values(progress)
        .returning();
      return result[0];
    });
  }

  async updateLearningProgress(id: string, updates: any): Promise<any> {
    return await this.executeWithRetry(async () => {
      const result = await db.update(schema.learning_progress)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(schema.learning_progress.id, id))
        .returning();
      return result[0];
    });
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
      return result[0] || undefined;
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
        name: row.hocsinh_id, // Using ID as name for now
        total_tries: parseInt(row.total_tries),
        correct_answers: parseInt(row.correct_answers),
        accuracy: parseFloat(row.accuracy_percentage) || 0
      }));
    });
  }
}

export const storage = new DatabaseStorage();