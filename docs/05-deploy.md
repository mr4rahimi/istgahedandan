# دیپلوی

## سرور پروداکشن

| مورد | مقدار |
|---|---|
| آدرس | `185.164.73.224` (دسترسی SSH با کلید، بدون رمز) |
| دامنه | <https://istgahedandan.ir> |
| CDN | دامنه به `185.208.173.17` اشاره می‌کند (`WCDN`)، نه مستقیم به سرور |
| مسیر اپ | `/var/www/istgahedandan` |
| پروسه | pm2 با نام `istgahedandan`، دستور `next start --port 3004` |
| تنظیمات pm2 | `/var/www/istgahedandan/ecosystem.config.json` — **فقط روی سرور است، در repo نیست** |
| دیتابیس | PostgreSQL محلی سرور، پورت ۵۴۳۲، دیتابیس `istgahedandan_db` |
| وب‌سرور | nginx، `/etc/nginx/sites-enabled/istgahedandan.ir` |
| SSL | `/etc/ssl/istgahedandan/` |
| Node | v22.15.0 |
| لاگ‌ها | `/var/log/pm2/istgahedandan-{out,error}.log` |
| پشتیبان‌ها | `/var/backups/istgahedandan/<تاریخ>/` |

> ⚠️ **روی این سرور سایت‌های دیگری هم هستند** (`9dm`، `bartar-crm`، `bartarjanebi`، `mahamprinter`، `modi`، `price-next`، `music_api`). اسکریپت دیپلوی فقط با `/var/www/istgahedandan` و پروسهٔ pm2 هم‌نام کار دارد. هیچ دستوری نباید سراسری اجرا شود.

nginx این مسیرها را مستقیم از دیسک سرو می‌کند: `/uploads/`، `/assets/`، `/_next/static/`. بقیه به پورت ۳۰۰۴ پروکسی می‌شود با `proxy_set_header Host $host`. سقف آپلود ۶۰ مگابایت.

### CDN — نکتهٔ مهم هنگام تست

چون دامنه پشت CDN است، بعد از دیپلوی ممکن است نسخهٔ کهنه ببینید. برای تست واقعی یا از cache-buster استفاده کنید یا مستقیم سرور را بزنید:

```bash
curl -s "https://istgahedandan.ir/services?cb=$RANDOM" | grep ...
ssh root@185.164.73.224 'curl -s http://127.0.0.1:3004/services'
```

صفحات ISR با `s-maxage=600` کش می‌شوند، پس تغییرات تا حدود ۱۰ دقیقه در لبهٔ CDN دیده می‌شوند.

## اجرای دیپلوی

```bash
./scripts/deploy.sh --dry-run   # نمایش تغییرات بدون اعمال — همیشه اول این
./scripts/deploy.sh             # دیپلوی کامل با تأیید تعاملی
./scripts/deploy.sh --yes       # بدون پرسش
./scripts/deploy.sh --rollback  # بازگردانی به نسخهٔ قبلی
```

برای فعال شدن بررسی هماهنگی migrationها، `SHADOW_DATABASE_URL` را ست کنید (یک دیتابیس خالیِ دورریختنی روی PostgreSQL محلی):

```bash
export SHADOW_DATABASE_URL="postgresql://USER:PASS@localhost:5436/deploy_shadow?schema=public"
```

## اسکریپت چه می‌کند

۸ مرحله با توقف در اولین خطا (`set -euo pipefail`):

1. **بررسی‌های محلی** — `tsc --noEmit` و `npm run build`. اگر کد سالم نباشد دیپلوی شروع نمی‌شود. هماهنگی `prisma/migrations` با `schema.prisma` هم چک می‌شود.
2. **بررسی‌های سرور** — SSH، وجود مسیر و پروسهٔ pm2، طول `JWT_SECRET` (حداقل ۳۲ کاراکتر، وگرنه اپ در زمان اجرا خطا می‌دهد)، فضای دیسک.
3. **پشتیبان‌گیری** — `pg_dump` فشرده، کپی کامل `.next`، و کپی `.env` در `/var/backups/istgahedandan/<تاریخ>/`. پنج نسخهٔ آخر نگه داشته می‌شود.
4. **همگام‌سازی کد** — `rsync --delete`.
5. **نصب** — `npm ci` کامل (شامل devDependencies؛ `next build` به typescript و tailwind نیاز دارد) و `prisma generate`.
6. **migration** — پایین را ببینید.
7. **build روی سرور** و `pm2 reload`.
8. **بررسی سلامت** — تا ۱۵ بار پورت ۳۰۰۴؛ اگر بالا نیاید لاگ خطای pm2 را نشان می‌دهد و دستور بازگردانی را می‌گوید. سپس آدرس عمومی هم چک می‌شود.

### چه چیزهایی هرگز بازنویسی نمی‌شوند

| مسیر | چرا |
|---|---|
| `.env` | رمزهای پروداکشن |
| `public/uploads/` | ~۱۸۶ مگابایت فایل کاربران |
| `node_modules/` | با `npm ci` روی سرور ساخته می‌شود |
| `.next/` | روی سرور build می‌شود |
| `ecosystem.config.json` | **فقط روی سرور است.** بدون این استثنا، `--delete` پاکش می‌کرد و pm2 دیگر نمی‌توانست اپ را بالا بیاورد |
| `.qodo/`, `.claude/`, `.git/` | ابزار محلی |

## migrationها

### پیشینه

تا مرداد ۱۴۰۵ پوشهٔ `prisma/migrations` فقط یک `init` قدیمی داشت و همهٔ تغییرات بعدی با `prisma db push` مستقیم روی دیتابیس رفته بود. یعنی `migrate deploy` روی دیتابیس تازه اسکیمای ناقص می‌ساخت.

با **baseline کردن** حل شد. حالا دو migration وجود دارد:

| migration | محتوا |
|---|---|
| `20260812000000_baseline` | کل اسکیما، همان‌طور که دیتابیس‌های موجود (محلی و پروداکشن) در آن لحظه بودند |
| `20260812010000_appointment_active_slot` | ستون `activeSlot` + ایندکس یکتا برای جلوگیری از رزرو تکراری |

baseline عمداً `activeSlot` را **ندارد** — چون وضعیت دیتابیس‌های موجود را نشان می‌دهد. روی دیتابیس تازه هر دو به ترتیب اجرا می‌شوند و به همان نتیجه می‌رسند.

صحتش با `prisma migrate diff --from-migrations` روی دیتابیس shadow تأیید شد: خروجی خالی، یعنی پوشهٔ migrations دقیقاً `schema.prisma` را بازتولید می‌کند.

### دیتابیسی که baseline نشده

دیتابیس پروداکشن جدول `_prisma_migrations` را داشت ولی خالی بود، در حالی که همهٔ جدول‌های baseline از قبل وجود داشتند. اسکریپت این حالت را تشخیص می‌دهد و پیش از `migrate deploy` باseline را با `migrate resolve --applied` علامت می‌زند. فقط یک‌بار لازم است و دفعات بعد خودبه‌خود رد می‌شود.

### افزودن migration جدید

```bash
export SHADOW_DATABASE_URL="postgresql://…/deploy_shadow?schema=public"
npx prisma migrate dev --name توضیح_کوتاه
```

هرگز روی پروداکشن `db push` نزنید — دقیقاً همان چیزی است که این وضعیت را ساخت.

## بازگردانی

```bash
./scripts/deploy.sh --rollback
```

آخرین پشتیبان `.next` را برمی‌گرداند و pm2 را ری‌استارت می‌کند. **دیتابیس را برنمی‌گرداند** — عمدی است، چون بازگرداندن دیتابیس یعنی از دست رفتن نوبت‌ها و نظرهای ثبت‌شده بعد از دیپلوی. اگر واقعاً لازم شد:

```bash
ssh root@185.164.73.224 \
  "gunzip -c /var/backups/istgahedandan/<تاریخ>/db.sql.gz | sudo -u postgres psql -d istgahedandan_db"
```

## نکات پس از دیپلوی

- **همه یک‌بار logout می‌شوند** — فقط در اولین دیپلوی بعد از افزوده شدن claim نقش به توکن‌ها. توکن‌های قدیمی `role` ندارند و رد می‌شوند.
- صفحهٔ اصلی، `/about`، `/contact` و `/services` ISR با بازهٔ ۱۰ دقیقه هستند.
- **اگر داده‌ای در دیتابیس تغییر کرد و صفحات ISR هنوز نسخهٔ قدیمی را نشان می‌دهند، یک build مجدد لازم است** — این دقیقاً موقع انتقال جدول `Service` پیش آمد: داده وارد شد ولی `/services` همچنان خالی بود، چون HTML‌ـه prerender‑شده در زمان build (که داده‌ای نبود) سرو می‌شد.

## عیب‌یابی

```bash
ssh root@185.164.73.224 'pm2 logs istgahedandan --lines 50'
ssh root@185.164.73.224 'pm2 describe istgahedandan'
ssh root@185.164.73.224 'pm2 restart istgahedandan'
ssh root@185.164.73.224 'systemctl reload nginx'
```

اگر اپ بالا نمی‌آید، اول `JWT_SECRET` را چک کنید — کد جدید در نبود آن یا اگر کوتاه‌تر از ۳۲ کاراکتر باشد عمداً خطا پرتاب می‌کند.

### تلهٔ تست محلی

اگر رفتار محلی با کد شما نمی‌خواند، ببینید پروسهٔ `next start` قدیمی روی پورت ۳۰۰۰ باقی نمانده باشد — یک پروسهٔ جامانده از جلسهٔ قبلی ساعت‌ها نتایج گمراه‌کننده داد:

```bash
ss -ltnp | grep :3000
```

## مدیریت داده

از مرداد ۱۴۰۵ **دیتابیس پروداکشن مرجع رسمی است.** محتوای سایت (مقالات، دندانپزشکان، خدمات، صفحات) از پنل ادمین به‌روز می‌شود، نه با انتقال از لوکال. دیتابیس محلی صرفاً محیط دمو/توسعه است.

آخرین و تنها انتقال داده از لوکال به پروداکشن در ۱۴۰۵/۰۵/۲۱ انجام شد — جزئیات در [`04-changelog.md`](./04-changelog.md).
