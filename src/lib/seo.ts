export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://istgahedandan.ir";
export const SITE_NAME = "ایستگاه دندان";
export const SITE_LOGO = `${SITE_URL}/assets/logo.webp`;

/**
 * Uploaded images are stored as site-relative paths (`/uploads/…`), but
 * Schema.org URL properties must be absolute — a relative value makes the whole
 * image property unusable to consumers.
 */
/**
 * The canonical address of a page. The site runs with `trailingSlash: true`
 * (see next.config.ts), so canonical tags, sitemap entries and schema `@id`
 * values must all carry the slash — otherwise they point at URLs that merely
 * redirect, which splits the signals Google has already accumulated.
 *
 * `canonicalUrl()` → the home page; `canonicalUrl("slug")` → `/slug/`.
 */
export function canonicalUrl(path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${SITE_URL}/${clean}/` : `${SITE_URL}/`;
}

export function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ─── Dentist / LocalBusiness ─────────────────────────────────────────────────
interface DentistSchemaInput {
  slug: string;
  title: string;
  shortDesc?: string | null;
  address?: string | null;
  phones?: string[];
  featuredImage?: string | null;
  mapLat?: number | null;
  mapLng?: number | null;
  workingHours?: string | null;
  avgRating?: number | null;
  reviewCount?: number;
  reviews?: { author: string; rating: number | null; body: string; date: string }[];
  faqs?: { question: string; answer: string }[];
  services?: string[];
  locationTitle?: string;
}

export function dentistSchema(d: DentistSchemaInput) {
  const url = canonicalUrl(d.slug);
  const schemas: object[] = [];

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Dentist"],
    "@id": url,
    name: d.title,
    url,
    description: d.shortDesc ?? undefined,
    image: absoluteUrl(d.featuredImage) ?? SITE_LOGO,
    logo: SITE_LOGO,
    hasMap: `${SITE_URL}/map`,
    priceRange: "$$",
    currenciesAccepted: "IRR",
    paymentAccepted: "Cash, Card",
    // The city this practice actually serves. "Iran" as a whole dilutes the
    // local signal for a single clinic; fall back to it only when unknown.
    areaServed: d.locationTitle
      ? { "@type": "City", name: d.locationTitle }
      : { "@type": "Country", name: "Iran" },
    inLanguage: "fa-IR",
  };

  if (d.phones?.length) {
    localBusiness.telephone = d.phones[0];
    if (d.phones.length > 1) localBusiness.additionalProperty = d.phones.slice(1).map(p => ({ "@type": "PropertyValue", name: "telephone", value: p }));
  }

  if (d.address) {
    localBusiness.address = {
      "@type": "PostalAddress",
      streetAddress: d.address,
      addressCountry: "IR",
      ...(d.locationTitle ? { addressLocality: d.locationTitle } : {}),
    };
  }

  if (d.mapLat && d.mapLng) {
    localBusiness.geo = { "@type": "GeoCoordinates", latitude: d.mapLat, longitude: d.mapLng };
    localBusiness.hasMap = `https://maps.google.com/maps?q=${d.mapLat},${d.mapLng}`;
  }

  if (d.workingHours) {
    localBusiness.openingHoursSpecification = { "@type": "OpeningHoursSpecification", description: d.workingHours };
  }

  if (d.avgRating && d.reviewCount && d.reviewCount > 0) {
    localBusiness.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: d.avgRating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      reviewCount: String(d.reviewCount),
    };
  }

  if (d.reviews?.length) {
    localBusiness.review = d.reviews.slice(0, 5).map(r => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: r.rating ? { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" } : undefined,
      reviewBody: r.body,
      datePublished: r.date,
      itemReviewed: { "@type": "Dentist", name: d.title },
    }));
  }

  if (d.services?.length) {
    localBusiness.knowsAbout = d.services;
    localBusiness.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "خدمات دندانپزشکی",
      itemListElement: d.services.map(s => ({
        "@type": "Offer",
        itemOffered: { "@type": "MedicalProcedure", name: s },
      })),
    };
  }

  schemas.push(localBusiness);

  if (d.faqs?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: d.faqs.map(f => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return schemas;
}

// ─── Service / MedicalProcedure ───────────────────────────────────────────────
interface ServiceSchemaInput {
  slug: string;
  title: string;
  shortDesc?: string | null;
  featuredImage?: string | null;
  faqs?: { question: string; answer: string }[];
}

export function serviceSchema(s: ServiceSchemaInput) {
  const url = canonicalUrl(s.slug);
  const schemas: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      "@id": url,
      name: s.title,
      url,
      description: s.shortDesc ?? undefined,
      image: absoluteUrl(s.featuredImage) ?? SITE_LOGO,
      inLanguage: "fa-IR",
      procedureType: "http://snomed.info/id/234762008",
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
  ];

  if (s.faqs?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faqs.map(f => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return schemas;
}

// ─── Location / CollectionPage ────────────────────────────────────────────────
interface LocationSchemaInput {
  slug: string;
  title: string;
  shortDesc?: string | null;
  parentTitle?: string | null;
  dentists?: {
    slug: string;
    title: string;
    address?: string | null;
    featuredImage?: string | null;
    mapLat?: number | null;
    mapLng?: number | null;
  }[];
  faqs?: { question: string; answer: string }[];
}

/**
 * Location pages ("دندانپزشکی در شمال تهران") are the site's local-intent landing
 * pages, so they carry the listing as a machine-readable ItemList of the
 * practices in that area. Each entry reuses the dentist's canonical `@id`, which
 * ties it back to the full LocalBusiness node on that dentist's own page rather
 * than declaring a competing copy of it.
 */
export function locationSchema(loc: LocationSchemaInput) {
  const url = canonicalUrl(loc.slug);
  const schemas: object[] = [];

  const page: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: loc.title,
    url,
    description: loc.shortDesc ?? undefined,
    inLanguage: "fa-IR",
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
    about: {
      "@type": "Place",
      name: loc.title,
      ...(loc.parentTitle
        ? { containedInPlace: { "@type": "Place", name: loc.parentTitle } }
        : {}),
    },
  };

  if (loc.dentists?.length) {
    page.mainEntity = {
      "@type": "ItemList",
      name: `دندانپزشکی‌های ${loc.title}`,
      numberOfItems: loc.dentists.length,
      itemListElement: loc.dentists.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": ["LocalBusiness", "Dentist"],
          "@id": canonicalUrl(d.slug),
          name: d.title,
          url: canonicalUrl(d.slug),
          ...(absoluteUrl(d.featuredImage) ? { image: absoluteUrl(d.featuredImage) } : {}),
          ...(d.address
            ? {
                address: {
                  "@type": "PostalAddress",
                  streetAddress: d.address,
                  addressLocality: loc.title,
                  addressCountry: "IR",
                },
              }
            : {}),
          ...(d.mapLat && d.mapLng
            ? { geo: { "@type": "GeoCoordinates", latitude: d.mapLat, longitude: d.mapLng } }
            : {}),
        },
      })),
    };
  }

  schemas.push(page);

  if (loc.faqs?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: loc.faqs.map(f => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return schemas;
}

// ─── Article / BlogPosting ────────────────────────────────────────────────────
interface ArticleSchemaInput {
  slug: string;
  title: string;
  shortDesc?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string | null;
  categoryName?: string | null;
}

export function articleSchema(a: ArticleSchemaInput) {
  const url = canonicalUrl(a.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: a.title,
    description: a.shortDesc ?? undefined,
    url,
    image: absoluteUrl(a.featuredImage) ?? SITE_LOGO,
    datePublished: a.publishedAt?.toISOString() ?? undefined,
    dateModified: (a.updatedAt ?? a.publishedAt)?.toISOString() ?? undefined,
    inLanguage: "fa-IR",
    author: {
      "@type": "Person",
      name: a.authorName || "تحریریه ایستگاه دندان",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(a.categoryName ? { articleSection: a.categoryName } : {}),
  };
}

// ─── WebSite + Organization (home) ───────────────────────────────────────────
export function websiteSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "fa-IR",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: SITE_LOGO, width: 200, height: 200 },
      foundingDate: "2021",
      description: "پلتفرم جستجو و معرفی دندانپزشکان سراسر ایران",
      areaServed: { "@type": "Country", name: "Iran" },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+989916352600",
        contactType: "customer support",
        availableLanguage: "fa",
      },
    },
  ];
}

// ─── BreadcrumbList ───────────────────────────────────────────────────────────
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
