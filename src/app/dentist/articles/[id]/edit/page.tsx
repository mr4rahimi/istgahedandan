import { getDentistSession } from "@/lib/dentist-auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ArticleEditor from "@/components/dentist/ArticleEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش مقاله | پنل دندانپزشک" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getDentistSession();
  if (!session) redirect("/dentist/login");

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
  if (!post || post.authorId !== session.id) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return <ArticleEditor categories={categories} post={{ id: post.id, title: post.title, content: post.content || "", excerpt: post.excerpt || "", categoryId: post.categoryId, featuredImage: post.featuredImage || "", metaTitle: post.metaTitle || "", metaDescription: post.metaDescription || "" }} />;
}
