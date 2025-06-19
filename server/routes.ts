import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { wakeUpDatabase } from "./db";
import { getSessionMiddleware, isStudentAuthenticated } from "./sessionAuth";
import { setupGoogleAuth } from "./googleAuth";
import crypto from 'crypto';

// Session type declarations
declare module 'express-session' {
  export interface SessionData {
    userId: string;
    user: any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware for authentication
  app.use(getSessionMiddleware());

  // Set up Google OAuth authentication
  setupGoogleAuth(app);

  // Student Authentication routes
  app.post('/api/auth/student-login', async (req, res) => {
    try {
      const { identifier } = req.body;
      
      if (!identifier) {
        return res.status(400).json({ message: 'Student ID or Meraki Email is required' });
      }

      // Check if user exists by UserID or MerakiEmail
      const user = await storage.getUserByIdentifier(identifier);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid Student ID or Meraki Email' });
      }

      // Create session for the user
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      // Check if user needs to set up Google email
      const needsPersonalEmail = !user.email || user.email === user.meraki_email;

      res.json({ 
        success: true, 
        user: user,
        needsPersonalEmail 
      });
    } catch (error) {
      console.error('Student login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/email-login', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user by their personal email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Email not found. Please use Student ID for first-time login.' });
      }

      // Create session for the user
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      res.json({ 
        success: true, 
        user: user 
      });
    } catch (error) {
      console.error('Email login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/set-personal-email', async (req, res) => {
    try {
      const { identifier, personalEmail } = req.body;
      
      if (!identifier || !personalEmail) {
        return res.status(400).json({ message: 'Both identifier and email are required' });
      }

      // Find user by identifier
      const user = await storage.getUserByIdentifier(identifier);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid Student ID or Meraki Email' });
      }

      // Update user's personal email
      const updatedUser = await storage.updateUserEmail(user.id, personalEmail);

      // Create session for the user
      (req.session as any).userId = updatedUser.id;
      (req.session as any).user = updatedUser;

      res.json({ 
        success: true, 
        user: updatedUser 
      });
    } catch (error) {
      console.error('Set personal email error:', error);
      res.status(500).json({ message: 'Failed to save email' });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('Auth check - Session ID:', req.sessionID);
      console.log('Auth check - User ID in session:', (req.session as any).userId);
      
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('Auth check successful for user:', user.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return res.status(400).json({ message: 'Student ID/Email and password are required' });
      }

      // Default password check
      if (password !== 'Meraki123') {
        return res.status(401).json({ message: 'Invalid password. Use default password: Meraki123' });
      }

      // Find student by Student ID or Meraki Email
      const student = await storage.getUserByIdentifier(identifier);
      
      if (!student) {
        return res.status(404).json({ message: 'Student ID or Meraki Email not found in our records' });
      }

      // Create authenticated session and save it
      (req.session as any).userId = student.id;
      (req.session as any).user = student;

      // Force session save before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }

        console.log('Session saved successfully for user:', student.id);
        
        // Check if student needs to set up personal email
        const needsEmailSetup = !student.email || student.email === student.meraki_email;

        res.json({ 
          success: true, 
          user: student,
          needsEmailSetup,
          message: needsEmailSetup ? 'Please set up your personal email' : 'Login successful'
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/setup-email', async (req, res) => {
    // Check authentication
    if (!(req.session as any).userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    try {
      const { personalEmail } = req.body;
      const userId = (req.session as any).userId;

      if (!personalEmail) {
        return res.status(400).json({ message: 'Personal email is required' });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalEmail)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Update user's personal email
      const updatedStudent = await storage.updateUserEmail(userId, personalEmail);

      // Update session
      (req.session as any).user = updatedStudent;

      res.json({ 
        success: true, 
        user: updatedStudent,
        message: 'Personal email saved successfully'
      });
    } catch (error) {
      console.error('Email setup error:', error);
      res.status(500).json({ message: 'Failed to save email' });
    }
  });

  app.post('/api/auth/skip-email-setup', async (req, res) => {
    // Check authentication
    if (!(req.session as any).userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    try {
      res.json({ 
        success: true,
        message: 'Email setup skipped'
      });
    } catch (error) {
      console.error('Skip email setup error:', error);
      res.status(500).json({ message: 'Failed to skip email setup' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Test endpoint to verify OAuth configuration
  app.get('/api/auth/test', (req, res) => {
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0];
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    res.json({
      domain,
      callbackURL: `https://${domain}/api/auth/google/callback`,
      googleClientId: clientId ? clientId.substring(0, 12) + '...' + clientId.slice(-6) : 'Missing',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Missing',
      currentURL: req.protocol + '://' + req.get('host'),
      directOAuthURL: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=https%3A%2F%2F${domain}%2Fapi%2Fauth%2Fgoogle%2Fcallback&scope=profile%20email&response_type=code`,
      timestamp: new Date().toISOString()
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const isDbHealthy = await wakeUpDatabase();
      res.json({ 
        status: isDbHealthy ? 'healthy' : 'unhealthy',
        database: isDbHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({ 
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Wake up database endpoint
  app.post("/api/wake-db", async (req, res) => {
    try {
      console.log('Attempting to wake up database...');
      const success = await wakeUpDatabase();
      res.json({ 
        success,
        message: success ? 'Database is awake' : 'Failed to wake database',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Wake up failed:', error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Topics API - Protected route requiring authentication
  app.get("/api/topics", isStudentAuthenticated, async (req, res) => {
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

  // Content API - Protected routes requiring authentication
  app.get("/api/content", isStudentAuthenticated, async (req, res) => {
    try {
      const topicId = req.query.topicId as string;
      const content = await storage.getContent(topicId);
      res.json(content);
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });

  app.get("/api/content/:id", isStudentAuthenticated, async (req, res) => {
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

  // Content Groups API
  app.get("/api/content-groups", async (req, res) => {
    try {
      const contentGroups = await storage.getContentGroups();
      res.json(contentGroups);
    } catch (error) {
      console.error('Error fetching content groups:', error);
      res.status(500).json({ error: 'Failed to fetch content groups' });
    }
  });

  app.get("/api/content-groups/:groupName", async (req, res) => {
    try {
      const contentGroup = await storage.getContentByGroup(req.params.groupName);
      res.json(contentGroup);
    } catch (error) {
      console.error('Error fetching content by group:', error);
      res.status(500).json({ error: 'Failed to fetch content by group' });
    }
  });

  app.get("/api/content-groups/topic/:topicId", async (req, res) => {
    try {
      const topicId = req.params.topicId;
      
      // Get all content for this topic
      const allContent = await storage.getContent(topicId);
      
      // Group content by contentgroup field
      const groupedContent: { [key: string]: any[] } = {};
      const ungroupedContent: any[] = [];
      
      allContent.forEach(content => {
        if (content.contentgroup && content.contentgroup.trim() !== '') {
          if (!groupedContent[content.contentgroup]) {
            groupedContent[content.contentgroup] = [];
          }
          groupedContent[content.contentgroup].push(content);
        } else {
          ungroupedContent.push(content);
        }
      });
      
      // Format response with group info
      const response = {
        groups: Object.entries(groupedContent).map(([groupName, content]) => ({
          groupName,
          content,
          count: content.length
        })),
        ungroupedContent
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error fetching content groups by topic:', error);
      res.status(500).json({ error: 'Failed to fetch content groups by topic' });
    }
  });

  // Images
  app.get("/api/images", async (req, res) => {
    try {
      const images = await storage.getImages();
      res.json(images);
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  });

  // Content Update API
  app.patch("/api/content/:id", async (req, res) => {
    try {
      const { short_description, short_blurb, imageid, videoid, videoid2 } = req.body;
      const updates = { short_description, short_blurb, imageid, videoid, videoid2 };
      
      // Remove undefined fields
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof typeof updates] === undefined) {
          delete updates[key as keyof typeof updates];
        }
      });

      const updatedContent = await storage.updateContent(req.params.id, updates);
      if (!updatedContent) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: 'Failed to update content' });
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

  // Questions
  app.get("/api/questions", async (req, res) => {
    try {
      const { contentId, topicId, level } = req.query;
      console.log(`API: Fetching questions with contentId: ${contentId}, topicId: ${topicId}, level: ${level}`);

      // Ensure level parameter is properly passed and not undefined
      const levelParam = level && level !== 'undefined' ? level as string : undefined;

      const questions = await storage.getQuestions(
        contentId as string, 
        topicId as string, 
        levelParam
      );

      console.log(`API: Returning ${questions.length} questions for level: ${levelParam || 'all'}`);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
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

  // Personal Content API
  app.get("/api/personal-content/:studentId", async (req, res) => {
    try {
      const personalContent = await storage.getPersonalContent(req.params.studentId);
      res.json(personalContent);
    } catch (error) {
      console.error('Error fetching personal content:', error);
      res.status(500).json({ error: 'Failed to fetch personal content' });
    }
  });

  // Content Access Tracking - automatically records when content is viewed
  app.post("/api/content-access", async (req, res) => {
    try {
      const { student_id, content_id } = req.body;
      
      if (!student_id || !content_id) {
        return res.status(400).json({ error: 'student_id and content_id are required' });
      }

      // Check if this content has already been accessed by this student
      const existingRating = await storage.getContentRating(student_id, content_id);
      
      if (!existingRating) {
        // Create a new content rating entry to track the access
        const accessRecord = await storage.createContentRating({
          id: crypto.randomUUID(),
          student_id,
          content_id,
          rating: 'viewed', // Special rating to indicate content was viewed
          personal_note: null,
          view_count: 1
        });
        
        console.log(`Content access recorded: Student ${student_id} viewed content ${content_id}`);
        res.json({ message: 'Content access recorded', record: accessRecord });
      } else {
        // Content already accessed - increment view count
        const updatedRating = await storage.incrementContentViewCount(student_id, content_id);
        console.log(`Content view count incremented: Student ${student_id} viewed content ${content_id}`);
        res.json({ message: 'Content view count updated', record: updatedRating });
      }
    } catch (error) {
      console.error('Error tracking content access:', error);
      res.status(500).json({ error: 'Failed to track content access' });
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

  // Get all content ratings for a student
  app.get("/api/content-ratings/:studentId", async (req, res) => {
    try {
      const ratings = await storage.getContentRatingsByStudent(req.params.studentId);
      res.json(ratings);
    } catch (error) {
      console.error('Error fetching student content ratings:', error);
      res.status(500).json({ error: 'Failed to fetch student content ratings' });
    }
  });

  // Get student tries count for content optimization
  app.get("/api/student-tries-count/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { contentIds } = req.query;
      
      if (!contentIds) {
        return res.json({});
      }
      
      const contentIdArray = typeof contentIds === 'string' ? contentIds.split(',') : Array.isArray(contentIds) ? contentIds : [];
      
      // Use storage method for optimized student tries count
      const allStudentTries = await storage.getAllStudentTries();
      const triesCount: Record<string, number> = {};
      
      allStudentTries
        .filter((studentTry: any) => 
          studentTry.student_id === studentId && 
          studentTry.question_id && 
          contentIdArray.includes(studentTry.question_id)
        )
        .forEach((studentTry: any) => {
          if (studentTry.question_id) {
            triesCount[studentTry.question_id] = (triesCount[studentTry.question_id] || 0) + 1;
          }
        });
      
      res.json(triesCount);
    } catch (error) {
      console.error('Error fetching student tries count:', error);
      res.status(500).json({ error: 'Failed to fetch student tries count' });
    }
  });

  // Get quiz attempts count per content for a student
  app.get("/api/quiz-attempts-count/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const { contentIds } = req.query;
      
      if (!contentIds) {
        return res.json({});
      }
      
      const contentIdArray = typeof contentIds === 'string' ? contentIds.split(',') : Array.isArray(contentIds) ? contentIds : [];
      
      // Get all assignment tries for this student
      const assignmentTries = await storage.getAssignmentTriesByStudent(studentId);
      const quizCount: Record<string, number> = {};
      
      assignmentTries
        .filter((attempt: any) => 
          attempt.contentID && 
          contentIdArray.includes(attempt.contentID)
        )
        .forEach((attempt: any) => {
          if (attempt.contentID) {
            quizCount[attempt.contentID] = (quizCount[attempt.contentID] || 0) + 1;
          }
        });
      
      res.json(quizCount);
    } catch (error) {
      console.error('Error fetching quiz attempts count:', error);
      res.status(500).json({ error: 'Failed to fetch quiz attempts count' });
    }
  });

  app.get("/api/content-ratings/:studentId/:contentId", async (req, res) => {
    try {
      const rating = await storage.getContentRating(req.params.studentId, req.params.contentId);
      if (rating === null) {
        return res.status(404).json({ error: 'Rating not found' });
      }
      res.json(rating);
    } catch (error) {
      console.error('Error fetching content rating:', error);
      res.status(500).json({ error: 'Failed to fetch content rating' });
    }
  });

  app.put("/api/content-ratings/:studentId/:contentId", async (req, res) => {
    try {
      const { rating, personal_note } = req.body;
      const result = await storage.updateContentRating(req.params.studentId, req.params.contentId, rating, personal_note);
      
      // Record daily activity and update streak only if rating is provided
      if (rating) {
        try {
          await storage.recordDailyActivity(req.params.studentId, 10);
          await storage.updateStudentStreak(req.params.studentId);
        } catch (activityError) {
          console.log('Failed to record activity/streak:', activityError);
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error updating content rating:', error);
      res.status(500).json({ error: 'Failed to update content rating' });
    }
  });

  // Student tries leaderboard
  app.get("/api/student-tries-leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getStudentTriesLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
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
      // First record some activity for today if not already recorded
      await storage.recordDailyActivity(req.params.studentId, 10);
      
      // Then update the streak
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
  app.get("/api/assignments", async (req, res) => {
    try {
      const assignments = await storage.getAllAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Live Class Assignments API
  app.get("/api/assignments/live-class", async (req, res) => {
    try {
      const liveClassAssignments = await storage.getLiveClassAssignments();
      res.json(liveClassAssignments);
    } catch (error) {
      console.error('Error fetching live class assignments:', error);
      res.status(500).json({ error: 'Failed to fetch live class assignments' });
    }
  });

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

  app.post("/api/assignments/:id/duplicate", async (req, res) => {
    try {
      const { type } = req.body;
      const assignment = await storage.duplicateAssignment(req.params.id, type);
      res.json(assignment);
    } catch (error) {
      console.error('Error duplicating assignment:', error);
      res.status(500).json({ error: 'Failed to duplicate assignment' });
    }
  });

  // Assignment Student Try API
  app.get("/api/assignment-student-tries", async (req, res) => {
    try {
      const assignmentStudentTries = await storage.getAllAssignmentStudentTries();
      res.json(assignmentStudentTries);
    } catch (error) {
      console.error('Error fetching assignment student tries:', error);
      res.status(500).json({ error: 'Failed to fetch assignment student tries' });
    }
  });

  app.post("/api/assignment-student-tries", async (req, res) => {
    try {
      const assignmentStudentTry = await storage.createAssignmentStudentTry(req.body);
      res.json(assignmentStudentTry);
    } catch (error) {
      console.error('Error creating assignment student try:', error);
      res.status(500).json({ error: 'Failed to create assignment student try' });
    }
  });

  app.get("/api/assignment-student-tries/:id", async (req, res) => {
    try {
      const assignmentStudentTry = await storage.getAssignmentStudentTryById(req.params.id);
      if (!assignmentStudentTry) {
        return res.status(404).json({ error: 'Assignment student try not found' });
      }
      res.json(assignmentStudentTry);
    } catch (error) {
      console.error('Error fetching assignment student try:', error);
      res.status(500).json({ error: 'Failed to fetch assignment student try' });
    }
  });

  // Student Try API
  app.get("/api/student-tries", async (req, res) => {
    try {
      // For testing - return all student tries
      const tries = await storage.getAllStudentTries();
      res.json(tries);
    } catch (error) {
      console.error('Error fetching student tries:', error);
      res.status(500).json({ error: 'Failed to fetch student tries' });
    }
  });

  app.post("/api/student-tries", async (req, res) => {
    try {
      console.log('Creating student try with data:', req.body);
      const studentTry = await storage.createStudentTry(req.body);
      console.log('Student try created:', studentTry);
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

  // Learning Progress API
  app.get("/api/learning-progress/student/:studentId", async (req, res) => {
    try {
      const progress = await storage.getStudentLearningProgress(req.params.studentId);
      res.json(progress);
    } catch (error) {
      console.error('Error fetching student learning progress:', error);
      res.status(500).json({ error: 'Failed to fetch student learning progress' });
    }
  });

  app.post("/api/learning-progress", async (req, res) => {
    try {
      const progress = await storage.createLearningProgress(req.body);
      res.json(progress);
    } catch (error) {
      console.error('Error creating learning progress:', error);
      res.status(500).json({ error: 'Failed to create learning progress' });
    }
  });

  app.patch("/api/learning-progress/:id", async (req, res) => {
    try {
      const progress = await storage.updateLearningProgress(req.params.id, req.body);
      res.json(progress);
    } catch (error) {
      console.error('Error updating learning progress:', error);
      res.status(500).json({ error: 'Failed to update learning progress' });
    }
  });

  // Live Class Assignment API
  app.get("/api/live-assignments", async (req, res) => {
    try {
      const liveAssignments = await storage.getLiveClassAssignments();
      res.json(liveAssignments);
    } catch (error) {
      console.error('Error fetching live class assignments:', error);
      res.status(500).json({ error: 'Failed to fetch live class assignments' });
    }
  });

  app.get("/api/assignments/:assignmentId/progress", async (req, res) => {
    try {
      const progress = await storage.getAssignmentStudentProgress(req.params.assignmentId);
      res.json(progress);
    } catch (error) {
      console.error('Error fetching assignment student progress:', error);
      res.status(500).json({ error: 'Failed to fetch assignment student progress' });
    }
  });

  app.get("/api/assignment-student-try/:tryId/quiz-progress", async (req, res) => {
    try {
      const quizProgress = await storage.getStudentQuizProgress(req.params.tryId);
      res.json(quizProgress);
    } catch (error) {
      console.error('Error fetching student quiz progress:', error);
      res.status(500).json({ error: 'Failed to fetch student quiz progress' });
    }
  });

  // Leaderboard API endpoints
  app.get("/api/student-tries-leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getStudentTriesLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching student tries leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch student tries leaderboard' });
    }
  });

  app.get("/api/leaderboards", async (req, res) => {
    try {
      const leaderboards = await storage.getLeaderboards();
      res.json(leaderboards);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboards' });
    }
  });

  // Content Progress API
  app.get("/api/content-progress/:studentId", async (req, res) => {
    try {
      const progress = await storage.getContentProgress(req.params.studentId);
      res.json(progress);
    } catch (error) {
      console.error('Error fetching content progress:', error);
      res.status(500).json({ error: 'Failed to fetch content progress' });
    }
  });

  // Cron Job API
  app.post("/api/cron/update-student-tracking", async (req, res) => {
    try {
      await storage.updateStudentTryContent();
      res.json({ message: 'Student tracking updated successfully' });
    } catch (error) {
      console.error('Error updating student tracking:', error);
      res.status(500).json({ error: 'Failed to update student tracking' });
    }
  });

  // Assignments API (general assignments, not live class)
  app.get("/api/assignments", async (req, res) => {
    try {
      const assignments = await storage.getAllAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}