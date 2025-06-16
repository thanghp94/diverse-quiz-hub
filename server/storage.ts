import { users, topics, content, images, questions, matching, videos, matching_attempts, content_ratings, student_streaks, daily_activities, writing_prompts, writing_submissions, type User, type InsertUser, type Topic, type Content, type Image, type Question, type Matching, type Video, type MatchingAttempt, type InsertMatchingAttempt, type ContentRating, type InsertContentRating, type StudentStreak, type InsertStudentStreak, type DailyActivity, type InsertDailyActivity, type WritingPrompt, type InsertWritingPrompt, type WritingSubmission, type InsertWritingSubmission } from "@shared/schema";
import { db } from "./db";
import { eq, isNull, ne, asc, sql, and, desc } from "drizzle-orm";

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
  getContentRating(studentId: string, contentId: string): Promise<ContentRating | undefined>;
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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
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
    return await db.select().from(topics).orderBy(asc(topics.topic));
  }

  async getBowlChallengeTopics(): Promise<Topic[]> {
    return await db.select().from(topics)
      .where(
        sql`${topics.parentid} IS NULL 
        AND ${topics.topic} IS NOT NULL 
        AND ${topics.topic} != ''
        AND ${topics.topic} NOT IN ('Art', 'Bowl', 'Challenge', 'Debate', 'History', 'Literature', 'Media', 'Music', 'Science and Technology', 'Social Studies', 'Special areas', 'Teaching lesson', 'Writing')`
      )
      .orderBy(asc(topics.topic));
  }

  async getTopicById(id: string): Promise<Topic | undefined> {
    const result = await db.select().from(topics).where(eq(topics.id, id));
    return result[0];
  }

  // Content
  async getContent(topicId?: string): Promise<Content[]> {
    if (topicId) {
      return await db.select().from(content).where(eq(content.topicid, topicId));
    }
    return await db.select().from(content);
  }

  async getContentById(id: string): Promise<Content | undefined> {
    const result = await db.select().from(content).where(eq(content.id, id));
    return result[0];
  }

  // Images
  async getImages(): Promise<Image[]> {
    return await db.select().from(images);
  }

  async getImageById(id: string): Promise<Image | undefined> {
    const result = await db.select().from(images).where(eq(images.id, id));
    return result[0];
  }

  // Questions
  async getQuestions(contentId?: string, topicId?: string, level?: string): Promise<Question[]> {
    if (contentId && level) {
      return await db.select().from(questions)
        .where(sql`${questions.contentid} = ${contentId} AND ${questions.questionlevel} = ${level}`);
    } else if (contentId) {
      return await db.select().from(questions).where(eq(questions.contentid, contentId));
    } else if (topicId && level) {
      return await db.select().from(questions)
        .where(sql`${questions.topicid} = ${topicId} AND ${questions.questionlevel} = ${level}`);
    } else if (topicId) {
      return await db.select().from(questions).where(eq(questions.topicid, topicId));
    } else if (level) {
      return await db.select().from(questions).where(eq(questions.questionlevel, level));
    }
    
    return await db.select().from(questions);
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

  async getContentRating(studentId: string, contentId: string): Promise<ContentRating | undefined> {
    const result = await db.select().from(content_ratings)
      .where(and(
        eq(content_ratings.student_id, studentId),
        eq(content_ratings.content_id, contentId)
      ));
    return result[0] || undefined;
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
      totalPoints: totalPointsResult,
      bestStreak: bestStreakResult,
      todayQuizzes: todayQuizzesResult,
      weeklyQuizzes: weeklyQuizzesResult
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
}

export const storage = new DatabaseStorage();
