# ایستگاه دندان

دایرکتوری و مرجع آنلاین دندانپزشکان و کلینیک‌های دندانپزشکی ایران — [istgahedandan.ir](https://istgahedandan.ir)

ساخته‌شده با Next.js 16 (App Router)، React 19، Prisma 7 و PostgreSQL. کاملاً فارسی و RTL.

## راه‌اندازی

```bash
cp .env.example .env             # DATABASE_URL و JWT_SECRET را پر کنید
docker compose up -d             # PostgreSQL روی پورت 5436
npx prisma migrate deploy
npx tsx scripts/seed.ts          # داده اولیه
npx tsx scripts/create-admin.ts  # ساخت کاربر ادمین
npm run dev
```

سایت روی <http://localhost:3000> بالا می‌آید.

## دستورات

| دستور | کار |
|---|---|
| `npm run dev` | سرور توسعه |
| `npm run build` | build پروداکشن |
| `npm run start` | اجرای build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | بررسی تایپ |

## مستندات

راهنمای کامل پروژه در پوشهٔ [`docs/`](./docs/) است:

- [`docs/01-overview.md`](./docs/01-overview.md) — پروژه چیست، استک، راه‌اندازی، قواعد کدنویسی
- [`docs/02-architecture.md`](./docs/02-architecture.md) — مسیریابی، مدل داده، احراز هویت، جریان رزرو نوبت، فهرست API
- [`docs/03-issues.md`](./docs/03-issues.md) — ایرادات شناخته‌شده و بدهی فنی
- [`docs/04-changelog.md`](./docs/04-changelog.md) — تاریخچهٔ کارها
- [`docs/05-deploy.md`](./docs/05-deploy.md) — راهنمای دیپلوی

> ⚠️ این نسخهٔ Next.js با نسخه‌های قدیمی‌تر تفاوت‌های شکننده دارد. پیش از نوشتن کد، راهنمای مربوطه را از `node_modules/next/dist/docs/` بخوانید.
