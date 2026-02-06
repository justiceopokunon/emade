"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { stats, stories, diyProjects, ewasteImages as defaultEwasteImages, storyImages as defaultStoryImages } from "@/lib/data";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollLoad } from "@/components/ScrollLoad";

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.25, 0.8, 0.25, 1] as const },
};

export default function Home() {
  const [storyList, setStoryList] = useState(stories);
  const [projects, setProjects] = useState(diyProjects);
  const [heroCopy, setHeroCopy] = useState(
    "E-MADE transforms electronic waste into opportunity — collecting, repairing, and responsibly recycling devices while training communities and creating green pathways for youth."
  );
  const [statsData, setStatsData] = useState(stats);
  const [hasCounted, setHasCounted] = useState(false);
  const [countValues, setCountValues] = useState(() => stats.map(() => 0));
  const statsRef = useRef<HTMLDivElement>(null);
  const [ewasteImages, setEwasteImages] = useState(defaultEwasteImages);
  const [storyImages, setStoryImages] = useState(defaultStoryImages);
  const [submitCta, setSubmitCta] = useState({
    title: "Share your story or idea",
    description: "Have a safety tip, community ad, workshop idea, or e-waste story to share? We'd love to feature it on the site.",
    email: "admin@emade.social",
    buttonText: "Send us your idea",
  });

  const parsedStats = useMemo(
    () =>
      statsData.map((stat) => {
        const numeric = parseFloat(stat.value.replace(/[^0-9.]/g, "")) || 0;
        const suffix = stat.value.replace(/[0-9.,]/g, "").trim();
        return { ...stat, numeric, suffix };
      }),
    [statsData]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasCounted(true);
          }
        });
      },
      { threshold: 0.35 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasCounted) return;
    let start: number | null = null;
    const duration = 1200;
    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCountValues(parsedStats.map((stat) => stat.numeric * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [hasCounted, parsedStats]);

  const formatStat = (index: number) => {
    const stat = parsedStats[index];
    const value = countValues[index] ?? 0;
    if (stat.suffix === "k") {
      const kValue = value < 1000 ? value : value / 1000;
      const display = kValue.toFixed(kValue < 10 ? 1 : 0).replace(/\.0$/, "");
      return `${display}k`;
    }
    if (stat.suffix === "+") {
      return `${Math.round(value).toLocaleString()}+`;
    }
    if (stat.suffix.includes("tons")) {
      return `${Math.round(value).toLocaleString()} tons`;
    }
    return `${Math.round(value).toLocaleString()}${stat.suffix ? ` ${stat.suffix}` : ""}`;
  };

  useEffect(() => {
    let active = true;
    fetch("/api/stories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : stories))
      .then((data) => {
        if (active && Array.isArray(data)) setStoryList(data);
      })
      .catch(() => undefined);
    fetch("/api/diy", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : diyProjects))
      .then((data) => {
        if (active && Array.isArray(data)) setProjects(data);
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
        if (!data) return;
        if (typeof data.heroMessage === "string") setHeroCopy(data.heroMessage);
        if (Array.isArray(data.stats)) {
          setStatsData(data.stats);
          setCountValues(data.stats.map(() => 0));
          setHasCounted(false);
        }
        if (Array.isArray(data.ewasteImages) && data.ewasteImages.length > 0) {
          setEwasteImages(data.ewasteImages);
        }
        if (Array.isArray(data.storyImages) && data.storyImages.length > 0) {
          setStoryImages(data.storyImages);
        }
        if (data.submitCta) {
          setSubmitCta((prev) => ({ ...prev, ...data.submitCta }));
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen flex-col px-4 pb-16 pt-8 sm:px-8 sm:pt-10 lg:px-16">
      <main className="mx-auto mt-8 w-full max-w-6xl space-y-16 sm:mt-10">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-10 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.8)] sm:px-8 sm:py-12">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-28 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <div className="chip text-xs uppercase tracking-[0.28em] text-lime-200">
                Reduce. Reuse. Recycle
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Safer e-waste, stronger communities.
              </h1>
              <p className="max-w-2xl text-lg text-slate-200">{heroCopy}</p>
              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                  <Link className="btn-primary" href="/diy">
                    Open the DIY safety kit
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link className="btn-ghost" href="/stories">
                    Read local stories
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link className="btn-ghost" href="/admin" prefetch={false}>
                    Stewardship console
                  </Link>
                </motion.div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3" ref={statsRef}>
                {parsedStats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    className="glass relative overflow-hidden rounded-2xl p-4"
                    {...cardMotion}
                    whileHover={{ y: -4, boxShadow: "0 18px 50px -30px rgba(158,240,26,0.45)" }}
                  >
                    <p className="text-sm text-slate-300">{stat.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-white">
                      {hasCounted ? formatStat(idx) : formatStat(idx)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{stat.detail}</p>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="glass relative flex flex-col gap-5 rounded-2xl p-6"
              {...cardMotion}
            >
              <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/community-education.jpg"
                  alt="Community education illustration"
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                />
              </div>
              <div className="chip w-fit bg-white/10 text-lime-200">Field notes + workshops</div>
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
              <Link className="btn-primary" href="/stories">
                Explore community signals
              </Link>
            </motion.div>
          </div>
        </section>

        <ScrollLoad minHeight={520}>
          <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">DIY lab</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Local playbooks for safe handling</h2>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link className="btn-ghost" href="/diy">
                View all playbooks
              </Link>
            </motion.div>
          </div>
          <div className="slideshow relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-56 lg:h-64">
            {ewasteImages.map((src) => (
              <img key={src} src={src} alt="E-waste education" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {projects.map((project, idx) => (
              <Link key={project.name} href="/diy">
                <motion.div
                  className="glass group relative overflow-hidden rounded-2xl border border-white/10 p-5 cursor-pointer h-full"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  {...cardMotion}
                  transition={{ ...cardMotion.transition, delay: idx * 0.05 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  {project.imageUrl && (
                    <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                      <img
                        src={project.imageUrl}
                        alt={`${project.name} guide cover`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.28em] text-lime-200">{project.difficulty}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{project.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">{project.outcome}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-200">
                    <span>{project.time}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          </section>
        </ScrollLoad>

        <ScrollLoad minHeight={520}>
          <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community signals</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Stories, safety tips, and local action</h2>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link className="btn-ghost" href="/stories">
                Visit the forum
              </Link>
            </motion.div>
          </div>
          <div className="slideshow relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-56 lg:h-64">
            {storyImages.map((src) => (
              <img key={src} src={src} alt="Story highlights" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {storyList.slice(0, 3).map((story, idx) => (
              <Link key={story.slug} href={`/stories/${story.slug}`}>
                <motion.article
                  className="glass relative flex h-full flex-col justify-between rounded-2xl border border-white/10 p-5 cursor-pointer"
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  {...cardMotion}
                  transition={{ ...cardMotion.transition, delay: idx * 0.06 }}
                >
                  <div className="space-y-3">
                    {story.imageUrl && (
                      <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                        <img
                          src={story.imageUrl}
                          alt={`${story.title} cover`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="self-start rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lime-200">
                      {story.category}
                    </div>
                    <h3 className="text-xl font-semibold text-white">{story.title}</h3>
                    <p className="text-sm text-slate-300">{story.excerpt}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                    <span>{story.author}</span>
                    <span>{story.time}</span>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
          </section>
        </ScrollLoad>

        {/* Submit CTA Section */}
        <ScrollLoad minHeight={320}>
        <section className="glass relative overflow-hidden rounded-3xl border border-lime-400/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 via-transparent to-emerald-400/10" />
          <div className="relative flex flex-col items-center text-center gap-5 sm:flex-row sm:text-left sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Community contributions</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {submitCta.title}
              </h2>
              <p className="mt-2 text-slate-300">
                {submitCta.description}
              </p>
            </div>
            <motion.a
              href={`mailto:${submitCta.email}?subject=E-Made Submission`}
              className="btn-primary whitespace-nowrap flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {submitCta.buttonText}
            </motion.a>
          </div>
        </section>
        </ScrollLoad>

        <ScrollLoad minHeight={360}>
        <section className="glass relative overflow-hidden rounded-3xl border border-white/10 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-emerald-400/10" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Stewardship console</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Keep the guidance accurate, humane, and local.
              </h2>
              <p className="mt-3 text-lg text-slate-200">
                Update playbooks, safety checklists, and community stories so neighbors can handle devices without harm.
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                  <Link className="btn-primary" href="/admin" prefetch={false}>
                    Enter console
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link className="btn-ghost" href="/team">
                    Meet the team
                  </Link>
                </motion.div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Hero message",
                "Safety playbooks",
                "Community stories",
                "Impact highlights",
                "Team bios",
                "Resource PDFs",
              ].map((item) => (
                <div key={item} className="glass rounded-2xl border border-white/10 p-5">
                  <p className="text-sm text-slate-200">{item}</p>
                  <p className="text-xs text-slate-400">Editable in the admin console with safety checks.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </ScrollLoad>
      </main>

      <footer className="mx-auto mt-12 w-full max-w-6xl rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-white">E-Made Community Lab</p>
        <p className="text-slate-400">Human-first education on e-waste safety, repair, and responsible recycling. Every guide ships free and printable.</p>
          </div>
          <div className="flex gap-3 text-xs uppercase tracking-[0.25em] text-slate-300">
            <Link href="/stories">Forum</Link>
            <span className="text-slate-600">•</span>
            <Link href="/diy">DIY</Link>
            <span className="text-slate-600">•</span>
            <Link href="/gallery">Gallery</Link>
            <span className="text-slate-600">•</span>
            <Link href="/team">Team</Link>
            <span className="text-slate-600">•</span>
            <Link href="/contact">Contact</Link>
            <span className="text-slate-600">•</span>
            <Link href="/admin" prefetch={false}>Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
