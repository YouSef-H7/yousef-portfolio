#!/usr/bin/env bash
# Installs and runs the portfolio on a Linux VM (Ubuntu/Debian or Oracle Linux/RHEL/Rocky/Alma):
# Docker for the app, nginx + Let's Encrypt in front of it.
#
# Run from the extracted bundle directory, as root:
#   sudo bash deploy/setup-vm.sh --domain example.com --email you@example.com [--www] [--admin-password '...']
#   sudo bash deploy/setup-vm.sh --site-url http://203.0.113.10          # no domain yet, HTTP only
#   sudo bash deploy/setup-vm.sh --app-only                              # redeploy the app, keep nginx/cert as is
#
# Safe to re-run. The .env in /opt/portfolio (admin password, secrets) is kept between runs.
set -euo pipefail

DOMAIN="" EMAIL="" WWW=0 SITE_URL="" APP_ONLY=0 ADMIN_PASSWORD=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)         DOMAIN="$2"; shift 2 ;;
    --email)          EMAIL="$2"; shift 2 ;;
    --www)            WWW=1; shift ;;
    --site-url)       SITE_URL="$2"; shift 2 ;;
    --admin-password) ADMIN_PASSWORD="$2"; shift 2 ;;
    --app-only)       APP_ONLY=1; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

[[ $EUID -eq 0 ]] || { echo "Run as root (sudo)." >&2; exit 1; }
SRC="$(cd "$(dirname "$0")/.." && pwd)"
[[ -f "$SRC/docker-compose.yml" && -d "$SRC/server" && -d "$SRC/client" ]] || { echo "Run this from the project bundle (docker-compose.yml, server/, client/)." >&2; exit 1; }

APP_DIR=/opt/portfolio
log(){ printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
if command -v apt-get >/dev/null; then PM=apt; elif command -v dnf >/dev/null; then PM=dnf; else PM=yum; fi

if [[ -n "$DOMAIN" ]]; then
  SITE_URL="${SITE_URL:-https://$DOMAIN}"
  SERVER_NAME="$DOMAIN"; [[ $WWW -eq 1 ]] && SERVER_NAME="$DOMAIN www.$DOMAIN"
elif [[ $APP_ONLY -eq 0 ]]; then
  [[ -n "$SITE_URL" ]] || { echo "Pass --domain or --site-url (or --app-only)." >&2; exit 1; }
  SERVER_NAME="_"
fi
SITE_URL="${SITE_URL%/}"

# ---------- docker ----------
if ! command -v docker >/dev/null; then
  log "Installing Docker"
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker
docker compose version >/dev/null 2>&1 || { echo "Docker Compose plugin missing. Install docker-compose-plugin and re-run." >&2; exit 1; }

# ---------- copy project ----------
log "Installing project to $APP_DIR"
mkdir -p "$APP_DIR"
[[ -f "$APP_DIR/.env" ]] && cp "$APP_DIR/.env" /tmp/portfolio.env.keep
find "$APP_DIR" -mindepth 1 -maxdepth 1 ! -name '.env' -exec rm -rf {} +
cp -a "$SRC/." "$APP_DIR/"
rm -rf "$APP_DIR"/{server,client}/node_modules "$APP_DIR"/client/dist "$APP_DIR"/data
[[ -f /tmp/portfolio.env.keep ]] && mv /tmp/portfolio.env.keep "$APP_DIR/.env"
chmod 700 "$APP_DIR"

# ---------- .env ----------
GENERATED_PW=""
if [[ ! -f "$APP_DIR/.env" ]]; then
  log "Creating .env"
  if [[ -z "$ADMIN_PASSWORD" ]]; then
    ADMIN_PASSWORD="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20)"
    GENERATED_PW="$ADMIN_PASSWORD"
  fi
  cat >"$APP_DIR/.env" <<EOF
SITE_URL=${SITE_URL}
ADMIN_USER=admin
ADMIN_PASSWORD=${ADMIN_PASSWORD}
JWT_SECRET=$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 64)
EOF
  chmod 600 "$APP_DIR/.env"
else
  [[ -n "$SITE_URL" ]] && sed -i "s#^SITE_URL=.*#SITE_URL=${SITE_URL}#" "$APP_DIR/.env"
  [[ -n "$ADMIN_PASSWORD" ]] && echo "Note: an .env already exists, so --admin-password is ignored. Change the password in /admin → Settings."
fi

# ---------- build & run ----------
log "Building and starting the app container"
cd "$APP_DIR"
docker compose up -d --build --remove-orphans
docker image prune -f >/dev/null

log "Waiting for the app to become healthy"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null 2>&1; then echo "App is up."; break; fi
  sleep 2
  [[ $i -eq 30 ]] && { echo "App did not start. Logs:" >&2; docker compose logs --tail=50; exit 1; }
done

if [[ $APP_ONLY -eq 1 ]]; then
  log "Done. App redeployed."
  exit 0
fi

# ---------- nginx + certbot ----------
log "Installing nginx and certbot"
if [[ $PM == apt ]]; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y nginx certbot python3-certbot-nginx
else
  if ! rpm -q epel-release oracle-epel-release-el8 oracle-epel-release-el9 >/dev/null 2>&1; then
    REL="$(rpm -E %rhel)"
    $PM install -y "oracle-epel-release-el$REL" 2>/dev/null || $PM install -y epel-release
  fi
  $PM install -y nginx certbot python3-certbot-nginx
  command -v setsebool >/dev/null && setsebool -P httpd_can_network_connect 1 || true
fi

log "Configuring nginx"
mkdir -p /etc/nginx/conf.d
sed "s#__SERVER_NAME__#${SERVER_NAME}#" "$APP_DIR/deploy/nginx.conf" > /etc/nginx/conf.d/portfolio.conf
rm -f /etc/nginx/sites-enabled/default
[[ -f /etc/nginx/nginx.conf ]] && sed -i 's/\(listen[^;]*\) default_server/\1/' /etc/nginx/nginx.conf
nginx -t
systemctl enable nginx
systemctl restart nginx

# ---------- VM firewall ----------
log "Opening ports 80/443 on the VM firewall"
if command -v firewall-cmd >/dev/null && systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-service=http --add-service=https
  firewall-cmd --reload
elif command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 'Nginx Full'
elif command -v iptables >/dev/null; then
  # Oracle Cloud Ubuntu images ship iptables rules that reject everything except SSH
  for p in 80 443; do
    iptables -C INPUT -p tcp --dport $p -m state --state NEW -j ACCEPT 2>/dev/null \
      || iptables -I INPUT 1 -p tcp --dport $p -m state --state NEW -j ACCEPT
  done
  command -v netfilter-persistent >/dev/null && netfilter-persistent save || true
fi

# ---------- HTTPS ----------
if [[ -n "$DOMAIN" ]]; then
  log "Requesting Let's Encrypt certificate for $SERVER_NAME"
  CERT_ARGS=(-d "$DOMAIN"); [[ $WWW -eq 1 ]] && CERT_ARGS+=(-d "www.$DOMAIN")
  if [[ -n "$EMAIL" ]]; then MAIL=(-m "$EMAIL"); else MAIL=(--register-unsafely-without-email); fi
  if certbot --nginx "${CERT_ARGS[@]}" "${MAIL[@]}" --agree-tos --non-interactive --redirect --keep-until-expiring; then
    systemctl enable --now certbot.timer 2>/dev/null || systemctl enable --now certbot-renew.timer 2>/dev/null || true
    log "HTTPS enabled. Certificates renew automatically."
  else
    echo "Certificate request failed. Check that DNS for $DOMAIN points to this VM and port 80 is open in your cloud firewall, then re-run." >&2
  fi
fi

log "Done. Site: $SITE_URL   Admin: $SITE_URL/admin"
if [[ -n "$GENERATED_PW" ]]; then
  printf '\n\033[1;33mAdmin login\033[0m  user: admin   password: %s\n' "$GENERATED_PW"
  echo "This is shown once. It is also in $APP_DIR/.env. Change it in /admin → Settings."
fi
