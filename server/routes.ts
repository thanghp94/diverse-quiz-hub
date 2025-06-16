import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Topics API
  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  });

  app.get("/api/topics/bowl-challenge", async (req, res) => {
    try {
      const topics = await storage.getBowlChallengeTopics();
      res.json(topics);
    } catch (error) {
      console.error('Error fetching bowl challenge topics:', error);
      res.status(500).json({ error: 'Failed to fetch bowl challenge topics' });
    }
  });

  app.get("/api/topics/:id", async (req, res) => {
    try {
      const topic = await storage.getTopicById(req.params.id);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }
      res.json(topic);
    } catch (error) {
      console.error('Error fetching topic:', error);
      res.status(500).json({ error: 'Failed to fetch topic' });
    }
  });

  // Content API
  app.get("/api/content", async (req, res) => {
    try {
      const topicId = req.query.topicId as string;
      const content = await storage.getContent(topicId);
      res.json(content);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const content = await storage.getContentById(req.params.id);
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json(content);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });

  // Images API
  app.get("/api/images", async (req, res) => {
    try {
      const images = await storage.getImages();
      res.json(images);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
    try {
      const image = await storage.getImageById(req.params.id);
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      res.json(image);
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });

  // Questions API
  app.get("/api/questions", async (req, res) => {
    try {
      const { contentId, topicId, level } = req.query as { 
        contentId?: string; 
        topicId?: string; 
        level?: string; 
      };
      const questions = await storage.getQuestions(contentId, topicId, level);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const question = await storage.getQuestionById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Failed to fetch question' });
    }
  });

  // Matching API
  app.get("/api/matching", async (req, res) => {
    try {
      const matching = await storage.getMatchingActivities();
      res.json(matching);
    } catch (error) {
      console.error('Error fetching matching activities:', error);
      res.status(500).json({ error: 'Failed to fetch matching activities' });
    }
  });

  app.get("/api/matching/:id", async (req, res) => {
    try {
      const matching = await storage.getMatchingById(req.params.id);
      if (!matching) {
        return res.status(404).json({ error: 'Matching activity not found' });
      }
      res.json(matching);
    } catch (error) {
      console.error('Error fetching matching activity:', error);
      res.status(500).json({ error: 'Failed to fetch matching activity' });
    }
  });

  app.get("/api/matching/topic/:topicId", async (req, res) => {
    try {
      const matching = await storage.getMatchingByTopicId(req.params.topicId);
      res.json(matching);
    } catch (error) {
      console.error('Error fetching matching activities by topic:', error);
      res.status(500).json({ error: 'Failed to fetch matching activities by topic' });
    }
  });

  // Videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ error: 'Failed to fetch video' });
    }
  });

  app.get("/api/content/:contentId/videos", async (req, res) => {
    try {
      const videos = await storage.getVideosByContentId(req.params.contentId);
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos for content:', error);
      res.status(500).json({ error: 'Failed to fetch videos for content' });
    }
  });

  // User authentication routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.get("/api/users/by-email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Matching Attempts routes
  app.post("/api/matching-attempts", async (req, res) => {
    try {
      const attempt = await storage.createMatchingAttempt(req.body);
      res.json(attempt);
    } catch (error) {
      console.error('Error creating matching attempt:', error);
      res.status(500).json({ error: 'Failed to create matching attempt' });
    }
  });

  app.get("/api/matching-attempts/student/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { matchingId } = req.query;
      const attempts = await storage.getMatchingAttempts(studentId, matchingId as string);
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching matching attempts:', error);
      res.status(500).json({ error: 'Failed to fetch matching attempts' });
    }
  });

  app.get("/api/matching-attempts/:id", async (req, res) => {
    try {
      const attempt = await storage.getMatchingAttemptById(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: 'Matching attempt not found' });
      }
      res.json(attempt);
    } catch (error) {
      console.error('Error fetching matching attempt:', error);
      res.status(500).json({ error: 'Failed to fetch matching attempt' });
    }
  });

  app.patch("/api/matching-attempts/:id", async (req, res) => {
    try {
      const attempt = await storage.updateMatchingAttempt(req.params.id, req.body);
      res.json(attempt);
    } catch (error) {
      console.error('Error updating matching attempt:', error);
      res.status(500).json({ error: 'Failed to update matching attempt' });
    }
  });

  // Content Ratings API
  app.post("/api/content-ratings", async (req, res) => {
    try {
      const rating = await storage.createContentRating(req.body);
      res.json(rating);
    } catch (error) {
      console.error('Error creating content rating:', error);
      res.status(500).json({ error: 'Failed to create content rating' });
    }
  });

  app.get("/api/content-ratings/:studentId/:contentId", async (req, res) => {
    try {
      const rating = await storage.getContentRating(req.params.studentId, req.params.contentId);
      res.json(rating);
    } catch (error) {
      console.error('Error fetching content rating:', error);
      res.status(500).json({ error: 'Failed to fetch content rating' });
    }
  });

  app.put("/api/content-ratings/:studentId/:contentId", async (req, res) => {
    try {
      const rating = await storage.updateContentRating(req.params.studentId, req.params.contentId, req.body.rating);
      res.json(rating);
    } catch (error) {
      console.error('Error updating content rating:', error);
      res.status(500).json({ error: 'Failed to update content rating' });
    }
  });

  app.get("/api/content-ratings/stats/:contentId", async (req, res) => {
    try {
      const stats = await storage.getContentRatingStats(req.params.contentId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching content rating stats:', error);
      res.status(500).json({ error: 'Failed to fetch content rating stats' });
    }
  });

  // Student Streaks API
  app.get("/api/streaks/:studentId", async (req, res) => {
    try {
      const streak = await storage.getStudentStreak(req.params.studentId);
      res.json(streak);
    } catch (error) {
      console.error('Error fetching student streak:', error);
      res.status(500).json({ error: 'Failed to fetch student streak' });
    }
  });

  app.post("/api/streaks/:studentId", async (req, res) => {
    try {
      const streak = await storage.updateStudentStreak(req.params.studentId);
      res.json(streak);
    } catch (error) {
      console.error('Error updating student streak:', error);
      res.status(500).json({ error: 'Failed to update student streak' });
    }
  });

  // Daily Activities API
  app.post("/api/daily-activities", async (req, res) => {
    try {
      const activity = await storage.recordDailyActivity(req.body.studentId, req.body.points);
      res.json(activity);
    } catch (error) {
      console.error('Error recording daily activity:', error);
      res.status(500).json({ error: 'Failed to record daily activity' });
    }
  });

  // Leaderboards API
  app.get("/api/leaderboards", async (req, res) => {
    try {
      const leaderboards = await storage.getLeaderboards();
      res.json(leaderboards);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboards' });
    }
  });

  // Writing Prompts API
  app.get("/api/writing-prompts", async (req, res) => {
    try {
      const prompts = await storage.getWritingPrompts();
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching writing prompts:', error);
      res.status(500).json({ error: 'Failed to fetch writing prompts' });
    }
  });

  app.get("/api/writing-prompts/category/:category", async (req, res) => {
    try {
      const prompts = await storage.getWritingPromptsByCategory(req.params.category);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching writing prompts by category:', error);
      res.status(500).json({ error: 'Failed to fetch writing prompts by category' });
    }
  });

  app.get("/api/writing-prompts/:id", async (req, res) => {
    try {
      const prompt = await storage.getWritingPromptById(req.params.id);
      if (!prompt) {
        return res.status(404).json({ error: 'Writing prompt not found' });
      }
      res.json(prompt);
    } catch (error) {
      console.error('Error fetching writing prompt:', error);
      res.status(500).json({ error: 'Failed to fetch writing prompt' });
    }
  });

  // Writing Submissions API
  app.post("/api/writing-submissions", async (req, res) => {
    try {
      const submission = await storage.createWritingSubmission(req.body);
      res.json(submission);
    } catch (error) {
      console.error('Error creating writing submission:', error);
      res.status(500).json({ error: 'Failed to create writing submission' });
    }
  });

  app.get("/api/writing-submissions/:id", async (req, res) => {
    try {
      const submission = await storage.getWritingSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: 'Writing submission not found' });
      }
      res.json(submission);
    } catch (error) {
      console.error('Error fetching writing submission:', error);
      res.status(500).json({ error: 'Failed to fetch writing submission' });
    }
  });

  app.get("/api/writing-submissions/student/:studentId", async (req, res) => {
    try {
      const submissions = await storage.getStudentWritingSubmissions(req.params.studentId);
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching student writing submissions:', error);
      res.status(500).json({ error: 'Failed to fetch student writing submissions' });
    }
  });

  app.patch("/api/writing-submissions/:id", async (req, res) => {
    try {
      const submission = await storage.updateWritingSubmission(req.params.id, req.body);
      res.json(submission);
    } catch (error) {
      console.error('Error updating writing submission:', error);
      res.status(500).json({ error: 'Failed to update writing submission' });
    }
  });

  // Assignment API
  app.post("/api/assignments", async (req, res) => {
    try {
      const assignment = await storage.createAssignment(req.body);
      res.json(assignment);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  });

  app.get("/api/assignments/:id", async (req, res) => {
    try {
      const assignment = await storage.getAssignmentById(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.json(assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      res.status(500).json({ error: 'Failed to fetch assignment' });
    }
  });

  // Student Try API
  app.post("/api/student-tries", async (req, res) => {
    try {
      const studentTry = await storage.createStudentTry(req.body);
      res.json(studentTry);
    } catch (error) {
      console.error('Error creating student try:', error);
      res.status(500).json({ error: 'Failed to create student try' });
    }
  });

  app.get("/api/student-tries/:id", async (req, res) => {
    try {
      const studentTry = await storage.getStudentTryById(req.params.id);
      if (!studentTry) {
        return res.status(404).json({ error: 'Student try not found' });
      }
      res.json(studentTry);
    } catch (error) {
      console.error('Error fetching student try:', error);
      res.status(500).json({ error: 'Failed to fetch student try' });
    }
  });

  app.patch("/api/student-tries/:id", async (req, res) => {
    try {
      const studentTry = await storage.updateStudentTry(req.params.id, req.body);
      res.json(studentTry);
    } catch (error) {
      console.error('Error updating student try:', error);
      res.status(500).json({ error: 'Failed to update student try' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
