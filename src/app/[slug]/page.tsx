import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ServiceSinglePage from "@/components/pages/ServiceSinglePage";
import DentistSinglePage from "@/components/pages/DentistSinglePage";
import LocationPage from "@/components/pages/LocationPage";
import BlogSinglePage from "@/components/pages/BlogSinglePage";
import StaticContentPage from "@/components/pages/StaticContentPage";

interface Props {
  params: Promise<{ slug: string }>;
}

async function resolveSlug(slug: string) {
  const [service, dentist, location, blog, staticPage] = await Promise.all([
    prisma.service.findUnique({ where: { slug } }),
    prisma.dentist.findUnique({ where: { slug } }),
    prisma.location.findUnique({ where: { slug } }),
    prisma.blogPost.findUnique({ where: { slug } }),
    prisma.staticPage.findUnique({ where: { slug } }),
  ]);
  if (service) return { type: "service" as const, data: service };
  if (dentist) return { type: "dentist" as const, data: dentist };
  if (location) return { type: "location" as const, data: location };
  if (blog) return { type: "blog" as const, data: blog };
  if (staticPage) return { type: "static" as const, data: staticPage };
  return null;
}

import { SITE_URL, SITE_NAME, absoluteUrl, canonicalUrl } from "@/lib/seo";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const result = await resolveSlug(slug);
  if (!result) return { title: "صفحه یافت نشد" };

  const d = result.data as {
    metaTitle?: string | null; title?: string; metaDescription?: string | null;
    shortDesc?: string | null; featuredImage?: string | null; publishedAt?: Date | null;
    authorName?: string | null;
  };

  const rawTitle = d.metaTitle || d.title || SITE_NAME;
  // Most metaTitle values were imported from WordPress with the brand already
  // appended ("… | ایستگاه دندان"). The root layout adds the same suffix through
  // its title template, which produced "… | ایستگاه دندان | ایستگاه دندان" on
  // several hundred pages. `absolute` opts this page out of the template.
  const title = rawTitle.includes(SITE_NAME) ? { absolute: rawTitle } : rawTitle;
  // og:title and twitter:title take a plain string, never the template object.
  const plainTitle = rawTitle;
  const description = d.metaDescription || d.shortDesc || undefined;
  const image = absoluteUrl(d.featuredImage) || `${SITE_URL}/assets/og-default.jpg`;
  const canonical = canonicalUrl(slug);

  const ogType: "article" | "website" = result.type === "blog" ? "article" : "website";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: plainTitle,
      description,
      url: canonical,
      type: ogType,
      images: [{ url: image, width: 1200, height: 630, alt: plainTitle }],
      locale: "fa_IR",
      siteName: "ایستگاه دندان",
      ...(result.type === "blog" && d.publishedAt ? { publishedTime: d.publishedAt.toISOString() } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle,
      description,
      images: [image],
    },
  };
}

export default async function SlugPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const result = await resolveSlug(slug);
  if (!result) notFound();

  if (result.type === "service") return <ServiceSinglePage slug={slug} />;
  if (result.type === "dentist") return <DentistSinglePage slug={slug} />;
  if (result.type === "location") return <LocationPage slug={slug} />;
  if (result.type === "blog") return <BlogSinglePage slug={slug} />;
  if (result.type === "static") return <StaticContentPage slug={slug} />;

  notFound();
}
