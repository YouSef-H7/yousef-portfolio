import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { uploadsDir } from './config.js';
import { getAllContent, getSection, saveSection, getHistory, getHistoryEntry } from './db.js';
import { sectionSchemas, sectionNames } from './schema.js';
import { requireAuth } from './auth.js';

export const contentRouter = Router();

// ---- public ----
contentRouter.get('/content', (req, res) => {
  const { content, updatedAt } = getAllContent();
  res.set('Cache-Control', 'no-cache');
  res.json({ content, updatedAt });
});

// ---- admin ----
contentRouter.put('/content/:section', requireAuth, (req, res) => {
  const { section } = req.params;
  const schema = sectionSchemas[section];
  if (!schema) return res.status(404).json({ error: `Unknown section "${section}"` });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return res.status(400).json({
      error: `${issue.path.join('.') || 'value'}: ${issue.message}`,
      issues: parsed.error.issues,
    });
  }
  if (section === 'experience') {
    const ids = parsed.data.roles.map((r) => r.id);
    if (new Set(ids).size !== ids.length) return res.status(400).json({ error: 'Role ids must be unique' });
  }
  saveSection(section, parsed.data);
  res.json({ ok: true, section, data: parsed.data });
});

contentRouter.get('/content/:section/history', requireAuth, (req, res) => {
  if (!sectionNames.includes(req.params.section)) return res.status(404).json({ error: 'Unknown section' });
  res.json({ history: getHistory(req.params.section) });
});

contentRouter.post('/content/restore/:id', requireAuth, (req, res) => {
  const entry = getHistoryEntry(Number(req.params.id));
  if (!entry) return res.status(404).json({ error: 'History entry not found' });
  saveSection(entry.section, entry.data);
  res.json({ ok: true, section: entry.section, data: entry.data });
});

// ---- photo uploads ----
const SLOTS = {
  portrait: { width: 1100, height: 1375 }, // 4:5
  work: { width: 1600, height: 900 }, // 16:9
  detail: { width: 1100, height: 1375 },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp|heic|heif|avif|gif)$/.test(file.mimetype));
  },
});

contentRouter.post('/photos/:slot', requireAuth, upload.single('photo'), async (req, res) => {
  const { slot } = req.params;
  const size = SLOTS[slot];
  if (!size) return res.status(404).json({ error: 'Unknown photo slot' });
  if (!req.file) return res.status(400).json({ error: 'Choose an image file (JPG, PNG, WebP, HEIC)' });

  const name = `${slot}-${Date.now()}.webp`;
  try {
    await sharp(req.file.buffer)
      .rotate() // honour EXIF orientation from phones
      .resize(size.width, size.height, { fit: 'cover', position: 'attention', withoutEnlargement: false })
      .webp({ quality: 84 })
      .toFile(path.join(uploadsDir, name));
  } catch {
    return res.status(400).json({ error: 'That file could not be read as an image' });
  }

  const photos = getSection('photos') || {};
  const old = photos[slot];
  photos[slot] = `/uploads/${name}`;
  saveSection('photos', photos);
  if (old) fs.unlink(path.join(uploadsDir, path.basename(old))).catch(() => {});
  res.json({ ok: true, photos });
});

contentRouter.delete('/photos/:slot', requireAuth, async (req, res) => {
  const { slot } = req.params;
  if (!SLOTS[slot]) return res.status(404).json({ error: 'Unknown photo slot' });
  const photos = getSection('photos') || {};
  const old = photos[slot];
  photos[slot] = null;
  saveSection('photos', photos);
  if (old) fs.unlink(path.join(uploadsDir, path.basename(old))).catch(() => {});
  res.json({ ok: true, photos });
});
