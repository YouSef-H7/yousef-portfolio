import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { config, uploadsDir, isProd } from './config.js';
import { seed, getAllContent } from './db.js';
import { authRouter, sameOrigin } from './auth.js';
import { contentRouter } from './content.js';

seed();

const app = express();
app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com'],
        fontSrc: ['https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    strictTransportSecurity: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---- API ----
const api = express.Router();
api.use(sameOrigin);
api.use(rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
api.get('/health', (req, res) => res.json({ ok: true, uptime: Math.round(process.uptime()) }));
api.use('/auth', authRouter);
api.use(contentRouter);
api.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use('/api', api);

// ---- uploaded photos (unique filenames, so cache for a year) ----
app.use('/uploads', express.static(uploadsDir, { maxAge: '365d', immutable: true, index: false }));

app.get('/sitemap.xml', (req, res) => {
  const base = config.siteUrl || `${req.protocol}://${req.get('x-forwarded-host') || req.get('host')}`;
  const { updatedAt } = getAllContent();
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `  <url><loc>${esc(base)}/</loc>${updatedAt ? `<lastmod>${updatedAt.slice(0, 10)}</lastmod>` : ''}</url>\n</urlset>\n`,
  );
});

// ---- built client ----
const indexFile = path.join(config.clientDist, 'index.html');
if (!fs.existsSync(indexFile)) {
  console.warn(`Client build not found at ${indexFile}. Run "npm run build" in client/.`);
}
app.use(express.static(config.clientDist, { index: false, maxAge: '1y', immutable: true, setHeaders }));
function setHeaders(res, file) {
  // Only hashed files under /assets are immutable; everything else is revalidated.
  if (!file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'no-cache');
}

// Serve the SPA shell with real meta tags and the content embedded, so the first paint
// needs no extra request and link previews / crawlers see the right title.
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return res.status(404).end();
  let html;
  try {
    html = fs.readFileSync(indexFile, 'utf8');
  } catch {
    return res.status(503).type('text').send('Client not built yet.');
  }
  const { content, updatedAt } = getAllContent();
  const seo = content.seo || {};
  const base = config.siteUrl || `${req.protocol}://${req.get('x-forwarded-host') || req.get('host')}`;
  const isAdmin = req.path.startsWith('/admin');
  const title = isAdmin ? `Admin · ${seo.title || 'Portfolio'}` : seo.title || 'Portfolio';
  const image = content.photos?.portrait ? `${base}${content.photos.portrait}` : '';
  const name = `${content.profile?.firstName || ''} ${content.profile?.lastName || ''}`.trim();

  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}">`,
    `<link rel="canonical" href="${esc(base)}/">`,
    isAdmin ? `<meta name="robots" content="noindex, nofollow">` : '',
    `<meta property="og:type" content="profile">`,
    `<meta property="og:title" content="${esc(seo.title)}">`,
    `<meta property="og:description" content="${esc(seo.description)}">`,
    `<meta property="og:url" content="${esc(base)}/">`,
    image ? `<meta property="og:image" content="${esc(image)}">` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name,
      jobTitle: content.profile?.eyebrow?.split('·')[0]?.trim(),
      url: `${base}/`,
      email: content.contact?.email ? `mailto:${content.contact.email}` : undefined,
      telephone: content.contact?.phone?.replace(/\s/g, ''),
      image: image || undefined,
      sameAs: (content.contact?.links || []).map((l) => l.url),
    }).replace(/</g, '\\u003c')}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');

  const data = `<script id="initial-data" type="application/json">${JSON.stringify({ content, updatedAt }).replace(/</g, '\\u003c')}</script>`;

  res.set('Cache-Control', 'no-cache');
  res.send(html.replace('<!--SSR_HEAD-->', head).replace('<!--SSR_DATA-->', data));
});

// ---- errors ----
app.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image is larger than 15 MB' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(config.port, () => {
  console.log(`Portfolio running on http://localhost:${config.port} (${config.env}), data in ${config.dataDir}`);
});
