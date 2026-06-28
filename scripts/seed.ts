/**
 * Database seeder: imports WordPress data into PostgreSQL
 * Run: npx tsx scripts/seed.ts
 */

import { PrismaClient, DentistStatus, RegistrationStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.join(__dirname, "../../scripts/extracted");

function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

interface DentistData {
  wp_post_id: number;
  slug: string;
  title: string;
  short_desc?: string;
  long_desc?: string;
  address?: string;
  phones: string[];
  social_links?: Record<string, string>;
  map_lat?: number;
  map_lng?: number;
  center_code?: string;
  gallery: string[];
  videos: string[];
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  status: string;
  order: number;
}

interface LocationData {
  wp_post_id: number;
  slug: string;
  title: string;
  short_desc?: string;
  long_desc?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
}

interface ServiceData {
  wp_post_id: number;
  slug: string;
  title: string;
  short_desc?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
}

interface BlogPostData {
  wp_post_id: number;
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  category_wp_term_id?: number;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
}

interface CategoryData {
  wp_term_id: number;
  slug: string;
  name: string;
  parent_wp_id?: number;
}

interface DentistLocationLink {
  dentist_slug: string;
  location_slug: string;
  order: number;
  show: boolean;
}

interface ReviewData {
  wp_comment_id?: number;
  dentist_wp_post_id?: number;
  author_name: string;
  author_email?: string;
  content: string;
  approved: boolean;
  created_at?: string;
}

interface StaticPageData {
  wp_post_id: number;
  slug: string;
  title: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.dentistLocation.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dentistRegistration.deleteMany();
  await prisma.dentist.deleteMany();
  await prisma.location.deleteMany();
  await prisma.service.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.category.deleteMany();
  await prisma.staticPage.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.adminUser.deleteMany();

  // 1. Seed categories
  console.log("Seeding categories...");
  const categoriesData = readJson<CategoryData[]>("categories.json");
  const categoryIdMap = new Map<number, number>(); // wp_term_id → new id

  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        wpTermId: cat.wp_term_id,
      },
    });
    categoryIdMap.set(cat.wp_term_id, created.id);
  }
  console.log(`  ✓ ${categoriesData.length} categories`);

  // 2. Seed dentists
  console.log("Seeding dentists...");
  const dentistsData = readJson<DentistData[]>("dentists.json");
  const dentistIdMap = new Map<string, number>(); // slug → new id
  const dentistWpMap = new Map<number, number>(); // wp_post_id → new id

  let dentistCount = 0;
  for (const d of dentistsData) {
    const created = await prisma.dentist.create({
      data: {
        slug: d.slug,
        title: d.title,
        shortDesc: d.short_desc || null,
        longDesc: d.long_desc || null,
        address: d.address || null,
        phones: d.phones || [],
        socialLinks: d.social_links || undefined,
        workingHours: undefined,
        mapLat: d.map_lat || null,
        mapLng: d.map_lng || null,
        centerCode: d.center_code || null,
        featuredImage: d.featured_image || null,
        gallery: d.gallery || [],
        metaTitle: d.meta_title || null,
        metaDescription: d.meta_description || null,
        status: DentistStatus.PUBLISHED,
        order: d.order || 0,
        wpPostId: d.wp_post_id,
      },
    });
    dentistIdMap.set(d.slug, created.id);
    dentistWpMap.set(d.wp_post_id, created.id);
    dentistCount++;
  }
  console.log(`  ✓ ${dentistCount} dentists`);

  // 3. Seed locations
  console.log("Seeding locations...");
  const locationsData = readJson<LocationData[]>("locations.json");
  const locationIdMap = new Map<string, number>(); // slug → new id
  const locationWpMap = new Map<number, number>(); // wp_post_id → new id

  for (const loc of locationsData) {
    const created = await prisma.location.create({
      data: {
        slug: loc.slug,
        title: loc.title,
        shortDesc: loc.short_desc || null,
        longDesc: loc.long_desc || null,
        metaTitle: loc.meta_title || null,
        metaDescription: loc.meta_description || null,
        wpPostId: loc.wp_post_id,
      },
    });
    locationIdMap.set(loc.slug, created.id);
    locationWpMap.set(loc.wp_post_id, created.id);
  }
  console.log(`  ✓ ${locationsData.length} locations`);

  // 4. Seed dentist-location links
  console.log("Seeding dentist-location links...");
  const linksData = readJson<DentistLocationLink[]>(
    "dentist_location_links.json"
  );
  let linkCount = 0;

  for (const link of linksData) {
    const dentistId = dentistIdMap.get(link.dentist_slug);
    const locationId = locationIdMap.get(link.location_slug);
    if (!dentistId || !locationId) continue;

    try {
      await prisma.dentistLocation.create({
        data: {
          dentistId,
          locationId,
          order: link.order || 0,
          show: link.show !== false,
        },
      });
      linkCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`  ✓ ${linkCount} dentist-location links`);

  // 5. Seed services
  console.log("Seeding services...");
  const servicesData = readJson<ServiceData[]>("services.json");
  const serviceIdMap = new Map<number, number>();

  for (const svc of servicesData) {
    const created = await prisma.service.create({
      data: {
        slug: svc.slug,
        title: svc.title,
        shortDesc: svc.short_desc || null,
        content: svc.content || null,
        featuredImage: svc.featured_image || null,
        metaTitle: svc.meta_title || null,
        metaDescription: svc.meta_description || null,
        wpPostId: svc.wp_post_id,
      },
    });
    serviceIdMap.set(svc.wp_post_id, created.id);
  }
  console.log(`  ✓ ${servicesData.length} services`);

  // 6. Seed blog posts
  console.log("Seeding blog posts...");
  const blogData = readJson<BlogPostData[]>("blog_posts.json");
  let blogCount = 0;

  for (const post of blogData) {
    if (!post.slug) continue;
    const catId = post.category_wp_term_id
      ? categoryIdMap.get(post.category_wp_term_id)
      : undefined;

    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        content: post.content || null,
        excerpt: post.excerpt || null,
        featuredImage: post.featured_image || null,
        categoryId: catId || null,
        metaTitle: post.meta_title || null,
        metaDescription: post.meta_description || null,
        publishedAt: post.published_at ? new Date(post.published_at) : null,
        wpPostId: post.wp_post_id,
      },
    });
    blogCount++;
  }
  console.log(`  ✓ ${blogCount} blog posts`);

  // 7. Seed static pages
  console.log("Seeding static pages...");
  const staticData = readJson<StaticPageData[]>("static_pages.json");
  let staticCount = 0;

  for (const page of staticData) {
    if (!page.slug) continue;
    try {
      await prisma.staticPage.create({
        data: {
          slug: page.slug,
          title: page.title,
          content: page.content || null,
          metaTitle: page.meta_title || null,
          metaDescription: page.meta_description || null,
          wpPostId: page.wp_post_id,
        },
      });
      staticCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`  ✓ ${staticCount} static pages`);

  // 8. Seed reviews
  console.log("Seeding reviews...");
  const reviewsData = readJson<ReviewData[]>("reviews.json");
  let reviewCount = 0;

  for (const r of reviewsData) {
    const dentistId = r.dentist_wp_post_id
      ? dentistWpMap.get(r.dentist_wp_post_id)
      : undefined;

    if (!dentistId) continue;

    try {
      await prisma.review.create({
        data: {
          dentistId,
          authorName: r.author_name || "کاربر",
          authorEmail: r.author_email || null,
          content: r.content,
          approved: r.approved !== false,
          createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          wpCommentId: r.wp_comment_id || null,
        },
      });
      reviewCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`  ✓ ${reviewCount} reviews`);

  // 9. Seed admin user
  console.log("Seeding admin user...");
  const hashedPassword = await bcrypt.hash("admin@istgah1234", 12);
  await prisma.adminUser.create({
    data: {
      email: "admin@istgahedandan.ir",
      password: hashedPassword,
      name: "مدیر سایت",
    },
  });
  console.log("  ✓ Admin user created (admin@istgahedandan.ir / admin@istgah1234)");

  // 10. Seed settings
  console.log("Seeding settings...");
  await prisma.setting.createMany({
    data: [
      { key: "site_name", value: "ایستگاه دندان" },
      { key: "site_description", value: "معرفی بهترین دندانپزشکی‌های ایران" },
      { key: "contact_phone", value: "" },
      { key: "contact_email", value: "" },
      { key: "contact_address", value: "" },
      { key: "social_instagram", value: "" },
      { key: "social_telegram", value: "" },
    ],
  });
  console.log("  ✓ Settings");

  console.log("\n✅ Seed complete!");
  console.log(`
Summary:
  Categories: ${categoriesData.length}
  Dentists: ${dentistCount}
  Locations: ${locationsData.length}
  Dentist-Location links: ${linkCount}
  Services: ${servicesData.length}
  Blog Posts: ${blogCount}
  Static Pages: ${staticCount}
  Reviews: ${reviewCount}
  `);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
