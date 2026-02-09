import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryChat } from "@/components/StoryChat";
import { CountingStats } from "@/components/CountingStats";
import {
  loadStories,
  loadStoryBySlug,
  normalizeSlug,
} from "@/lib/storyData";
import { loadSiteData } from "@/lib/siteData";

interface StoryPageProps {
  params: { slug: string };
}

export const revalidate = 0;

export async function generateStaticParams() {
  const stories = await loadStories();
  return stories
    .map((story) => normalizeSlug(story.slug || story.title))
    .filter((slug) => slug.length > 0)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: StoryPageProps) {
  const slug = normalizeSlug(params.slug);
  const story = await loadStoryBySlug(slug);
  if (!story) {
    return {
      title: "Story not found | E-MADE",
    };
  }

  return {
    title: `${story.title} | E-MADE`,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      images: story.imageUrl ? [{ url: story.imageUrl, alt: story.title }] : undefined,
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const slug = normalizeSlug(params.slug);
  const [story, site] = await Promise.all([
    loadStoryBySlug(slug),
    loadSiteData(),
  ]);

  if (!story) notFound();

  const galleryImages = Array.isArray(site.storyImages) ? site.storyImages : [];
  const tags = Array.isArray(story.tags) ? story.tags.filter((tag) => tag.trim().length > 0) : [];
  const paragraphs = (story.body || "")
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-12">
      <header className="flex flex-col gap-6 border-b border-white/10 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="btn-ghost" href="/stories">
            ← Back to stories
          </Link>
          <span className="chip bg-white/10 text-xs uppercase tracking-[0.2em] text-slate-200">
            {story.category}
          </span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community story</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
            {story.title}
          </h1>
          <p className="mt-3 text-lg text-slate-200">{story.excerpt}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
            {story.status || "Published"}
          </span>
          <span>By {story.author}</span>
          {story.time && <span>· {story.time}</span>}
          <span>· Updated {new Date().toLocaleDateString()}</span>
        </div>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="chip bg-white/10 text-xs text-slate-200">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      {story.imageUrl && (
        <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10">
          <Image
            src={story.imageUrl}
            alt={story.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
      )}

      <article className="prose prose-invert prose-headings:text-white prose-p:text-slate-100">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>

      <CountingStats 
        stats={[
          { label: "Households reached", value: 100 },
          { label: "Safe drop-offs guided", value: 170, suffix: "+" },
          { label: "Students trained", value: 200, suffix: "+" },
        ]}
      />

      {story.pdfUrl && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
          <h2 className="text-xl font-semibold text-white">Download the printable</h2>
          <p className="mt-2 text-slate-300">
            Grab the full PDF with templates and facilitator notes for this story.
          </p>
          <a
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-400/20 px-4 py-2 text-lime-200 transition hover:bg-lime-400/30"
            href={story.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PDF
          </a>
        </div>
      )}

      {galleryImages.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Related field photos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {galleryImages.slice(0, 4).map((image) => (
              <div key={image} className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={image}
                  alt="Story gallery"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <StoryChat storySlug={slug} />
    </div>
  );
}
