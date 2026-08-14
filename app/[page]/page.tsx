import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStaticPage, staticPageSlugs } from "@/lib/pages";

export function generateStaticParams() {
  return staticPageSlugs().map((page) => ({ page }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const doc = getStaticPage(page);
  return { title: doc?.title ?? "Not found" };
}

export default async function StaticContentPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const doc = getStaticPage(page);
  if (!doc) notFound();

  return (
    <div className="static-page">
      {/* First-party content shipped in the repo, not user input */}
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
