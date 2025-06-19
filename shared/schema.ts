import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  first_name: text("first_name"),
  last_name: text("last_name"),
  full_name: text("full_name"),
  assignment_student_try_id: text("assignment_student_try_id"),
  assignment_id: text("assignment_id"),
  email: text("email"),
  topic_id: text("topic_id"),
  content_id: text("content_id"),
  typeoftaking: text("typeoftaking"),
  question_id: text("question_id"),
  meraki_email: text("meraki_email"),
  answer_choice: text("answer_choice"),
  quiz_result: text("quiz_result"),
  show: text("show"),
  category: text("category"),
  session_shown_ids: text("session_shown_ids"),
  content_viewed: integer("content_viewed"),
  total_score: integer("total_score"),
  question_viewed: integer("question_viewed"),
  time_start: text("time_start"),
  time_end: text("time_end"),
  correct_answer: text("correct_answer"),
  show_content: boolean("show_content"),
  current_index: integer("current_index"),
  writing_answer: text("writing_answer"),
  created_at: timestamp("created_at").defaultNow(),
});

export const topics = pgTable("topic", {
  id: text("id").primaryKey(),
  topic: text("topic"),
  short_summary: text("short_summary"),
  challengesubject: text("challengesubject"),
  image: text("image"),
  parentid: text("parentid"),
  showstudent: boolean("showstudent"),
});

export const content = pgTable("content", {
  id: text("id").primaryKey(),
  topicid: text("topicid"),
  imageid: text("imageid"),
  videoid: text("videoid"),
  videoid2: text("videoid2"),
  challengesubject: text("challengesubject").array(),
  parentid: text("parentid"),
  prompt: text("prompt"),
  information: text("information"),
  title: text("title").notNull(),
  short_blurb: text("short_blurb"),
  second_short_blurb: text("second_short_blurb"),
  mindmap: text("mindmap"),
  mindmapurl: text("mindmapurl"),
  translation: text("translation"),
  vocabulary: text("vocabulary"),
  classdone: text("classdone"),
  studentseen: text("studentseen"),
  show: text("show"),
  showtranslation: text("showtranslation"),
  showstudent: text("showstudent"),
  order: text("order"),
  contentgroup: text("contentgroup"),
  typeoftaking: text("typeoftaking"),
  short_description: text("short_description"),
  url: text("url"),
  header: text("header"),
  update: text("update"),
  imagelink: text("imagelink"),
  translation_dictionary: jsonb("translation_dictionary"),
});

export const images = pgTable("image", {
  id: text("id").primaryKey(),
  imagelink: text("imagelink"),
  contentid: text("contentid"),
  default: text("default"),
  description: text("description"),
  imagefile: text("imagefile"),
  name: text("name"),
  questionid: text("questionid"),
  showimage: text("showimage"),
  topicid: text("topicid"),
});

export const questions = pgTable("question", {
  id: text("id").primaryKey(),
  topic: text("topic"),
  randomorder: text("randomorder"),
  questionlevel: text("questionlevel"),
  contentid: text("contentid"),
  question_type: text("question_type"),
  noi_dung: text("noi_dung"),
  video: text("video"),
  picture: text("picture"),
  cau_tra_loi_1: text("cau_tra_loi_1"),
  cau_tra_loi_2: text("cau_tra_loi_2"),
  cau_tra_loi_3: text("cau_tra_loi_3"),
  cau_tra_loi_4: text("cau_tra_loi_4"),
  correct_choice: text("correct_choice"),
  writing_choice: text("writing_choice"),
  time: text("time"),
  explanation: text("explanation"),
  questionorder: text("questionorder"),
  tg_tao: text("tg_tao"),
  answer: text("answer"),
});

export const matching = pgTable("matching", {
  id: text("id").primaryKey(),
  type: text("type"),
  subject: text("subject"),
  topic: text("topic"),
  description: text("description"),
  prompt1: text("prompt1"),
  prompt2: text("prompt2"),
  prompt3: text("prompt3"),
  prompt4: text("prompt4"),
  prompt5: text("prompt5"),
  prompt6: text("prompt6"),
  choice1: text("choice1"),
  choice2: text("choice2"),
  choice3: text("choice3"),
  choice4: text("choice4"),
  choice5: text("choice5"),
  choice6: text("choice6"),
  topicid: text("topicid"),
  created_at: timestamp("created_at").defaultNow(),
});

export const videos = pgTable("video", {
  id: text("id").primaryKey(),
  topicid: text("topicid"),
  contentid: text("contentid"),
  videolink: text("videolink"),
  videoupload: text("videoupload"),
  showvideo: text("showvideo"),
  video_name: text("video_name"),
  description: text("description"),
  first: text("first"),
  second: text("second"),
  created_at: timestamp("created_at").defaultNow(),
});

export const matching_attempts = pgTable("matching_attempts", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  matching_id: text("matching_id").notNull(),
  answers: jsonb("answers"), // Store student's matching pairs as JSON
  score: integer("score"), // Points earned (0-100)
  max_score: integer("max_score"), // Maximum possible points
  is_correct: boolean("is_correct"), // Whether the attempt was fully correct
  time_start: timestamp("time_start").defaultNow(),
  time_end: timestamp("time_end"),
  duration_seconds: integer("duration_seconds"),
  attempt_number: integer("attempt_number").default(1),
  created_at: timestamp("created_at").defaultNow(),
});

export const assignment = pgTable("assignment", {
  id: text("id").primaryKey(),
  assignmentname: text("Assignmentname"),
  category: text("category"),
  contentid: text("contentid"),
  description: text("description"),
  expiring_date: text("expiring_date"),
  imagelink: text("imagelink"),
  noofquestion: integer("noofquestion"),
  question_id: text("Question_id"),
  status: text("status"),
  subject: text("subject"),
  testtype: text("testtype"),
  tg_tao: text("tg_tao"),
  topicid: text("topicid"),
  type: text("type"),
  typeofquestion: text("typeofquestion"),
  update: text("update"),
  created_at: timestamp("created_at").defaultNow(),
});

export const assignment_student_try = pgTable("assignment_student_try", {
  id: serial("id").primaryKey(),
  assignmentid: text("assignmentid"),
  contentID: text("contentID"),
  end_time: text("end_time"),
  hocsinh_id: text("hocsinh_id"),
  questionIDs: text("questionIDs"),
  start_time: text("start_time"),
  typeoftaking: text("typeoftaking"),
  update: text("update"),
});

export const student_try = pgTable("student_try", {
  id: text("id").primaryKey(),
  answer_choice: text("answer_choice"),
  assignment_student_try_id: text("assignment_student_try_id"),
  currentindex: integer("currentindex"),
  hocsinh_id: text("hocsinh_id"),
  question_id: text("question_id"),
  quiz_result: text("quiz_result"),
  score: integer("score"),
  showcontent: text("showcontent"),
  time_end: text("time_end"),
  time_start: text("time_start"),
  update: timestamp("update"),
  writing_answer: text("writing_answer"),
});

export const student_try_content = pgTable("student_try_content", {
  id: text("id").primaryKey(),
  contentid: text("contentid"),
  hocsinh_id: text("hocsinh_id"),
  student_try_id: text("student_try_id"),
  time_end: text("time_end"),
  time_start: text("time_start"),
  update: text("update"),
});

// Content difficulty ratings by students
export const content_ratings = pgTable("content_ratings", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  content_id: text("content_id").notNull(),
  rating: text("rating").notNull(), // "really_bad", "normal", "ok", "viewed"
  personal_note: text("personal_note"), // Student's personal notes about the content
  view_count: integer("view_count").default(1), // Track number of times content was viewed
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Student activity streaks
export const student_streaks = pgTable("student_streaks", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  current_streak: integer("current_streak").default(0),
  longest_streak: integer("longest_streak").default(0),
  last_activity_date: timestamp("last_activity_date"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Student daily activities for streak tracking
export const daily_activities = pgTable("daily_activities", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  activity_date: timestamp("activity_date").notNull(),
  activities_count: integer("activities_count").default(0),
  points_earned: integer("points_earned").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

// Writing prompts and categories
export const writing_prompts = pgTable("writing_prompts", {
  id: text("id").primaryKey(),
  category: text("category").notNull(), // "personal_experience", "creative_writing", etc.
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon"), // emoji or icon name
  prompts: jsonb("prompts"), // array of writing prompts/questions
  suggestions: jsonb("suggestions"), // writing suggestions for each paragraph
  created_at: timestamp("created_at").defaultNow(),
});

// Student writing submissions
export const writing_submissions = pgTable("writing_submissions", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  prompt_id: text("prompt_id").notNull(),
  title: text("title"),
  opening_paragraph: text("opening_paragraph"),
  body_paragraph_1: text("body_paragraph_1"),
  body_paragraph_2: text("body_paragraph_2"),
  body_paragraph_3: text("body_paragraph_3"),
  conclusion_paragraph: text("conclusion_paragraph"),
  full_essay: text("full_essay"),
  ai_feedback: jsonb("ai_feedback"), // GPT ratings and feedback
  overall_score: integer("overall_score"), // 0-100
  paragraph_scores: jsonb("paragraph_scores"), // individual paragraph scores
  word_count: integer("word_count"),
  status: text("status").default("draft"), // "draft", "submitted", "graded"
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Enhanced content views tracking with session support
export const content_views = pgTable("content_views", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  content_id: text("content_id").notNull(),
  session_id: text("session_id"), // tracks which teaching session this view occurred in
  view_duration: integer("view_duration").default(0), // in seconds
  created_at: timestamp("created_at").defaultNow(),
});

// Enhanced content ratings with thumbs up/down
export const enhanced_content_ratings = pgTable("enhanced_content_ratings", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  content_id: text("content_id").notNull(),
  rating: text("rating").notNull(), // "thumbs_up", "thumbs_down"
  session_id: text("session_id"), // tracks which session this rating occurred in
  created_at: timestamp("created_at").defaultNow(),
});

// Quiz attempts tracking
export const quiz_attempts = pgTable("quiz_attempts", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  content_id: text("content_id").notNull(),
  quiz_level: text("quiz_level").notNull(), // "easy", "hard"
  score: integer("score"), // percentage score
  questions_answered: integer("questions_answered").default(0),
  questions_correct: integer("questions_correct").default(0),
  time_taken: integer("time_taken"), // in seconds
  session_id: text("session_id"), // tracks which session this attempt occurred in
  status: text("status").default("started"), // "started", "completed", "abandoned"
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

// Student badges system
export const student_badges = pgTable("student_badges", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  badge_type: text("badge_type").notNull(), // "content_viewer", "quiz_master", "topic_explorer", "streak_warrior"
  badge_level: integer("badge_level").default(1), // 1-5 levels for each badge type
  count: integer("count").default(0), // actual count (content views, quizzes done, etc.)
  threshold: integer("threshold").notNull(), // threshold needed for this level
  earned_at: timestamp("earned_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Teaching sessions for real-time tracking
export const teaching_sessions = pgTable("teaching_sessions", {
  id: text("id").primaryKey(),
  teacher_id: text("teacher_id").notNull(),
  session_name: text("session_name").notNull(),
  description: text("description"),
  start_time: timestamp("start_time").defaultNow(),
  end_time: timestamp("end_time"),
  status: text("status").default("active"), // "active", "paused", "ended"
  created_at: timestamp("created_at").defaultNow(),
});

// Students enrolled in teaching sessions
export const session_participants = pgTable("session_participants", {
  id: text("id").primaryKey(),
  session_id: text("session_id").notNull(),
  student_id: text("student_id").notNull(),
  joined_at: timestamp("joined_at").defaultNow(),
  last_activity: timestamp("last_activity").defaultNow(),
  is_active: boolean("is_active").default(true),
});

// Real-time session activities for tracking student progress
export const session_activities = pgTable("session_activities", {
  id: text("id").primaryKey(),
  session_id: text("session_id").notNull(),
  student_id: text("student_id").notNull(),
  activity_type: text("activity_type").notNull(), // "content_view", "quiz_start", "quiz_complete", "rating_given"
  content_id: text("content_id"),
  quiz_id: text("quiz_id"),
  activity_data: jsonb("activity_data"), // additional data like score, rating, etc.
  created_at: timestamp("created_at").defaultNow(),
});

export const learning_progress = pgTable("learning_progress", {
  id: text("id").primaryKey(),
  student_id: text("student_id").notNull(),
  topic_id: text("topic_id"),
  content_id: text("content_id"),
  status: text("status").notNull(), // not_started, in_progress, completed
  progress_percentage: integer("progress_percentage").default(0),
  time_spent: integer("time_spent").default(0), // in minutes
  score: integer("score"),
  completed_at: timestamp("completed_at"),
  last_accessed: timestamp("last_accessed").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Cron job tracking
export const cron_jobs = pgTable("cron_jobs", {
  id: text("id").primaryKey(),
  job_name: text("job_name").notNull(),
  last_run: timestamp("last_run"),
  next_run: timestamp("next_run"),
  status: text("status").default("active"), // active, paused, error
  created_at: timestamp("created_at").defaultNow(),
});

// Pending access requests for Google OAuth validation
export const pending_access_requests = pgTable("pending_access_requests", {
  id: text("id").primaryKey(),
  google_email: text("google_email").notNull(),
  full_name: text("full_name").notNull(),
  google_id: text("google_id").notNull(),
  request_date: timestamp("request_date").defaultNow(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  admin_notes: text("admin_notes"),
  processed_at: timestamp("processed_at"),
  processed_by: text("processed_by"),
});

export const insertUserSchema = createInsertSchema(users);
export const insertTopicSchema = createInsertSchema(topics);
export const insertContentSchema = createInsertSchema(content);
export const insertImageSchema = createInsertSchema(images);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertMatchingSchema = createInsertSchema(matching);
export const insertVideoSchema = createInsertSchema(videos);
export const insertMatchingAttemptSchema = createInsertSchema(matching_attempts);
export const insertContentRatingSchema = createInsertSchema(content_ratings);
export const insertStudentStreakSchema = createInsertSchema(student_streaks);
export const insertDailyActivitySchema = createInsertSchema(daily_activities);
export const insertWritingPromptSchema = createInsertSchema(writing_prompts);
export const insertWritingSubmissionSchema = createInsertSchema(writing_submissions);
export const insertLearningProgressSchema = createInsertSchema(learning_progress);
export const insertCronJobSchema = createInsertSchema(cron_jobs);
export const insertPendingAccessRequestSchema = createInsertSchema(pending_access_requests);
export const insertContentViewSchema = createInsertSchema(content_views);
export const insertEnhancedContentRatingSchema = createInsertSchema(enhanced_content_ratings);
export const insertQuizAttemptSchema = createInsertSchema(quiz_attempts);
export const insertStudentBadgeSchema = createInsertSchema(student_badges);
export const insertTeachingSessionSchema = createInsertSchema(teaching_sessions);
export const insertSessionParticipantSchema = createInsertSchema(session_participants);
export const insertSessionActivitySchema = createInsertSchema(session_activities);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Content = typeof content.$inferSelect;
export type Image = typeof images.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Matching = typeof matching.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type MatchingAttempt = typeof matching_attempts.$inferSelect;
export type InsertMatchingAttempt = z.infer<typeof insertMatchingAttemptSchema>;
export type ContentRating = typeof content_ratings.$inferSelect;
export type InsertContentRating = z.infer<typeof insertContentRatingSchema>;
export type StudentStreak = typeof student_streaks.$inferSelect;
export type InsertStudentStreak = z.infer<typeof insertStudentStreakSchema>;
export type DailyActivity = typeof daily_activities.$inferSelect;
export type InsertDailyActivity = z.infer<typeof insertDailyActivitySchema>;
export type WritingPrompt = typeof writing_prompts.$inferSelect;
export type InsertWritingPrompt = z.infer<typeof insertWritingPromptSchema>;
export type WritingSubmission = typeof writing_submissions.$inferSelect;
export type InsertWritingSubmission = z.infer<typeof insertWritingSubmissionSchema>;
export type LearningProgress = typeof learning_progress.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;
export type CronJob = typeof cron_jobs.$inferSelect;
export type InsertCronJob = z.infer<typeof insertCronJobSchema>;
export type PendingAccessRequest = typeof pending_access_requests.$inferSelect;
export type InsertPendingAccessRequest = z.infer<typeof insertPendingAccessRequestSchema>;
export type ContentView = typeof content_views.$inferSelect;
export type InsertContentView = z.infer<typeof insertContentViewSchema>;
export type EnhancedContentRating = typeof enhanced_content_ratings.$inferSelect;
export type InsertEnhancedContentRating = z.infer<typeof insertEnhancedContentRatingSchema>;
export type QuizAttempt = typeof quiz_attempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type StudentBadge = typeof student_badges.$inferSelect;
export type InsertStudentBadge = z.infer<typeof insertStudentBadgeSchema>;
export type TeachingSession = typeof teaching_sessions.$inferSelect;
export type InsertTeachingSession = z.infer<typeof insertTeachingSessionSchema>;
export type SessionParticipant = typeof session_participants.$inferSelect;
export type InsertSessionParticipant = z.infer<typeof insertSessionParticipantSchema>;
export type SessionActivity = typeof session_activities.$inferSelect;
export type InsertSessionActivity = z.infer<typeof insertSessionActivitySchema>;
