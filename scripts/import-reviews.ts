import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const adapter = new PrismaPg({ connectionString: "postgresql://istgah:istgah_pass_2024@localhost:5436/istgahedandan" });
const prisma = new PrismaClient({ adapter });

interface WpReview {
  wp_comment_id?: number;
  dentist_wp_post_id?: number;
  author_name: string;
  author_email?: string;
  content: string;
  approved: boolean;
  created_at?: string;
}

async function main() {
  const reviewsPath = path.resolve(__dirname, "../../scripts/extracted/reviews.json");
  const raw = fs.readFileSync(reviewsPath, "utf-8");
  const reviews: WpReview[] = JSON.parse(raw);

  // Build wp_post_id → dentist.id map
  const dentists = await prisma.dentist.findMany({ select: { id: true, wpPostId: true } });
  const wpMap = new Map<number, number>();
  for (const d of dentists) {
    if (d.wpPostId) wpMap.set(d.wpPostId, d.id);
  }

  let imported = 0;
  let skipped = 0;

  for (const r of reviews) {
    if (!r.approved) { skipped++; continue; }
    const dentistId = r.dentist_wp_post_id ? wpMap.get(r.dentist_wp_post_id) : undefined;
    if (!dentistId) { skipped++; continue; }

    try {
      if (r.wp_comment_id) {
        await prisma.review.upsert({
          where: { wpCommentId: r.wp_comment_id },
          create: {
            dentistId,
            authorName: r.author_name?.trim() || "کاربر",
            authorEmail: r.author_email?.trim() || null,
            content: r.content.replace(/\r\n/g, "\n").trim(),
            approved: true,
            createdAt: r.created_at ? new Date(r.created_at) : new Date(),
            wpCommentId: r.wp_comment_id,
          },
          update: {},
        });
      } else {
        await prisma.review.create({
          data: {
            dentistId,
            authorName: r.author_name?.trim() || "کاربر",
            authorEmail: r.author_email?.trim() || null,
            content: r.content.replace(/\r\n/g, "\n").trim(),
            approved: true,
            createdAt: r.created_at ? new Date(r.created_at) : new Date(),
          },
        });
      }
      imported++;
    } catch {
      skipped++;
    }
  }

  console.log(`✓ Imported: ${imported} | Skipped: ${skipped}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
