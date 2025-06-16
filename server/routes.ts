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

  const httpServer = createServer(app);

  return httpServer;
}
