import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler } from "express";

export function getSessionMiddleware() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export const isStudentAuthenticated: RequestHandler = (req, res, next) => {
  if ((req.session as any).userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};