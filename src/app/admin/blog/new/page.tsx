import { prisma } from "@/lib/prisma";
import BlogEditForm from "../BlogEditForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مقاله جدید | ادمین" };

export default async function BlogNewPage() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ margin: "0 0 28px", fontSize: 22, fontWeight: 800, color: "#133b48" }}>مقاله جدید</h1>
      <BlogEditForm post={null} categories={categories} />
    </div>
  );
}
