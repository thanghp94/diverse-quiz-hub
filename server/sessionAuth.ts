import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";

export function getSessionMiddleware() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ONSLUx5f2pMo@ep-rapid-dew-ad58cvd6.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
    createTableIfMissing: true, // Allow creating table if needed
    ttl: sessionTtl,
    tableName: "sessions",
    schemaName: "public"
  });

  return session({
    secret: process.env.SESSION_SECRET || 'development-session-secret-not-for-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    rolling: true, // Reset expiry on each request
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
      sameSite: 'lax',
      path: '/', // Explicitly set path
      domain: undefined // Let browser determine domain
    },
  });
}

export const isStudentAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any).userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};