# معماری

## ساختار پوشه‌ها

```
src/
├── app/
│   ├── layout.tsx            ریشه: lang=fa dir=rtl، فونت وزیرمتن، متادیتای پایه
│   ├── page.tsx              صفحهٔ اصلی
│   ├── [slug]/page.tsx       ★ روتر دینامیک — قلب مسیریابی عمومی (پایین را ببینید)
│   ├── admin/                پنل ادمین (پشت proxy)
│   ├── dentist/              ورود/ثبت‌نام + پنل دندانپزشک
│   ├── api/                  همهٔ Route Handlerها
│   ├── sitemap.ts, robots.ts
│   └── (صفحات ثابت: about, contact, services, mag, map, search,
│        dentists-list, dentists-page, reserve, not-found)
├── components/
│   ├── Header / Footer / MobileNav / LiveSearch / DentistPanelLink …
│   ├── pages/                کامپوننت‌های تمام‌صفحه که [slug] به آن‌ها delegate می‌کند
│   ├── admin/                ابزارهای پنل ادمین (RichEditor, MapPicker, …)
│   └── dentist/              ابزارهای پنل دندانپزشک
├── lib/
│   ├── prisma.ts             singleton کلاینت Prisma
│   ├── jwt-secret.ts         کلید امضا (بدون fallback) + ثابت‌های نقش
│   ├── auth.ts               JWT ادمین  (کوکی admin_token)
│   ├── dentist-auth.ts       JWT دندانپزشک (کوکی dentist_token)
│   ├── use-dentist-session.ts هوک کلاینتیِ سشن دندانپزشک
│   ├── appointments.ts       همگام‌سازی activeSlot با وضعیت نوبت
│   ├── rate-limit.ts         محدودکنندهٔ درخواست برای endpointهای عمومی
│   ├── slug.ts               چک یکتایی اسلاگ بین پنج جدول
│   ├── seo.ts                JSON-LD، canonicalUrl، متن پیش‌فرض صفحات دندانپزشک، نرمال‌سازی slug قدیمی
│   ├── dentist-facts.ts      منطقهٔ اصلی، امتیاز و «دندانپزشکی‌های نزدیک» یک مطب
│   ├── indexnow.ts           ping به Bing/Yandex هنگام ذخیرهٔ محتوا
│   └── utils.ts              toJalali, toPersian, gradientFromId, …
└── proxy.ts                  جایگزین middleware در Next 16
```

## مسیریابی عمومی — الگوی `[slug]`

این مهم‌ترین نکتهٔ معماری سایت است. برای حفظ URLهای وردپرس، **همهٔ محتوای عمومی روی ریشه است، نه زیرمسیر**:

```
/دندانپزشکی-فلان     → یک Dentist
/ایمپلنت              → یک Service
/تهران-ونک            → یک Location
/عنوان-مقاله          → یک BlogPost
/قوانین-و-مقررات      → یک StaticPage
```

`src/app/[slug]/page.tsx` این را با تابع `resolveSlug()` حل می‌کند: **پنج کوئری موازی** روی جدول‌های `service`، `dentist`، `location`، `blogPost`، `staticPage` می‌زند و اولین تطبیق را برمی‌گرداند. اولویت به همین ترتیب است. بعد به کامپوننت مناسب در `src/components/pages/` واگذار می‌کند:

| نوع | کامپوننت |
|---|---|
| service | `ServiceSinglePage.tsx` |
| dentist | `DentistSinglePage.tsx` |
| location | `LocationPage.tsx` |
| blog | `BlogSinglePage.tsx` |
| static | `StaticContentPage.tsx` |

پیامد مهم: **اسلاگ‌ها در کل این پنج جدول باید یکتا باشند** وگرنه یکی دیگری را سایه می‌اندازد. دیتابیس این را تضمین نمی‌کند، ولی همهٔ نقاط نوشتن اسلاگ در پنل ادمین از `slugConflictMessage()` در `src/lib/slug.ts` عبور می‌کنند و در تعارض ۴۰۹ برمی‌گردانند.

`generateMetadata` در همان فایل عنوان/توضیحات/canonical/OG را از رکورد پیدا شده می‌سازد.

### rewriteهای فارسی

Next 16 دایرکتوری‌های با نام یونیکد را قابل‌اعتماد match نمی‌کند، بنابراین دو مسیر فارسی در `next.config.ts` دستی rewrite شده‌اند:

```
/جستجو        → /search
/دندانپزشکان  → /dentists-page
```

## مدل داده (Prisma)

فایل: `prisma/schema.prisma`. دو migration در `prisma/migrations/`: یک baseline از وضعیت دیتابیس‌های موجود، و یکی برای `Appointment.activeSlot`. پیشینه و روش کار در [`05-deploy.md`](./05-deploy.md).

### محتوا

- **`Dentist`** — موجودیت اصلی. `slug`, `title`, توضیحات، `address`, `phones String[]`, شبکه‌های اجتماعی، `mapLat/mapLng`, `featuredImage`, `gallery String[]`, متای SEO, `status` (`PUBLISHED` / `HIDDEN` / `PENDING`), `order`.
  روابط: `locations`, `services`, `reviews`, `faqs`, `stories`, `dentistVideos`, `schedules`, `appointments`, و `user` (یک `DentistUser`).
- **`Location`** — درخت سلسله‌مراتبی (`parentId` → `LocationHierarchy`): استان → شهر → منطقه.
- **`DentistLocation`** — جدول واسط چند‌به‌چند با `order` و `show` (کنترل نمایش دندانپزشک در صفحهٔ آن منطقه). `@@unique([dentistId, locationId])`.
- **`Service`** — خدمات (ایمپلنت، ارتودنسی…) با `bgGradient` و `iconSvgPath` برای ظاهر کارت‌ها و `infoItems Json`.
- **`DentistService`** — واسط چند‌به‌چند.
- **`BlogPost`** + **`Category`** (درخت) — مقالات. `authorId` به `DentistUser` وصل می‌شود، پس دندانپزشک هم می‌تواند نویسنده باشد. `externalLinksApproved` برای کنترل لینک خروجی.
- **`StaticPage`** — صفحات ثابت (قوانین، حریم خصوصی…).
- **`Review`** — نظرات با `approved` (پیش‌فرض `false`) و پاسخ تودرتو از طریق `parentId` → `ReviewReplies`. می‌تواند به `Dentist` یا `Service` وصل باشد.
- **`FAQ`** — می‌تواند به dentist یا location یا service وصل باشد.
- **`Setting`** — key/value ساده. کلیدهای واقعی در کد: `site_title`, `site_description`, `contact_phone`, `contact_email`, `contact_address`, `social_instagram`, `social_telegram`.

### کاربران

- **`AdminUser`** — email / password (bcrypt) / name.
- **`DentistUser`** — حساب ورود دندانپزشک. `status`: `PENDING` (پیش‌فرض بعد از ثبت‌نام) / `ACTIVE` / `SUSPENDED`.
  `dentistId` یکتا و **nullable** است: کاربر ثبت‌نام می‌کند، بعد **ادمین** او را به یک رکورد `Dentist` وصل می‌کند. تا آن لحظه کاربر وارد پنل می‌شود ولی پروفایلی برای ویرایش ندارد (سایدبار پیام هشدار نشان می‌دهد).
- **`DentistRegistration`** — فرم «مطبم را ثبت کن» جدا از حساب کاربری، با `status` (`PENDING`/`APPROVED`/`REJECTED`).

### نوبت‌دهی

- **`DentistSchedule`** — `@@unique([dentistId, date])`. `date` یک **رشتهٔ `YYYY-MM-DD` میلادی** است (نه `DateTime`). `slots` یک `Json` است که آرایهٔ رشته‌های ساعت نگه می‌دارد: `["09:00","09:30"]`. `slotDuration` پیش‌فرض ۳۰ دقیقه.
- **`Appointment`** — `date` + `time` رشته، `patientName`, `patientPhone`, `notes`, `status` (`CONFIRMED`/`CANCELLED`), `trackCode` یکتا (فرمت `DN` + ۶ کاراکتر)، `isRead` برای نشان دادن نوبت جدید در پنل.
  همچنین **`activeSlot`**: مقدارش `"YYYY-MM-DD HH:mm"` است تا وقتی نوبت `CONFIRMED` است و `NULL` می‌شود وقتی لغو شد. به‌همراه `@@unique([dentistId, activeSlot])` جلوی رزرو همزمان یک اسلات را می‌گیرد — چون Postgres مقادیر `NULL` را متمایز می‌شمارد، ردیف‌های لغوشده به‌عنوان تاریخچه می‌مانند ولی اسلات را قفل نمی‌کنند. هر کدی که وضعیت نوبت را عوض می‌کند باید از `src/lib/appointments.ts` استفاده کند تا این ستون هم‌قدم بماند.

> تصمیم آگاهانه: تاریخ‌ها رشته‌اند تا مسئلهٔ timezone در تبدیل شمسی↔میلادی پیش نیاید. همه‌جا با `startsWith` / `gte`+`lte` روی رشته کوئری زده می‌شود.

## احراز هویت

دو سیستم **کاملاً جدا** ولی با **همان `JWT_SECRET`**:

| | ادمین | دندانپزشک |
|---|---|---|
| کتابخانه | `jose` (HS256, 7 روز) | همان |
| فایل | `src/lib/auth.ts` | `src/lib/dentist-auth.ts` |
| کوکی | `admin_token` | `dentist_token` |
| payload | `{ id, email, name, role: "admin" }` | `{ id, email, name, dentistId, role: "dentist" }` |
| گارد مسیر | `src/proxy.ts` (matcher `/admin/:path*`) | لایوت `src/app/dentist/(panel)/layout.tsx` با `redirect()` |
| گارد API | هر route دستی `getAdminSession()` صدا می‌زند | هر route دستی `getDentistSession()` صدا می‌زند |

بررسی شد: همهٔ routeهای `/api/admin/*` به‌جز `login` و `logout` سشن را چک می‌کنند؛ همین‌طور همهٔ `/api/dentist/*` به‌جز `login`، `logout` و `register`.

### ساختار پنل دندانپزشک

پنل داخل **route group** `src/app/dentist/(panel)/` است. پرانتز یعنی `(panel)` در URL ظاهر نمی‌شود؛ فقط باعث می‌شود همهٔ صفحات پنل یک `layout.tsx` مشترک (چک سشن + سایدبار) بگیرند، در حالی که `/dentist/login` و `/dentist/register` بیرون گروه‌اند و آن لایوت را نمی‌گیرند:

```
/dentist/login        ← بیرون گروه؛ Server Component که کاربر واردشده را به داشبورد می‌فرستد
/dentist/register     ← بیرون گروه، بدون گارد
/dentist/panel        ← صفحهٔ سروری، تصمیم‌گیر مقصد
/dentist/dashboard    ┐
/dentist/profile      │
/dentist/appointments ├─ داخل (panel) — گارد + سایدبار
/dentist/schedule     │
/dentist/stories      │
/dentist/articles     ┘
```

لینک «ورود دندانپزشکان» در هدر و فوتر (`DentistPanelLink`) مقصدش را سمت کلاینت از `/api/dentist/me` حل می‌کند: تا رسیدن پاسخ `/dentist/login` و پس از آن `/dentist/dashboard`. چون `/dentist/login` خودش کاربر واردشده را به داشبورد می‌فرستد، حالت میانی هم درست عمل می‌کند.

> ⚠️ **تلهٔ ریدایرکت پشت nginx.** در یک Route Handler، مقدار `req.url` مبدأ داخلی (`127.0.0.1:3004`) است، پس `NextResponse.redirect(new URL(target, req.url))` هدر `Location` مطلق با میزبان اشتباه می‌سازد. `redirect()` از `next/navigation` هم داخل Route Handler همین کار را می‌کند. فقط **`redirect()` در رندر صفحه/layout** و **`NextResponse.redirect` داخل `proxy.ts`** هدر نسبی می‌دهند که مرورگر نسبت به آدرس عمومی حل می‌کند. جزئیات در [`03-issues.md#۲۳`](./03-issues.md).

## جریان رزرو نوبت

```
دندانپزشک: /dentist/schedule
    ScheduleManager → POST /api/dentist/schedule
    برای هر روز اسلات‌های آزاد را می‌سازد (DentistSchedule)
        ↓
بیمار: /reserve  (ReservePage.tsx — یک کامپوننت کلاینتی سه‌مرحله‌ای)
    ۱ انتخاب روز   GET /api/reserve/slots?dentistId=&from=&to=   ← بازهٔ ماه شمسی
    ۲ انتخاب ساعت  GET /api/reserve/slots?dentistId=&date=
    ۳ تأیید        POST /api/reserve/book  → { trackCode }
        ↓
لغو توسط بیمار: DELETE /api/reserve/cancel/[trackCode]
دیدن توسط دندانپزشک: /dentist/appointments  (AppointmentsManager)
```

نکات:
- تقویم شمسی است ولی `date` ذخیره‌شده میلادی است؛ تبدیل با `jalaali-js` سمت کلاینت انجام می‌شود. چون یک ماه شمسی روی دو ماه میلادی می‌افتد، API پارامتر `from`+`to` می‌گیرد (پارامتر قدیمی `month` هنوز پشتیبانی می‌شود).
- `/api/reserve/slots` برای هر اسلات `{ time, booked }` برمی‌گرداند؛ اسلات‌های رزروشده حذف نمی‌شوند، فقط علامت می‌خورند.
- `POST /api/reserve/book` به ایندکس یکتای `activeSlot` تکیه می‌کند نه به چک قبل از درج؛ خطای `P2002` به ۴۰۹ «این ساعت قبلاً رزرو شده است» ترجمه می‌شود. ورودی‌ها اعتبارسنجی می‌شوند (فرمت تاریخ/ساعت، موبایل ایرانی با تبدیل ارقام فارسی) و rate limit دارد.
- ورود به `/reserve` می‌تواند با `?dentistId=` یا `?slug=` باشد (لینک از صفحهٔ پروفایل دندانپزشک)، وگرنه یک جستجوی دندانپزشک نشان می‌دهد.

## فهرست API

### عمومی
| مسیر | کار |
|---|---|
| `GET /api/search` | جستجوی سراسری (استفاده در `LiveSearch`) |
| `GET /api/dentists` | لیست دندانپزشکان (اسکرول بی‌نهایت) |
| `GET /api/map/dentists` | نقطه‌های نقشه — `revalidate = 60` |
| `GET /api/services/[slug]/locations` | مناطق ارائه‌دهندهٔ یک خدمت |
| `POST /api/reviews` | ثبت نظر — همیشه `approved: false` |
| `GET /api/reserve/slots` · `POST /api/reserve/book` · `DELETE /api/reserve/cancel/[trackCode]` · `GET /api/reserve/dentist/[id]` · `GET /api/reserve/dentist-by-slug/[slug]` · `GET /api/reserve/search-dentist` | جریان رزرو |

### دندانپزشک (کوکی `dentist_token`)
`login` · `logout` · `register` · `me` · `profile` · `schedule` · `appointments` (+`[id]`) · `stories` (+`[id]`) · `videos` · `gallery` · `articles` (+`[id]`) · `upload`

`PUT /api/dentist/profile` عمداً فیلدهای `slug`, `status`, `order`, `wpPostId`, `id` را از body حذف می‌کند تا دندانپزشک نتواند آن‌ها را دستکاری کند.

### ادمین (کوکی `admin_token`)
`login` · `logout` · `dentists/[id]` (+`gallery`, `stories`, `videos`) · `dentists-list` · `dentist-users` (+`[id]`) · `locations` (+`[id]`, `[id]/dentists`) · `services` (+`[id]`) · `blog` (+`[id]`, `categories`) · `reviews/[id]` · `settings` · `upload`

## رندرینگ و کش

بیشتر مسیرها سرور-رندر به‌ازای درخواست‌اند (`ƒ` در خروجی build). چهار صفحه ISR هستند چون هم دیتابیس می‌خوانند و هم فوتر دیتابیس‌خوان دارند:

| صفحه | بازه |
|---|---|
| `/`, `/about`, `/contact`, `/services` | `revalidate = 600` |

بدون این، `next build` آن‌ها را یک‌بار prerender می‌کرد و محتوا تا دیپلوی بعدی فریز می‌ماند.

دو پیامد عملی:

- تغییرات محتوا تا ۱۰ دقیقه روی این صفحات دیده نمی‌شوند. اگر داده‌ای مستقیماً در دیتابیس عوض شد و می‌خواهید فوراً دیده شود، یک build مجدد لازم است.
- دامنه پشت CDN است، پس برای تست واقعی از cache-buster استفاده کنید — [`05-deploy.md`](./05-deploy.md).

`Footer` یک Server Component است که مستقیم Prisma می‌خواند (۶ خدمت، ۵ دندانپزشک آخر، تنظیمات تماس)، و در همهٔ صفحات عمومی حضور دارد؛ به همین دلیل رفتار کش هر صفحه به آن هم وابسته است.

## SEO

`src/lib/seo.ts` سازندهٔ JSON-LD است و با کامپوننت `JsonLd` رندر می‌شود:

| تابع | خروجی | استفاده در |
|---|---|---|
| `dentistSchema` | `["LocalBusiness","Dentist"]` + `AggregateRating` + `Review` + `OfferCatalog` + `FAQPage` | صفحهٔ دندانپزشک |
| `locationSchema` | `CollectionPage` + `ItemList` مطب‌های منطقه + `Place` + `FAQPage` | صفحهٔ منطقه |
| `serviceSchema` | `MedicalProcedure` + `FAQPage` | صفحهٔ خدمت |
| `articleSchema` | `Article` | صفحهٔ مقاله |
| `websiteSchema` | `WebSite` + `Organization` | صفحهٔ اصلی |
| `breadcrumbSchema` | `BreadcrumbList` | همه‌جا |

قواعدی که باید رعایت شوند:

- **آدرس تصویر باید مطلق باشد.** تصاویر آپلودی به‌صورت `/uploads/…` ذخیره می‌شوند ولی Schema.org آدرس مطلق می‌خواهد. همیشه از `absoluteUrl()` استفاده کنید.
- **`inLanguage: "fa-IR"`** — نه `@language` که جزو واژگان Schema.org نیست.
- **`areaServed` باید شهر واقعی باشد**، نه «کل ایران»؛ کشور فقط fallback است.
- `locationSchema` برای هر مطب همان `@id` کانونیکال صفحهٔ خودش را می‌گذارد تا نسخهٔ رقیب `LocalBusiness` تعریف نکند.
- `app/sitemap.ts` نقشهٔ سایت را از دیتابیس می‌سازد (دندانپزشکان `PUBLISHED`، خدمات، مقالات، تا ۲۰۰ منطقه). **ISR یک‌ساعته** (`revalidate = 3600`) — بدون آن در زمان build منجمد می‌شد. آدرس‌ها با `encodeURI(canonicalUrl(…))` تا با تگ canonical یکی باشند؛ slugهای دارای `/` حذف می‌شوند.
- `app/robots.ts` هم هست.
- متادیتای هر صفحه از `metaTitle` / `metaDescription` رکورد می‌آید و اگر خالی بود از `title` / `shortDesc`. **استثنا — دندانپزشک:** وقتی metaTitle فقط «نام | برند» است یا توضیحات همان متن قالبی وردپرس است (`isBoilerplateDesc`)، عنوان، توضیحات و باکس «درباره» از داده‌های خود مطب ساخته می‌شوند (`dentistTitle` / `dentistMetaDescription` / `dentistSummary`). متنی که کسی واقعاً نوشته همیشه برنده است.
- **لینک داخلی بخشی از قرارداد SEO است:** صفحهٔ منطقه بالای ۱۲ مطب یک فهرست لینک سادهٔ کامل رندر می‌کند (گرید کارت‌ها با اسکرول بی‌نهایت است و خزنده بقیه را نمی‌بیند)، و صفحهٔ دندانپزشک ۸ مطب نزدیک را لینک می‌دهد. هر فهرستی که بعداً با JS بارگذاری شود باید یک معادل HTML قابل‌خزش داشته باشد. بررسی: `scripts/seo-orphans.py`.
- **آدرس‌های قدیمی وردپرس:** slugهای غلط‌تایپی در `[slug]/page.tsx` با `normalizeLegacySlug()` به 308 تبدیل می‌شوند؛ آرشیوها (`/blog`، `/author`، `/feed`، `/rahmani`) در `redirects()` در `next.config.ts`.

## آپلود فایل

آپلودها روی فایل‌سیستم در `public/uploads/` می‌نشینند (`/api/admin/upload` و `/api/dentist/upload`). در `next.config.ts` بهینه‌سازی تصویر با `unoptimized: true` خاموش است — نه از سر سهل‌انگاری: CPU سرور برای sharp کافی نیست ([`03-issues.md#۱۲`](./03-issues.md)).
