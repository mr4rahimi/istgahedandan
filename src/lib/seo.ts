export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://istgahedandan.ir";
export const SITE_NAME = "ایستگاه دندان";
export const SITE_LOGO = `${SITE_URL}/assets/logo.webp`;

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
  const url = `${SITE_URL}/${d.slug}`;
  const schemas: object[] = [];

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Dentist"],
    "@id": url,
    name: d.title,
    url,
    description: d.shortDesc ?? undefined,
    image: d.featuredImage ?? SITE_LOGO,
    logo: SITE_LOGO,
    hasMap: `${SITE_URL}/map`,
    priceRange: "$$",
    currenciesAccepted: "IRR",
    paymentAccepted: "Cash, Card",
    areaServed: { "@type": "Country", name: "Iran" },
    "@language": "fa",
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
  const url = `${SITE_URL}/${s.slug}`;
  const schemas: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      "@id": url,
      name: s.title,
      url,
      description: s.shortDesc ?? undefined,
      image: s.featuredImage ?? SITE_LOGO,
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
  const url = `${SITE_URL}/${a.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: a.title,
    description: a.shortDesc ?? undefined,
    url,
    image: a.featuredImage ?? SITE_LOGO,
    datePublished: a.publishedAt?.toISOString() ?? undefined,
    dateModified: (a.updatedAt ?? a.publishedAt)?.toISOString() ?? undefined,
    inLanguage: "fa",
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
      inLanguage: "fa",
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
