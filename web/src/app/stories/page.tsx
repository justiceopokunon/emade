import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "@/components/AnimatedSection";
import { InteractiveCard } from "@/components/InteractiveCard";
import { ParallaxSection } from "@/components/ParallaxSection";
import { loadStories, normalizeSlug } from "@/lib/storyData";
import { loadSiteData } from "@/lib/siteData";
import { storyImages as defaultStoryImages } from "@/lib/data";

export const revalidate = 0;

const getStorySlug = (story: { title?: string; slug?: string }) =>
  normalizeSlug(story.slug || story.title || "");

export default async function StoriesPage() {
  const [storyList, site] = await Promise.all([loadStories(), loadSiteData()]);
  const storyImages = Array.isArray(site.storyImages) && site.storyImages.length > 0
    ? site.storyImages
    : defaultStoryImages;

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-16">
      <AnimatedSection animation="slide-up">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="animate-pulse-glow">
              <Image
                src="/logo.png"
                alt="E-MADE logo"
                width={72}
                height={72}
                className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community stories</p>
              <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
                Lessons from the front lines.
              </h1>
              <p className="mt-3 max-w-3xl text-lg text-slate-200">
                Neighbors closest to the problem share what keeps their families safe and how to recycle devices without harm.
              </p>
            </div>
          </div>
          <Link className="btn-primary hover-lift" href="/">
            Back to home
          </Link>
        </header>
      </AnimatedSection>

      <AnimatedSection animation="scale" delay={200}>
        <ParallaxSection speed={0.2}>
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
        </ParallaxSection>
      </AnimatedSection>

      <AnimatedSection animation="fade" delay={300}>
        <div className="slideshow relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-56 lg:h-64">
          {storyImages.slice(0, 3).map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt="Story highlights"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              quality={70}
              priority={idx === 0}
            />
          ))}
        </div>
      </AnimatedSection>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {storyList.map((story, index) => (
          <AnimatedSection 
            key={`${story.slug}-${story.title}`}
            animation="slide-up"
            delay={index * 100}
          >
            <InteractiveCard className="h-full">
              <article className="glass relative flex h-full flex-col gap-3 rounded-2xl border border-white/10 p-5 card-interactive">
                {story.imageUrl && (
                  <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={story.imageUrl}
                      alt={`${story.title} cover`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
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
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Status: {story.status}
                  </div>
                )}
                <h2 className="text-2xl font-semibold text-white">
                  <Link className="hover:text-lime-200 transition-colors" href={`/stories/${getStorySlug(story)}`}>
                    {story.title}
                  </Link>
                </h2>
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
                  <Link className="btn-ghost hover-scale" href={`/stories/${getStorySlug(story)}`}>
                    Read full story
                  </Link>
                  {story.pdfUrl && (
                    <a
                      className="btn-ghost hover-scale"
                      href={story.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  )}
                </div>
              </article>
            </InteractiveCard>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
