import { getDentistSession } from "@/lib/dentist-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ArticleEditor from "@/components/dentist/ArticleEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مقاله جدید | پنل دندانپزشک" };

export default async function NewArticlePage() {
  const session = await getDentistSession();
  if (!session) redirect("/dentist/login");

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return <ArticleEditor categories={categories} />;
}
