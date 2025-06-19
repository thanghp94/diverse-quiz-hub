import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";

export function setupGoogleAuth(app: Express) {
  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.REPLIT_DOMAINS?.split(',')[0] ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/api/auth/google/callback`
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Accept any Google user, validation happens after login
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      
      if (!email) {
        return done(null, false, { message: 'No email found from Google' });
      }

      // Create a temporary user object with Google profile data
      const googleUser = {
        id: `google_${profile.id}`,
        email: email,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        fullName: name || '',
        isGoogleUser: true,
        googleId: profile.id,
        profileImage: profile.photos?.[0]?.value || null
      };

      return done(null, googleUser);
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
    async (req, res) => {
      // Successful Google authentication - now validate access
      const googleUser = req.user as any;
      (req.session as any).googleUser = googleUser;
      (req.session as any).needsValidation = true;
      
      // Redirect to validation page
      res.redirect('/validate-access');
    }
  );
}