import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const blogs = await db.blog.findMany({
    where: { status: "PUBLISHED" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const items = blogs
    .map((blog) => {
      const url = `${baseUrl}/blogs/${blog.slug}`;
      const pubDate = (blog.publishedAt ?? blog.updatedAt).toUTCString();
      const description = escapeXml(
        (blog.excerpt ||
          String(blog.content)
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        ).slice(0, 300)
      );

      return [
        "<item>",
        `<title>${escapeXml(blog.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${pubDate}</pubDate>`,
        `<description>${description}</description>`,
        `<author>${escapeXml(blog.author?.name ?? siteConfig.name)}</author>`,
        "</item>",
      ].join("");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(siteConfig.name)} Blog</title>
<link>${baseUrl}/blogs</link>
<description>${escapeXml(siteConfig.description)}</description>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
