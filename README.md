# Yousef Al-Harbi: portfolio

Portfolio website with a control panel at `/admin` to edit every section and upload photos. No code changes needed to update content.

**Stack:** React 18 + Vite (components) · Node 22 + Express API · SQLite · Docker · nginx + Let's Encrypt.

```
client/                 React app
  src/components/       Header, Hero, About, Experience, Stack, Certifications, Education, Contact, Photo
  src/pages/Portfolio   public page
  src/pages/admin/      control panel: login, one editor per section, photos, SEO, settings
  src/styles/           site.css, admin.css
server/                 Express API
  src/index.js          app, security headers, SPA shell with injected meta tags + content
  src/auth.js           login (bcrypt + JWT cookie), rate limit, origin check
  src/content.js        content CRUD, version history, photo upload (sharp → WebP)
  src/schema.js         validation (zod) for each section
  src/db.js             SQLite (better-sqlite3), seeding
  src/defaults.js       initial content
deploy/
  setup-vm.sh           VM installer: Docker, nginx, certbot, firewall
  nginx.conf            reverse proxy
Dockerfile · docker-compose.yml · .env.example
deploy.ps1              one command from Windows: pack → upload → setup
```

## Control panel

Open `https://yourdomain.com/admin`. Sections: **Hero & profile, About, Photos, Experience, Stack, Certifications, Education, Contact, SEO, Settings**.

* Every save goes live immediately. Each section keeps its last 20 versions ("Version history" at the bottom, with Restore).
* Photos are resized and converted to WebP on the server; phone photos up to 15 MB are fine. The portrait also becomes the link-preview image on LinkedIn/WhatsApp.
* Light text formatting: `**bold**`, `*warm accent*`, `__blue accent__`.
* Change the admin password under Settings.

## Run locally

Requires Node 20+.

```powershell
npm run install:all
npm install                      # root dev tool (concurrently)
$env:ADMIN_PASSWORD = "dev-password-123"
npm run dev                      # API on :3000, site on http://localhost:5173 (admin: /admin)
```

Data is stored in `data/` (ignored by git). To test the production build: `npm run build` then `npm start` and open http://localhost:3000.

## Deploy to a VM

Works on Ubuntu 22.04/24.04, Debian, Oracle Linux 8/9, Rocky/Alma. The VM needs 1 GB RAM (the first image build uses more; add swap on tiny VMs).

1. **Cloud firewall:** open inbound TCP **80** and **443** (OCI Security List / NSG, Azure NSG, AWS Security Group). The script opens the VM's own firewall but can't touch the cloud one.
2. **DNS:** if you have a domain, point an **A record** (and `www` if wanted) to the VM's public IP *before* deploying, so the certificate can be issued.
3. From this folder in PowerShell:

```powershell
# with a domain (HTTPS)
.\deploy.ps1 -VmHost <VM_IP> -User ubuntu -Key C:\path\to\key -Domain yourdomain.com -Email you@example.com -Www

# without a domain yet (HTTP on the IP)
.\deploy.ps1 -VmHost <VM_IP> -User ubuntu -Key C:\path\to\key
```

The user is `ubuntu` on Ubuntu images and `opc` on Oracle Linux. If PowerShell blocks the script: `powershell -ExecutionPolicy Bypass -File .\deploy.ps1 ...`.

At the end the script prints the **admin password** (generated once, also stored in `/opt/portfolio/.env`). Pass your own with `-AdminPassword '...'`. Sign in at `/admin` and change it under Settings.

**Later code updates:** `.\deploy.ps1 ... -AppOnly` rebuilds the container only; content and photos live in a Docker volume and are untouched. When you get a domain later, run once with `-Domain` to switch on HTTPS.

### Manual deploy (no PowerShell)

```bash
scp -r server client deploy Dockerfile docker-compose.yml .dockerignore .env.example ubuntu@<IP>:/tmp/portfolio-bundle/
ssh ubuntu@<IP> "sudo bash /tmp/portfolio-bundle/deploy/setup-vm.sh --domain yourdomain.com --email you@example.com"
```

### What's on the server

* App container `portfolio` (restart: unless-stopped, health-checked), bound to `127.0.0.1:3000`. Project in `/opt/portfolio`, data in Docker volume `portfolio_portfolio-data`.
* nginx on 80/443 proxying to it; HTTP→HTTPS redirect; certbot timer renews certificates.
* Security: strict Content-Security-Policy, HSTS, httpOnly `SameSite=Strict` session cookie, bcrypt passwords, login rate limiting, origin check on writes, input validation on every section, non-root container.

### Operations

```bash
cd /opt/portfolio
docker compose logs -f                      # app logs
docker compose restart
docker run --rm -v portfolio_portfolio-data:/data -v $PWD:/backup debian tar czf /backup/portfolio-backup.tgz -C /data .   # backup content + photos
sudo nginx -t && sudo systemctl status nginx
```

Forgot the admin password? `nano /opt/portfolio/.env` is only read on the very first start, so instead reset the account:

```bash
docker compose exec portfolio node -e "const D=require('better-sqlite3'),b=require('bcryptjs');new D('/data/portfolio.db').prepare('UPDATE users SET password_hash=?').run(b.hashSync('NEW-PASSWORD',12))"
```

## Troubleshooting

* **Site doesn't load:** port 80/443 closed in the cloud firewall (most common on OCI and Azure).
* **Certificate failed:** DNS not pointing at the VM yet (`nslookup yourdomain.com`). Fix, then re-run the full command.
* **Build killed on a small VM:** add swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`.
