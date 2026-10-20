#!/usr/bin/env bash
#
# Deploy ایستگاه دندان to the production server.
#
#   ./scripts/deploy.sh              # full deploy, asks for confirmation
#   ./scripts/deploy.sh --dry-run    # show what would be synced, change nothing
#   ./scripts/deploy.sh --yes        # skip the confirmation prompt
#   ./scripts/deploy.sh --rollback   # restore the previous release
#
# The server also hosts other sites. Everything here is scoped to
# $REMOTE_DIR and the single pm2 process $PM2_APP — nothing else is touched.
#
# What is never overwritten on the server:
#   .env                  production secrets
#   public/uploads/       ~186MB of user uploads
#   node_modules/         reinstalled with `npm ci`, not synced
#
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
REMOTE_HOST="root@185.164.73.224"
REMOTE_DIR="/var/www/istgahedandan"
PM2_APP="istgahedandan"
SITE_URL="https://istgahedandan.ir"
HEALTH_PATH="/"
LOCAL_PORT_CHECK="http://127.0.0.1:3004/"
BACKUP_ROOT="/var/backups/istgahedandan"
KEEP_BACKUPS=5

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=15)
# With a VPN/tunnel up on the laptop the server is slow or unreachable through
# it. Set DEPLOY_IFACE to the physical interface (e.g. DEPLOY_IFACE=wlo1) to
# pin SSH/rsync to it and go around the tunnel.
if [ -n "${DEPLOY_IFACE:-}" ]; then
  SSH_OPTS+=(-o "BindInterface=$DEPLOY_IFACE")
fi
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─── Output helpers ──────────────────────────────────────────────────────────
if [ -t 1 ]; then
  R=$'\e[31m'; G=$'\e[32m'; Y=$'\e[33m'; B=$'\e[36m'; D=$'\e[2m'; N=$'\e[0m'
else
  R=""; G=""; Y=""; B=""; D=""; N=""
fi
step() { printf "\n%s▸ %s%s\n" "$B" "$*" "$N"; }
ok()   { printf "  %s✓%s %s\n" "$G" "$N" "$*"; }
warn() { printf "  %s!%s %s\n" "$Y" "$N" "$*"; }
die()  { printf "\n%s✗ %s%s\n" "$R" "$*" "$N" >&2; exit 1; }
note() { printf "  %s%s%s\n" "$D" "$*" "$N"; }

remote() { ssh "${SSH_OPTS[@]}" "$REMOTE_HOST" "$@"; }

DRY_RUN=0; ASSUME_YES=0; ROLLBACK=0
for arg in "$@"; do
  case "$arg" in
    --dry-run)  DRY_RUN=1 ;;
    --yes|-y)   ASSUME_YES=1 ;;
    --rollback) ROLLBACK=1 ;;
    --help|-h)  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) die "گزینهٔ ناشناخته: $arg" ;;
  esac
done

# Paths excluded from the sync. Server-only state and anything rebuilt there.
RSYNC_EXCLUDES=(
  --exclude ".git"
  --exclude ".env"
  --exclude ".env.local"
  --exclude "node_modules"
  --exclude ".next"
  --exclude "public/uploads"
  --exclude "*.tsbuildinfo"
  --exclude ".DS_Store"
  --exclude "docker-compose.yml"
  # Server-only pm2 config. It is not in the repo, so without this exclude
  # `--delete` would remove it and pm2 could no longer start the app.
  --exclude "ecosystem.config.json"
  # Local editor/agent tooling, nothing the server needs.
  --exclude ".qodo"
  --exclude ".claude"
)

# ─── Rollback ────────────────────────────────────────────────────────────────
if [ "$ROLLBACK" -eq 1 ]; then
  step "بازگردانی به نسخهٔ قبلی"
  LAST=$(remote "ls -1d $BACKUP_ROOT/*/ 2>/dev/null | tail -1" || true)
  [ -n "$LAST" ] || die "هیچ نسخهٔ پشتیبانی در $BACKUP_ROOT پیدا نشد"
  note "نسخهٔ پشتیبان: $LAST"
  remote "set -e
    [ -d '${LAST}next-build' ] || { echo 'پشتیبان .next ناقص است'; exit 1; }
    rm -rf $REMOTE_DIR/.next
    cp -a '${LAST}next-build' $REMOTE_DIR/.next
    pm2 reload $PM2_APP --update-env"
  ok "فایل‌های build بازگردانده و سرویس ری‌استارت شد"
  warn "دیتابیس بازگردانده نشد. در صورت نیاز از فایل dump همان پوشه:"
  note "  ssh $REMOTE_HOST \"gunzip -c ${LAST}db.sql.gz | sudo -u postgres psql -d istgahedandan_db\""
  exit 0
fi

# ─── 1. Local preflight ──────────────────────────────────────────────────────
step "۱/۸ بررسی‌های محلی"
cd "$REPO_ROOT"

command -v rsync >/dev/null || die "rsync نصب نیست"

if git rev-parse --git-dir >/dev/null 2>&1; then
  if [ -n "$(git status --porcelain)" ]; then
    warn "تغییرات کامیت‌نشده در working tree وجود دارد"
    note "$(git status --porcelain | head -5)"
  fi
  note "کامیت فعلی: $(git rev-parse --short HEAD) — $(git log -1 --format=%s)"
fi

note "بررسی تایپ‌ها…"
npx tsc --noEmit || die "بررسی تایپ شکست خورد — دیپلوی متوقف شد"
ok "tsc پاک"

note "build محلی برای اطمینان از سالم بودن کد…"
npm run build >/dev/null 2>&1 || die "build محلی شکست خورد — دیپلوی متوقف شد"
ok "build محلی موفق"

# The migrations folder must reproduce schema.prisma exactly, otherwise
# `migrate deploy` on the server would leave production out of sync.
if [ -n "${SHADOW_DATABASE_URL:-}" ]; then
  DIFF=$(npx prisma migrate diff --from-migrations prisma/migrations \
          --to-schema prisma/schema.prisma --script 2>/dev/null | grep -v "^--" | tr -d '[:space:]' || true)
  [ -z "$DIFF" ] || die "پوشهٔ migrations با schema.prisma هماهنگ نیست"
  ok "migrations با schema هماهنگ است"
else
  warn "SHADOW_DATABASE_URL ست نشده — هماهنگی migrations بررسی نشد"
fi

# ─── 2. Remote preflight ─────────────────────────────────────────────────────
step "۲/۸ بررسی‌های سرور"
remote "echo ok" >/dev/null 2>&1 || die "اتصال SSH به $REMOTE_HOST برقرار نشد"
ok "SSH برقرار"

remote "[ -d $REMOTE_DIR ]" || die "$REMOTE_DIR روی سرور وجود ندارد"
remote "pm2 describe $PM2_APP >/dev/null 2>&1" || die "پروسهٔ pm2 با نام $PM2_APP پیدا نشد"
ok "مسیر و پروسهٔ pm2 موجود است"

# The app refuses to sign tokens with a weak secret — catch that before deploying.
SECRET_LEN=$(remote "grep -E '^JWT_SECRET=' $REMOTE_DIR/.env | head -1 | sed -E 's/^JWT_SECRET=//; s/^\"//; s/\"$//' | tr -d '\n' | wc -c" || echo 0)
[ "$SECRET_LEN" -ge 32 ] || die "JWT_SECRET سرور $SECRET_LEN کاراکتر است؛ حداقل ۳۲ لازم است"
ok "JWT_SECRET سرور معتبر است ($SECRET_LEN کاراکتر)"

FREE_MB=$(remote "df -Pm $REMOTE_DIR | tail -1 | awk '{print \$4}'")
[ "$FREE_MB" -ge 3000 ] || die "فضای دیسک کافی نیست (${FREE_MB}MB آزاد)"
ok "فضای دیسک: ${FREE_MB}MB آزاد"

if [ "$DRY_RUN" -eq 1 ]; then
  step "اجرای آزمایشی — فایل‌هایی که همگام می‌شدند"
  rsync -az --delete --dry-run --itemize-changes "${RSYNC_EXCLUDES[@]}" \
    -e "ssh ${SSH_OPTS[*]}" "$REPO_ROOT/" "$REMOTE_HOST:$REMOTE_DIR/" | head -50
  printf "\n%s(اجرای آزمایشی — هیچ تغییری روی سرور اعمال نشد)%s\n" "$D" "$N"
  exit 0
fi

# ─── 3. Confirm ──────────────────────────────────────────────────────────────
if [ "$ASSUME_YES" -eq 0 ]; then
  printf "\n%s%s  →  %s%s\n" "$Y" "$REPO_ROOT" "$SITE_URL" "$N"
  printf "%sسایت در حین build چند ثانیه کند می‌شود.%s\n" "$D" "$N"
  read -r -p "ادامه می‌دهید؟ (yes/no) " reply
  [ "$reply" = "yes" ] || die "لغو شد"
fi

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/$STAMP"

# ─── 4. Backup ───────────────────────────────────────────────────────────────
step "۳/۸ پشتیبان‌گیری"
remote "set -e
  mkdir -p '$BACKUP_DIR'
  sudo -u postgres pg_dump istgahedandan_db | gzip > '$BACKUP_DIR/db.sql.gz'
  [ -d $REMOTE_DIR/.next ] && cp -a $REMOTE_DIR/.next '$BACKUP_DIR/next-build' || true
  cp $REMOTE_DIR/.env '$BACKUP_DIR/env.bak'
  chmod 600 '$BACKUP_DIR/env.bak'"
DB_SIZE=$(remote "du -h '$BACKUP_DIR/db.sql.gz' | cut -f1")
ok "دیتابیس ($DB_SIZE)، فایل‌های build و .env در $BACKUP_DIR"

# ─── 5. Sync source ──────────────────────────────────────────────────────────
step "۴/۸ همگام‌سازی کد"
rsync -az --delete "${RSYNC_EXCLUDES[@]}" \
  -e "ssh ${SSH_OPTS[*]}" "$REPO_ROOT/" "$REMOTE_HOST:$REMOTE_DIR/"
ok "کد همگام شد (.env و public/uploads دست‌نخورده)"

# ─── 6. Install + migrate ────────────────────────────────────────────────────
step "۵/۸ نصب وابستگی‌ها"
# Full install, including devDependencies: `next build` needs typescript and
# the tailwind/postcss toolchain, so --omit=dev would break the build step.
remote "cd $REMOTE_DIR && npm ci --no-audit --no-fund >/dev/null"
remote "cd $REMOTE_DIR && npx prisma generate >/dev/null 2>&1"
ok "npm ci و prisma generate انجام شد"

step "۶/۸ migration دیتابیس"
# A database that predates the migrations folder has an empty _prisma_migrations
# table while already containing every table of the baseline. Mark the baseline
# as applied so `migrate deploy` only runs what came after it.
APPLIED=$(remote "sudo -u postgres psql -d istgahedandan_db -tAc \
  \"SELECT count(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL\" 2>/dev/null" || echo 0)
if [ "${APPLIED:-0}" -eq 0 ]; then
  HAS_TABLES=$(remote "sudo -u postgres psql -d istgahedandan_db -tAc \
    \"SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='Dentist'\"")
  if [ "$HAS_TABLES" -eq 1 ]; then
    warn "دیتابیس موجود ولی baseline نشده — علامت‌گذاری می‌شود"
    remote "cd $REMOTE_DIR && npx prisma migrate resolve --applied 20260812000000_baseline >/dev/null"
    ok "baseline به‌عنوان applied ثبت شد"
  fi
fi

MIGRATE_OUT=$(remote "cd $REMOTE_DIR && npx prisma migrate deploy 2>&1") || {
  printf "%s\n" "$MIGRATE_OUT"
  die "migration شکست خورد — کد همگام شده ولی build نشده. برای بازگردانی: $0 --rollback"
}
printf "%s\n" "$MIGRATE_OUT" | grep -E "Applying|No pending|migrations? (found|applied)" | sed 's/^/  /' || true
ok "دیتابیس به‌روز است"

# ─── 7. Build + reload ───────────────────────────────────────────────────────
step "۷/۸ build روی سرور"
remote "cd $REMOTE_DIR && npm run build >/dev/null 2>&1" \
  || die "build روی سرور شکست خورد — سرویس قدیمی هنوز در حال اجراست. بازگردانی: $0 --rollback"
ok "build موفق"

remote "pm2 reload $PM2_APP --update-env >/dev/null && pm2 save >/dev/null 2>&1 || true"
ok "pm2 ری‌استارت شد"

# ─── 8. Health check ─────────────────────────────────────────────────────────
step "۸/۸ بررسی سلامت"
HEALTHY=0
for i in $(seq 1 15); do
  CODE=$(remote "curl -s -o /dev/null -w '%{http_code}' --max-time 10 $LOCAL_PORT_CHECK" || echo 000)
  if [ "$CODE" = "200" ]; then HEALTHY=1; ok "پاسخ محلی پورت ۳۰۰۴: $CODE"; break; fi
  sleep 2
done

if [ "$HEALTHY" -eq 0 ]; then
  printf "\n%sآخرین خطاهای pm2:%s\n" "$R" "$N"
  remote "pm2 logs $PM2_APP --lines 25 --nostream --err" || true
  die "سرویس بالا نیامد. بازگردانی: $0 --rollback"
fi

PUBLIC_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL$HEALTH_PATH" || echo 000)
if [ "$PUBLIC_CODE" = "200" ]; then
  ok "پاسخ عمومی $SITE_URL: $PUBLIC_CODE"
else
  warn "پاسخ عمومی $SITE_URL: $PUBLIC_CODE — nginx یا DNS را بررسی کنید"
fi

# Keep the backup directory from growing without bound.
remote "cd $BACKUP_ROOT 2>/dev/null && ls -1d */ 2>/dev/null | head -n -$KEEP_BACKUPS | xargs -r rm -rf" || true

printf "\n%s✓ دیپلوی کامل شد%s\n" "$G" "$N"
note "پشتیبان: $BACKUP_DIR"
note "بازگردانی: $0 --rollback"
note "لاگ‌ها:   ssh $REMOTE_HOST 'pm2 logs $PM2_APP'"
printf "\n%sتوجه: به دلیل افزوده شدن claim نقش به توکن‌ها، همهٔ ادمین‌ها و%s\n" "$Y" "$N"
printf "%sدندانپزشکان باید یک‌بار دوباره وارد شوند.%s\n" "$Y" "$N"
