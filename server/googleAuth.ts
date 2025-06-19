import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";

export function setupGoogleAuth(app: Express) {
  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Find user by Google email
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(null, false, { message: 'No email found from Google' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Email not registered. Please use Student ID for first-time login.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error('Passport deserialize error:', error);
      done(null, false);
    }
  });

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=google_auth_failed' }),
    (req, res) => {
      // Successful authentication
      const user = req.user as any;
      (req.session as any).userId = user.id;
      (req.session as any).user = user;
      res.redirect('/');
    }
  );
}