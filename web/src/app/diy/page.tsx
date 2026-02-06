"use client";

import { diyProjects } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ScrollLoad } from "@/components/ScrollLoad";


export default function DiyPage() {
  const [projects, setProjects] = useState(diyProjects);

  useEffect(() => {
    let active = true;
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

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-16">
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
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
              Learn safe handling, repair, and reuse.
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Every playbook is built for families, schools, and neighborhood organizers. Downloads are free, printable, and designed for low-risk handling.
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/">
          Back home
        </Link>
      </header>

      <ScrollLoad minHeight={240}>
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
      </ScrollLoad>

      <ScrollLoad minHeight={400}>
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.name}
            className="glass relative overflow-hidden rounded-3xl border border-white/10 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-emerald-400/5" />
            <div className="relative space-y-3">
              {project.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={project.imageUrl}
                    alt={`${project.name} guide cover`}
                    fill
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
              <h2 className="text-2xl font-semibold text-white">{project.name}</h2>
              <p className="text-sm text-slate-300">{project.outcome}</p>
              <ul className="space-y-2 text-sm text-slate-200">
                {project.steps.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime-400" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-slate-400">Impact: {project.impact}</p>
              <div className="flex gap-3">
                <a
                  className="btn-primary"
                  href={project.pdfUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  Download playbook (free)
                </a>
                <a
                  className="btn-ghost"
                  href={project.pdfUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  Printable checklist
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      </ScrollLoad>
    </div>
  );
}
