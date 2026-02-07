"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  stats as defaultStats,
  diyProjects as defaultDiyProjects,
  stories as defaultStories,
  teamMembers as defaultTeam,
  ewasteImages as defaultEwasteImages,
  storyImages as defaultStoryImages,
  galleryContent as defaultGalleryContent,
  galleryTiles as defaultGalleryTiles,
  submitCta as defaultSubmitCta,
} from "@/lib/data";

type PreviewData = {
  heroMessage: string;
  stats: typeof defaultStats;
  ewasteImages: string[];
  storyImages: string[];
  stories: typeof defaultStories;
  diyProjects: typeof defaultDiyProjects;
  teamMembers: typeof defaultTeam;
  galleryContent: typeof defaultGalleryContent;
  galleryTiles: typeof defaultGalleryTiles;
  submitCta: typeof defaultSubmitCta;
};

type IncomingPreview = Partial<Omit<PreviewData, "heroMessage">> & {
  heroMessage?: string;
};

const DEFAULT_PREVIEW: PreviewData = {
  heroMessage:
    "E-MADE is a youth-led initiative that tackles the growing crisis of electronic waste by collecting, safely recycling, and repurposing discarded electronics.",
  stats: defaultStats,
  ewasteImages: defaultEwasteImages,
  storyImages: defaultStoryImages,
  stories: defaultStories,
  diyProjects: defaultDiyProjects,
  teamMembers: defaultTeam,
  galleryContent: defaultGalleryContent,
  galleryTiles: defaultGalleryTiles,
  submitCta: defaultSubmitCta,
};

const toPreviewData = (incoming: IncomingPreview | undefined): PreviewData => {
  const data = incoming ?? {};
  return {
    heroMessage: typeof data.heroMessage === "string" && data.heroMessage.trim().length > 0
      ? data.heroMessage
      : DEFAULT_PREVIEW.heroMessage,
    stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : DEFAULT_PREVIEW.stats,
    ewasteImages: Array.isArray(data.ewasteImages) && data.ewasteImages.length > 0
      ? data.ewasteImages
      : DEFAULT_PREVIEW.ewasteImages,
    storyImages: Array.isArray(data.storyImages) && data.storyImages.length > 0
      ? data.storyImages
      : DEFAULT_PREVIEW.storyImages,
    stories: Array.isArray(data.stories) && data.stories.length > 0 ? data.stories : DEFAULT_PREVIEW.stories,
    diyProjects: Array.isArray(data.diyProjects) && data.diyProjects.length > 0
      ? data.diyProjects
      : DEFAULT_PREVIEW.diyProjects,
    teamMembers: Array.isArray(data.teamMembers) && data.teamMembers.length > 0
      ? data.teamMembers
      : DEFAULT_PREVIEW.teamMembers,
    galleryContent: data.galleryContent ?? DEFAULT_PREVIEW.galleryContent,
    galleryTiles: Array.isArray(data.galleryTiles) && data.galleryTiles.length > 0
      ? data.galleryTiles
      : DEFAULT_PREVIEW.galleryTiles,
    submitCta: data.submitCta ? { ...DEFAULT_PREVIEW.submitCta, ...data.submitCta } : DEFAULT_PREVIEW.submitCta,
  };
};

const SECTION_TITLES: Record<string, string> = {
  hero: "Hero",
  stats: "Impact Stats",
  slideshows: "Slideshows",
  gallery: "Gallery",
  stories: "Stories",
  diy: "DIY Lab",
  team: "Team",
  "submit-cta": "Submit CTA",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const tileSizeClasses: Record<string, string> = {
  square: "col-span-1 row-span-1",
  landscape: "col-span-2 row-span-1",
  portrait: "col-span-1 row-span-2",
  spotlight: "col-span-2 row-span-2",
};

const isRemote = (src: string) => /^https?:\/\//.test(src);

type PreviewImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

const PreviewImage = ({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 800px",
  quality,
}: PreviewImageProps) => {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      unoptimized={isRemote(src)}
    />
  );
};

export default function AdminPreviewPage() {
  const [section, setSection] = useState<string>("hero");
  const [draftData, setDraftData] = useState<PreviewData>(DEFAULT_PREVIEW);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "ADMIN_PREVIEW_UPDATE") {
        setDraftData(toPreviewData(event.data.data));
        if (typeof event.data.section === "string") {
          setSection(event.data.section);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "ADMIN_PREVIEW_READY" }, window.location.origin);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const content = useMemo(() => renderSection(section, draftData), [section, draftData]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Admin preview</p>
            <h1 className="text-2xl font-semibold">{SECTION_TITLES[section] ?? "Preview"}</h1>
          </div>
          <p className="text-xs text-slate-400">
            Changes here mirror unsaved edits from the stewardship console.
          </p>
        </header>
        {content}
      </div>
    </div>
  );
}

function renderSection(section: string, data: PreviewData) {
  switch (section) {
    case "stats":
      return <StatsPreview stats={data.stats} heroMessage={data.heroMessage} />;
    case "slideshows":
      return <SlideshowsPreview ewaste={data.ewasteImages} stories={data.storyImages} />;
    case "gallery":
      return <GalleryPreview content={data.galleryContent} tiles={data.galleryTiles} />;
    case "stories":
      return <StoriesPreview stories={data.stories} />;
    case "diy":
      return <DiyPreview projects={data.diyProjects} />;
    case "team":
      return <TeamPreview team={data.teamMembers} />;
    case "submit-cta":
      return <SubmitCtaPreview submitCta={data.submitCta} />;
    case "hero":
    default:
      return <HeroPreview heroMessage={data.heroMessage} stats={data.stats} />;
  }
}

function HeroPreview({ heroMessage, stats }: { heroMessage: string; stats: typeof defaultStats }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-10 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.8)] sm:px-8 sm:py-12">
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-28 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="chip text-xs uppercase tracking-[0.28em] text-lime-200">
            Reduce. Reuse. Recycle
          </div>
          <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Safer e-waste, stronger communities.
          </h2>
          <p className="max-w-2xl text-lg text-slate-200">{heroMessage}</p>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary" href="/diy">
              Open the DIY safety kit
            </Link>
            <Link className="btn-ghost" href="/stories">
              Read local stories
            </Link>
            <Link className="btn-ghost" href="/admin" prefetch={false}>
              Stewardship console
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="glass relative overflow-hidden rounded-2xl border border-white/10 p-4">
                <p className="text-sm text-slate-300">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.detail}</p>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="chip w-fit bg-white/10 text-lime-200">Field notes + workshops</div>
          <div className="glass relative flex flex-col gap-5 rounded-2xl p-6">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/images/community-education.jpg"
                alt="Community education illustration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            </div>
            <div className="space-y-4 text-sm text-slate-200">
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-lime-400" />
                <div>
                  <p className="font-semibold text-white">Battery safety pop-ups</p>
                  <p className="text-slate-400">Hands-on coaching to identify, isolate, and store damaged cells.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <div>
                  <p className="font-semibold text-white">Data wipe clinics</p>
                  <p className="text-slate-400">Families learning secure erase before reuse or recycling.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-400" />
                <div>
                  <p className="font-semibold text-white">Certified drop-off mapping</p>
                  <p className="text-slate-400">Neighborhood lists verified with trusted recyclers.</p>
                </div>
              </div>
            </div>
          </div>
          <Link className="btn-primary" href="/stories">
            Explore community signals
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsPreview({ stats, heroMessage }: { stats: typeof defaultStats; heroMessage: string }) {
  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Impact stats</p>
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Field momentum at a glance</h2>
        <p className="text-sm text-slate-300">
          These values power the public hero promise. Updates here immediately change the home page metrics.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass relative overflow-hidden rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-lime-200">{stat.label}</p>
            <p className="mt-3 text-4xl font-semibold text-white">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-400">{stat.detail}</p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Hero message</p>
        <p className="mt-3 text-base text-slate-200">{heroMessage}</p>
      </div>
    </section>
  );
}

function SlideshowsPreview({ ewaste, stories }: { ewaste: string[]; stories: string[] }) {
  const renderImageRow = (images: string[], alt: string) => (
    <div className="slideshow relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-56 lg:h-64">
      {images.slice(0, 3).map((src, idx) => (
        <PreviewImage
          key={`${alt}-${idx}`}
          src={src}
          alt={alt}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority={idx === 0}
          quality={50}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">DIY lab</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Local playbooks for safe handling</h2>
          </div>
          <Link className="btn-ghost" href="/diy">
            View all playbooks
          </Link>
        </div>
        {renderImageRow(ewaste, "E-waste education")}
        <div className="grid gap-6 md:grid-cols-3">
          {ewaste.slice(0, 3).map((src, idx) => (
            <div key={`ewaste-card-${idx}`} className="glass relative h-full rounded-2xl border border-white/10 p-5">
              <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                <PreviewImage src={src} alt="DIY preview" className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" quality={50} />
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-lime-200">Field capture</p>
              <p className="mt-2 text-sm text-slate-300">
                Uploads here shape the home DIY carousel thumb. Aim for bright, high-contrast photos.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community signals</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Stories, safety tips, and local action</h2>
          </div>
          <Link className="btn-ghost" href="/stories">
            Visit the forum
          </Link>
        </div>
        {renderImageRow(stories, "Story highlights")}
        <div className="grid gap-5 md:grid-cols-3">
          {stories.slice(0, 3).map((src, idx) => (
            <div key={`story-card-${idx}`} className="glass relative flex h-full flex-col justify-between rounded-2xl border border-white/10 p-5">
              <div className="space-y-3">
                <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                  <PreviewImage src={src} alt="Story preview" className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" quality={50} />
                </div>
                <div className="self-start rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lime-200">
                  Story asset
                </div>
                <p className="text-sm text-slate-300">
                  This carousel fuels the home page stories section. Uploads should reflect action and human context.
                </p>
              </div>
              <div className="mt-4 text-sm text-slate-300">Slide {idx + 1}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GalleryPreview({
  content,
  tiles,
}: {
  content: typeof defaultGalleryContent;
  tiles: typeof defaultGalleryTiles;
}) {
  const galleryHero = content.hero;
  return (
    <div className="space-y-10">
      <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">{galleryHero.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{galleryHero.title}</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-300">{galleryHero.description}</p>
          </div>
          <Link className="btn-ghost" href="/">
            Back home
          </Link>
        </header>
        <div className="grid auto-rows-[140px] gap-4 sm:auto-rows-[170px] sm:grid-cols-6">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${
                (tile.size ? tileSizeClasses[tile.size] : undefined) ?? tileSizeClasses.square
              }`}
            >
              {tile.src ? (
                <PreviewImage
                  src={tile.src}
                  alt={tile.title || "Gallery tile"}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={70}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-500">
                  Awaiting image
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                {tile.title && <p className="text-sm font-semibold text-white">{tile.title}</p>}
                {tile.description && <p className="mt-1 text-xs text-slate-200">{tile.description}</p>}
                <span className="mt-3 inline-flex w-fit rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/70">
                  {tile.size}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {content.sections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-lime-200">{section.eyebrow}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{section.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{section.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StoriesPreview({ stories }: { stories: typeof defaultStories }) {
  const getStorySlug = (story: { title?: string; slug?: string }) =>
    slugify((story.slug || story.title || "story").trim());

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="E-MADE logo"
            width={72}
            height={72}
            className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community stories</p>
            <h2 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">Lessons from the front lines.</h2>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Neighbors closest to the problem share what they have learned about safety, justice, and responsible disposal.
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/">
          Back to home
        </Link>
      </header>

      <div className="relative h-52 w-full overflow-hidden rounded-3xl border border-white/10 sm:h-64">
        <Image
          src="/images/community learning.jpg"
          alt="Community learning stories illustration"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <article key={story.slug ?? story.title} className="glass relative flex h-full flex-col gap-3 rounded-2xl border border-white/10 p-5">
            {story.imageUrl && (
              <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10">
                <PreviewImage
                  src={story.imageUrl}
                  alt={`${story.title} cover`}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={50}
                />
              </div>
            )}
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-lime-200">
              <span>{story.category}</span>
              <span>{story.time}</span>
            </div>
            {story.status && (
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Status: {story.status}</div>
            )}
            <h3 className="text-2xl font-semibold text-white">
              <Link className="hover:text-lime-200" href={`/stories/${getStorySlug(story)}`}>
                {story.title}
              </Link>
            </h3>
            <p className="text-sm text-slate-300">{story.excerpt}</p>
            <div className="mt-auto flex items-center justify-between text-sm text-slate-300">
              <span>{story.author}</span>
              <div className="flex gap-2 text-xs text-slate-400">
                {(Array.isArray(story.tags) ? story.tags : []).map((tag) => (
                  <span key={tag} className="chip bg-white/10 text-slate-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-200">
              <Link className="btn-ghost" href={`/stories/${getStorySlug(story)}`}>
                Read full story
              </Link>
              {story.pdfUrl && (
                <a className="btn-ghost" href={story.pdfUrl} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DiyPreview({ projects }: { projects: typeof defaultDiyProjects }) {
  return (
    <section className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="E-MADE logo"
            width={72}
            height={72}
            className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">DIY safety lab</p>
            <h2 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">Learn safe handling, repair, and reuse.</h2>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Every playbook is built for families, schools, and neighborhood organizers. Downloads are free, printable, and designed for low-risk handling.
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/">
          Back home
        </Link>
      </header>

      <div className="relative h-52 w-full overflow-hidden rounded-3xl border border-white/10 sm:h-64">
        <Image
          src="/images/recycle bin.jpg"
          alt="E-waste sorting and recycling illustration"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <div key={project.name} className="glass relative overflow-hidden rounded-3xl border border-white/10 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-emerald-400/5" />
            <div className="relative space-y-3">
              {project.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10">
                  <PreviewImage
                    src={project.imageUrl}
                    alt={`${project.name} guide cover`}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={50}
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-lime-200">
                <span>{project.difficulty}</span>
                <span className="text-slate-600">•</span>
                <span>{project.time}</span>
                {project.status && (
                  <span className="chip bg-white/10 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                    {project.status}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-semibold text-white">{project.name}</h3>
              <p className="text-sm text-slate-300">{project.outcome}</p>
              <ul className="space-y-2 text-sm text-slate-200">
                {(Array.isArray(project.steps) ? project.steps : []).map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-400" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-slate-400">Impact: {project.impact}</p>
              {project.pdfUrl ? (
                <div className="flex gap-3">
                  <a className="btn-primary" href={project.pdfUrl} target="_blank" rel="noreferrer">
                    Download playbook (free)
                  </a>
                  <a className="btn-ghost" href={project.pdfUrl} target="_blank" rel="noreferrer">
                    Printable checklist
                  </a>
                </div>
              ) : (
                <p className="text-xs text-amber-200/80">
                  Attach a PDF in the admin console to make this playbook downloadable.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamPreview({ team }: { team: typeof defaultTeam }) {
  const normalized = team.map((member) => {
    const name = member.name?.trim() || "Community steward";
    const avatar = member.avatar?.trim().slice(0, 2).toUpperCase() || name.slice(0, 2).toUpperCase();
    return { ...member, name, avatar };
  });

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="E-MADE logo"
            width={72}
            height={72}
            className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Stewards</p>
            <h2 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">People behind the lab.</h2>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              We center health, dignity, and environmental justice while building practical tools for safer e-waste handling.
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/">
          Back home
        </Link>
      </header>

      <div className="relative h-52 w-full overflow-hidden rounded-3xl border border-white/10 sm:h-64">
        <Image
          src="/images/IMG_4551.jpeg"
          alt="Illustration of e-waste stewardship"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {normalized.map((member) => (
          <div key={member.name} className="glass relative rounded-3xl border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-lime-300/60 via-purple-500/40 to-emerald-400/50 text-sm font-semibold text-white">
                  {member.imageUrl ? (
                    <PreviewImage src={member.imageUrl} alt={member.name} className="object-cover" sizes="48px" quality={50} />
                  ) : (
                    member.avatar
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-lime-200">{member.role}</p>
                </div>
              </div>
              <span className="chip bg-white/10 text-xs uppercase tracking-[0.2em] text-slate-200">Steward</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{member.focus}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              {(member.socials ?? []).map((social) => (
                <a key={social.label} className="chip bg-white/10 hover:border-white/40" href={social.url} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SubmitCtaPreview({ submitCta }: { submitCta: typeof defaultSubmitCta }) {
  return (
    <section className="glass relative overflow-hidden rounded-3xl border border-lime-400/20 p-8">
      <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 via-transparent to-emerald-400/10" />
      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Community contributions</p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{submitCta.title}</h2>
          <p className="mt-2 text-slate-300">{submitCta.description}</p>
        </div>
        <a
          href={`mailto:${submitCta.email}?subject=E-Made Submission`}
          className="btn-primary whitespace-nowrap flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {submitCta.buttonText}
        </a>
      </div>
    </section>
  );
}
