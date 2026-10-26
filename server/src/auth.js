import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config, jwtSecret, isProd } from './config.js';
import { findUser, setPassword } from './db.js';
import { loginSchema, passwordSchema } from './schema.js';

const COOKIE = 'portfolio_session';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: isProd,
  path: '/',
  maxAge: config.sessionHours * 3600 * 1000,
};

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.clearCookie(COOKIE, { path: '/' });
    res.status(401).json({ error: 'Session expired' });
  }
}

// Reject state-changing requests whose Origin is not this site (defense in depth on top of SameSite).
export function sameOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();
  const host = req.get('x-forwarded-host') || req.get('host');
  try {
    if (new URL(origin).host === host) return next();
  } catch {}
  res.status(403).json({ error: 'Cross-origin request blocked' });
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

export const authRouter = Router();

authRouter.post('/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Username and password are required' });
  const { username, password } = parsed.data;
  const user = findUser(username);
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) return res.status(401).json({ error: 'Wrong username or password' });
  const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, {
    expiresIn: `${config.sessionHours}h`,
  });
  res.cookie(COOKIE, token, cookieOptions);
  res.json({ username: user.username });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

authRouter.post('/password', requireAuth, async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const user = findUser(req.user.username);
  if (!user || !(await bcrypt.compare(parsed.data.current, user.password_hash)))
    return res.status(401).json({ error: 'Current password is wrong' });
  setPassword(user.id, parsed.data.next);
  res.json({ ok: true });
});
