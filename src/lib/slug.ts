import { prisma } from "@/lib/prisma";

/**
 * Public content lives at the site root — `/<slug>` resolves to a Service,
 * Dentist, Location, BlogPost or StaticPage, in that order (see
 * src/app/[slug]/page.tsx). Each table has its own unique index, but nothing
 * stops the same slug appearing in two different tables, and when that happens
 * the lower-priority record silently becomes unreachable.
 *
 * These helpers close that gap at the write sites.
 */

export type SlugOwner = "service" | "dentist" | "location" | "blog" | "static";

const OWNER_LABEL: Record<SlugOwner, string> = {
  service: "خدمت",
  dentist: "دندانپزشکی",
  location: "منطقه",
  blog: "مقاله",
  static: "صفحه",
};

/**
 * Finds what already occupies a slug, ignoring the record being edited.
 * Returns `null` when the slug is free.
 */
export async function findSlugOwner(
  slug: string,
  ignore?: { owner: SlugOwner; id: number },
): Promise<{ owner: SlugOwner; id: number } | null> {
  const skip = (owner: SlugOwner, id: number) =>
    ignore?.owner === owner && ignore.id === id;

  const [service, dentist, location, blog, staticPage] = await Promise.all([
    prisma.service.findUnique({ where: { slug }, select: { id: true } }),
    prisma.dentist.findUnique({ where: { slug }, select: { id: true } }),
    prisma.location.findUnique({ where: { slug }, select: { id: true } }),
    prisma.blogPost.findUnique({ where: { slug }, select: { id: true } }),
    prisma.staticPage.findUnique({ where: { slug }, select: { id: true } }),
  ]);

  if (service && !skip("service", service.id)) return { owner: "service", id: service.id };
  if (dentist && !skip("dentist", dentist.id)) return { owner: "dentist", id: dentist.id };
  if (location && !skip("location", location.id)) return { owner: "location", id: location.id };
  if (blog && !skip("blog", blog.id)) return { owner: "blog", id: blog.id };
  if (staticPage && !skip("static", staticPage.id)) return { owner: "static", id: staticPage.id };
  return null;
}

/**
 * Returns a Persian error message when the slug is taken by another record,
 * or `null` when it is free to use.
 */
export async function slugConflictMessage(
  slug: string,
  ignore?: { owner: SlugOwner; id: number },
): Promise<string | null> {
  const trimmed = slug.trim();
  if (!trimmed) return "نشانی (slug) نمی‌تواند خالی باشد";

  const taken = await findSlugOwner(trimmed, ignore);
  if (!taken) return null;

  return `این نشانی قبلاً برای یک ${OWNER_LABEL[taken.owner]} استفاده شده است. نشانی دیگری انتخاب کنید.`;
}
