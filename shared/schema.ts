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
  noi_dung: text("noi_dung"),
  cau_tra_loi_1: text("cau_tra_loi_1"),
  cau_tra_loi_2: text("cau_tra_loi_2"),
  cau_tra_loi_3: text("cau_tra_loi_3"),
  cau_tra_loi_4: text("cau_tra_loi_4"),
  correct_choice: text("correct_choice"),
  explanation: text("explanation"),
  contentid: text("contentid"),
  topicid: text("topicid"),
  answer: text("answer"),
  duration: text("duration"),
  picture: text("picture"),
  question_type: text("question_type"),
  questionlevel: text("questionlevel"),
  questionorder: text("questionorder"),
  randomorder: text("randomorder"),
  tg_tao: text("tg_tao"),
  time: text("time"),
  translation: text("translation"),
  update: text("update"),
  video: text("video"),
  writing_choice: text("writing_choice"),
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
  contentid: text("contentID"),
  end_time: text("end_time"),
  hocsinh_id: text("hocsinh_id"),
  questionids: text("questionIDs"),
  start_time: text("start_time"),
  typeoftaking: text("typeoftaking"),
  update: text("update"),
});

export const student_try = pgTable("student_try", {
  id: text("id").primaryKey(),
  answer_choice: text("answer_choice"),
  assignment_student_try_id: text("assignment_student_try_id"),
  correct_answer: text("correct_answer"),
  currentindex: integer("currentindex"),
  hocsinh_id: text("hocsinh_id"),
  question_id: text("question_id"),
  quiz_result: text("quiz_result"),
  score: integer("score"),
  showcontent: boolean("showcontent"),
  time_end: text("time_end"),
  time_start: text("time_start"),
  update: text("update"),
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
  rating: text("rating").notNull(), // "really_bad", "normal", "ok"
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

export type InsertUser = z.infer<typeof insertUserSchema>;
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
