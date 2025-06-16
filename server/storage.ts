import { users, topics, content, images, questions, matching, videos, type User, type InsertUser, type Topic, type Content, type Image, type Question, type Matching, type Video } from "@shared/schema";
import { db } from "./db";
import { eq, isNull, ne, asc, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  
  // Videos
  getVideos(): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | undefined>;
  getVideosByContentId(contentId: string): Promise<Video[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
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
        AND ${topics.topic} != ''`
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
}

export const storage = new DatabaseStorage();
