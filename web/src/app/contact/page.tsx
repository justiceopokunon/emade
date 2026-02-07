"use client";

import { contactChannels } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ScrollLoad } from "@/components/ScrollLoad";

interface Channel {
  label: string;
  detail: string;
  href: string;
}

const normalizeChannels = (incoming?: unknown): Channel[] => {
  const source = (Array.isArray(incoming) && incoming.length > 0 ? incoming : contactChannels) as Array<Record<string, unknown>>;
  return source.map((channel, index) => {
    const fallback = contactChannels[index] ?? contactChannels[0];
    const label = typeof channel.label === "string" && channel.label.trim().length > 0
      ? channel.label.trim()
      : (fallback?.label ?? "Contact");
    const detail = typeof channel.detail === "string" && channel.detail.trim().length > 0
      ? channel.detail.trim()
      : (fallback?.detail ?? "Reach out for support.");
    const href = typeof channel.href === "string" && channel.href.trim().length > 0
      ? channel.href.trim()
      : (fallback?.href ?? "/contact");
    return { label, detail, href };
  });
};

export default function ContactPage() {
  const [rawChannels, setRawChannels] = useState(contactChannels);

  const channels = useMemo(() => normalizeChannels(rawChannels), [rawChannels]);

  useEffect(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.contactChannels)) {
          setRawChannels(data.contactChannels as typeof contactChannels);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-12">
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
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Contact</p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">Connect with the lab.</h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              Report unsafe dumping, request a workshop, or partner on safe collection. Our tools and playbooks remain free for communities.
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/">
          Back home
        </Link>
      </header>

      <div className="relative h-52 w-full overflow-hidden rounded-3xl border border-white/10 sm:h-64">
        <svg
          viewBox="0 0 1200 800"
          className="h-full w-full"
          role="img"
          aria-label="Community contact illustration"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="contact-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0b1020" />
              <stop offset="1" stopColor="#0d1426" />
            </linearGradient>
            <radialGradient
              id="contact-glow"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(280 180) rotate(15) scale(320 240)"
            >
              <stop stopColor="#1dd3b0" stopOpacity="0.45" />
              <stop offset="1" stopColor="#1dd3b0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" rx="48" fill="url(#contact-bg)" />
          <rect width="1200" height="800" rx="48" fill="url(#contact-glow)" />
          <g opacity="0.9">
            <rect x="180" y="220" width="360" height="220" rx="28" fill="#ffffff" fillOpacity="0.05" stroke="#9ef01a" strokeOpacity="0.35" />
            <path d="M230 300h260" stroke="#9ef01a" strokeWidth="6" strokeLinecap="round" />
            <path d="M230 340h200" stroke="#1dd3b0" strokeWidth="6" strokeLinecap="round" />
          </g>
          <g opacity="0.9">
            <rect x="680" y="170" width="320" height="240" rx="28" fill="#ffffff" fillOpacity="0.05" stroke="#1dd3b0" strokeOpacity="0.35" />
            <circle cx="740" cy="260" r="22" fill="#7c3aed" fillOpacity="0.35" />
            <circle cx="820" cy="260" r="22" fill="#9ef01a" fillOpacity="0.35" />
            <circle cx="900" cy="260" r="22" fill="#1dd3b0" fillOpacity="0.35" />
            <path d="M720 320h220" stroke="#9ef01a" strokeWidth="6" strokeLinecap="round" />
          </g>
          <text x="80" y="720" fill="#e2e8f0" fontFamily="Arial, sans-serif" fontSize="28" letterSpacing="4">
            CONNECT & CARE
          </text>
        </svg>
      </div>

      <ScrollLoad minHeight={320}>
      <div className="grid gap-5 sm:grid-cols-2">
        {channels.map((channel) => (
          <a
            key={channel.label}
            className="glass block rounded-2xl border border-white/10 p-5"
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-lime-200">{channel.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{channel.detail}</p>
            <p className="mt-2 text-sm text-slate-300">Free resources and quick replies from the community team.</p>
          </a>
        ))}
      </div>
      </ScrollLoad>
    </div>
  );
}
