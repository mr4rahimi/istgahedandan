import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogEditForm from "../BlogEditForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ویرایش مقاله | ادمین" };

export default async function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } });
  if (!post) notFound();

  const categories = await prisma.category.findMany({ select: { id: true, name: true } });

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ margin: "0 0 28px", fontSize: 22, fontWeight: 800, color: "#133b48" }}>ویرایش مقاله</h1>
      <BlogEditForm post={post} categories={categories} />
    </div>
  );
}
