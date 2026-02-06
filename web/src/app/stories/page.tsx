"use client";

import { stories, storyImages as defaultStoryImages } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";


export default function StoriesPage() {
  const [storyList, setStoryList] = useState(stories);
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const getStorySlug = (story: { title?: string; slug?: string }) =>
    slugify((story.slug || story.title || "").trim());
  const [storyImages, setStoryImages] = useState(defaultStoryImages);
  const storyHero = storyImages[0];

  useEffect(() => {
    let active = true;
    fetch("/api/stories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : stories))
      .then((data) => {
        if (active && Array.isArray(data)) setStoryList(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.storyImages) && data.storyImages.length > 0) {
          setStoryImages(data.storyImages);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-16">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="E-Made logo"
            width={72}
            height={72}
            className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community stories</p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
              Lessons from the front lines.
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Neighbors closest to the problem share what they have learned about safety, justice, and responsible disposal.
            </p>
          </div>
        </div>
        <Link className="btn-primary" href="/">
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

      <div className="slideshow relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-56 lg:h-64">
        {storyHero ? (
          <Image
            src={storyHero}
            alt="Story highlights"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            quality={35}
            priority
            fetchPriority="high"
          />
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {storyList.map((story) => (
          <article
            key={story.title}
            className="glass relative flex h-full flex-col gap-3 rounded-2xl border border-white/10 p-5"
          >
            {story.imageUrl && (
              <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={story.imageUrl}
                  alt={`${story.title} cover`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={35}
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
              <Link className="hover:text-lime-200" href={`/stories/${getStorySlug(story)}`}>
                {story.title}
              </Link>
            </h2>
            <p className="text-sm text-slate-300">{story.excerpt}</p>
            <div className="mt-auto flex items-center justify-between text-sm text-slate-300">
              <span>{story.author}</span>
              <div className="flex gap-2 text-xs text-slate-400">
                {story.tags.map((tag) => (
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
