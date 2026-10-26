import Database from 'better-sqlite3';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { defaultContent } from './defaults.js';

export const db = new Database(path.join(config.dataDir, 'portfolio.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS content (
    section TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS content_history (
    id INTEGER PRIMARY KEY,
    section TEXT NOT NULL,
    data TEXT NOT NULL,
    saved_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const getStmt = db.prepare('SELECT data FROM content WHERE section = ?');
const allStmt = db.prepare('SELECT section, data, updated_at FROM content');
const putStmt = db.prepare(`
  INSERT INTO content (section, data, updated_at) VALUES (?, ?, datetime('now'))
  ON CONFLICT(section) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
`);
const histStmt = db.prepare('INSERT INTO content_history (section, data) VALUES (?, ?)');
const trimHist = db.prepare(`
  DELETE FROM content_history WHERE section = ? AND id NOT IN
  (SELECT id FROM content_history WHERE section = ? ORDER BY id DESC LIMIT 20)
`);

export function getSection(section) {
  const row = getStmt.get(section);
  return row ? JSON.parse(row.data) : null;
}

export function getAllContent() {
  const out = {};
  let updatedAt = null;
  for (const row of allStmt.all()) {
    out[row.section] = JSON.parse(row.data);
    if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at;
  }
  return { content: out, updatedAt };
}

export const saveSection = db.transaction((section, data) => {
  const prev = getStmt.get(section);
  if (prev) {
    histStmt.run(section, prev.data);
    trimHist.run(section, section);
  }
  putStmt.run(section, JSON.stringify(data));
});

export function getHistory(section) {
  return db
    .prepare('SELECT id, saved_at FROM content_history WHERE section = ? ORDER BY id DESC')
    .all(section);
}

export function getHistoryEntry(id) {
  const row = db.prepare('SELECT section, data FROM content_history WHERE id = ?').get(id);
  return row ? { section: row.section, data: JSON.parse(row.data) } : null;
}

// ---- users ----
export function findUser(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}
export function userCount() {
  return db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
}
export function setPassword(id, plain) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(plain, 12), id);
}

// ---- first run: seed content and the admin account ----
export function seed() {
  const seedContent = db.transaction(() => {
    for (const [section, data] of Object.entries(defaultContent)) {
      if (!getStmt.get(section)) putStmt.run(section, JSON.stringify(data));
    }
  });
  seedContent();

  if (userCount() === 0) {
    if (!config.adminPassword) {
      console.warn(
        '\n!! No admin account exists and ADMIN_PASSWORD is not set.\n' +
          '   The public site works, but /admin cannot be used until you set ADMIN_PASSWORD and restart.\n',
      );
      return;
    }
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(
      config.adminUser,
      bcrypt.hashSync(config.adminPassword, 12),
    );
    console.log(`Created admin account "${config.adminUser}".`);
  }
}
