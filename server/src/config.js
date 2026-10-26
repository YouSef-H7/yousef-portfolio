import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..', '..');

export const config = {
  port: Number(process.env.PORT || 3000),
  env: process.env.NODE_ENV || 'development',
  dataDir: path.resolve(process.env.DATA_DIR || path.join(root, 'data')),
  clientDist: path.resolve(process.env.CLIENT_DIST || path.join(root, 'client', 'dist')),
  siteUrl: (process.env.SITE_URL || '').replace(/\/$/, ''),
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  trustProxy: process.env.TRUST_PROXY === '1',
  sessionHours: 12,
};

export const uploadsDir = path.join(config.dataDir, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// JWT secret: from env, else generated once and kept next to the database.
function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(config.dataDir, '.jwt-secret');
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    const s = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(file, s, { mode: 0o600 });
    return s;
  }
}
export const jwtSecret = loadSecret();
export const isProd = config.env === 'production';
