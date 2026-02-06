"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ScrollLoad } from "@/components/ScrollLoad";
import {
  ewasteImages as defaultEwasteImages,
  storyImages as defaultStoryImages,
  stories as defaultStories,
  diyProjects as defaultDiyProjects,
  galleryContent as defaultGalleryContent,
  galleryTiles as defaultGalleryTiles,
} from "@/lib/data";

const galleryCopyFallback = {
  hero: {
    eyebrow: "Gallery",
    title: "Community Gallery",
    description: "Local contributions, remixed — photos and uploads from the field.",
  },
};

const tileSizeClasses: Record<string, string> = {
  square: "col-span-1 row-span-1",
  landscape: "col-span-2 row-span-1",
  portrait: "col-span-1 row-span-2",
  spotlight: "col-span-2 row-span-2",
};

const isRemote = (src: string) => /^https?:\/\//.test(src);

export default function GalleryPage() {
  const [galleryContent, setGalleryContent] = useState(defaultGalleryContent);
  const [galleryTiles, setGalleryTiles] = useState(defaultGalleryTiles);

  const [storyList, setStoryList] = useState(defaultStories);
  const [projects, setProjects] = useState(defaultDiyProjects);
  const [ewasteSlides, setEwasteSlides] = useState(defaultEwasteImages);
  const [storySlides, setStorySlides] = useState(defaultStoryImages);

  const galleryHero = galleryContent?.hero ?? galleryCopyFallback.hero;
  const findSection = (id: string) =>
    galleryContent?.sections?.find((section) => section.id === id);

  const ewasteSection = findSection("ewaste");
  const storySlidesSection = findSection("story-slides");
  const storyCoversSection = findSection("story-covers");

  const storyCovers = useMemo(
    () =>
      storyList
        .map((story) => story.imageUrl)
        .filter((src): src is string => typeof src === "string" && src.length > 0),
    [storyList]
  );
  const diyCovers = useMemo(
    () =>
      projects
        .map((project) => project.imageUrl)
        .filter((src): src is string => typeof src === "string" && src.length > 0),
    [projects]
  );

  useEffect(() => {
    let active = true;
    fetch("/api/stories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : defaultStories))
      .then((data) => {
        if (active && Array.isArray(data)) setStoryList(data);
      })
      .catch(() => undefined);
    fetch("/api/diy", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : defaultDiyProjects))
      .then((data) => {
        if (active && Array.isArray(data)) setProjects(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/site", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.ewasteImages) && data.ewasteImages.length > 0) {
          setEwasteSlides(data.ewasteImages);
        }
        if (Array.isArray(data.storyImages) && data.storyImages.length > 0) {
          setStorySlides(data.storyImages);
        }
        if (Array.isArray(data.galleryTiles) && data.galleryTiles.length > 0) {
          setGalleryTiles(data.galleryTiles);
        }
        if (data.galleryContent) {
          setGalleryContent(data.galleryContent);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Gallery section logic removed
  const diyCoversSection = findSection("diy-covers");

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
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
              {galleryHero.eyebrow}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
              {galleryHero.title}
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              {galleryHero.description}
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/">
          Back home
        </Link>
      </header>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community mosaic</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Local gallery grid</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Tiles blend local uploads with field shots. Adjust sizing in the stewardship console to remix the story.
          </p>
        </div>
        <ScrollLoad minHeight={480}>
        {galleryTiles.length > 0 ? (
          <div className="grid auto-rows-[140px] gap-4 sm:auto-rows-[170px] sm:grid-cols-6">
            {galleryTiles.map((tile) => (
              <div
                key={tile.id}
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${
                    (tile.size ? tileSizeClasses[tile.size] : undefined) ?? tileSizeClasses.square
                  }`}
              >
                {tile.src ? (
                  isRemote(tile.src) ? (
                    <img
                      src={tile.src}
                      alt={tile.title || "Gallery tile"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      width={800}
                      height={800}
                    />
                  ) : (
                    <Image
                      src={tile.src}
                      alt={tile.title || "Gallery tile"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={35}
                    />
                  )
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
        ) : (
          <p className="text-sm text-slate-400">
            Gallery tiles will appear once the admin deck publishes at least one tile.
          </p>
        )}
        </ScrollLoad>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
            {ewasteSection?.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{ewasteSection?.title}</h2>
          {ewasteSection?.description && (
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{ewasteSection.description}</p>
          )}
        </div>
        <ScrollLoad minHeight={360}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ewasteSlides.map((src) => (
            <div key={src} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 h-48">
              {isRemote(src) ? (
                <img src={src} alt="E-waste context" className="h-full w-full object-cover" loading="lazy" width={800} height={480} />
              ) : (
                <Image src={src} alt="E-waste context" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" quality={35} />
              )}
            </div>
          ))}
        </div>
        </ScrollLoad>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
            {storySlidesSection?.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{storySlidesSection?.title}</h2>
          {storySlidesSection?.description && (
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              {storySlidesSection.description}
            </p>
          )}
        </div>
        <ScrollLoad minHeight={360}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storySlides.map((src) => (
            <div key={src} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 h-48">
              {isRemote(src) ? (
                <img src={src} alt="Story highlight" className="h-full w-full object-cover" loading="lazy" width={800} height={480} />
              ) : (
                <Image src={src} alt="Story highlight" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" quality={35} />
              )}
            </div>
          ))}
        </div>
        </ScrollLoad>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
            {storyCoversSection?.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{storyCoversSection?.title}</h2>
          {storyCoversSection?.description && (
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              {storyCoversSection.description}
            </p>
          )}
        </div>
        <ScrollLoad minHeight={360}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storyCovers.map((src) => (
            <div key={src} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 h-48">
              {isRemote(src) ? (
                <img src={src} alt="Story cover" className="h-full w-full object-cover" loading="lazy" width={800} height={480} />
              ) : (
                <Image src={src} alt="Story cover" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" quality={35} />
              )}
            </div>
          ))}
        </div>
        </ScrollLoad>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">
            {diyCoversSection?.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{diyCoversSection?.title}</h2>
          {diyCoversSection?.description && (
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              {diyCoversSection.description}
            </p>
          )}
        </div>
        <ScrollLoad minHeight={360}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diyCovers.map((src) => (
            <div key={src} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 h-48">
              {isRemote(src) ? (
                <img src={src} alt="Guide cover" className="h-full w-full object-cover" loading="lazy" width={800} height={480} />
              ) : (
                <Image src={src} alt="Guide cover" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" quality={35} />
              )}
            </div>
          ))}
        </div>
        </ScrollLoad>
      </section>
    </div>
  );
}
