import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTopicSchema = createInsertSchema(topics);
export const insertContentSchema = createInsertSchema(content);
export const insertImageSchema = createInsertSchema(images);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertMatchingSchema = createInsertSchema(matching);
export const insertVideoSchema = createInsertSchema(videos);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Content = typeof content.$inferSelect;
export type Image = typeof images.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Matching = typeof matching.$inferSelect;
export type Video = typeof videos.$inferSelect;
