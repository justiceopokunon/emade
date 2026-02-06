"use client";

import { teamMembers } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ScrollLoad } from "@/components/ScrollLoad";

export default function TeamPage() {
  const [members, setMembers] = useState(teamMembers);

  useEffect(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.teamMembers && Array.isArray(data.teamMembers)) {
          setMembers(data.teamMembers);
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
            alt="E-Made logo"
            width={72}
            height={72}
            className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Stewards</p>
            <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">People behind the lab.</h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-200">
              We center health, dignity, and environmental justice while building practical tools for safer e-waste handling.
            </p>
          </div>
        </div>
        <Link className="btn-ghost" href="/" aria-label="Navigate back to homepage">
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

      <ScrollLoad minHeight={360}>
      <div className="grid gap-6 sm:grid-cols-2">
        {members.map((member) => (
          <div
            key={member.name}
            className="glass relative rounded-3xl border border-white/10 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-lime-300/60 via-purple-500/40 to-emerald-400/50 text-sm font-semibold text-white">
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      quality={50}
                    />
                  ) : (
                    member.avatar
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{member.name}</h2>
                  <p className="text-sm text-lime-200">{member.role}</p>
                </div>
              </div>
              <span className="chip bg-white/10 text-xs uppercase tracking-[0.2em] text-slate-200">
                Steward
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{member.focus}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
              {member.socials?.map((social) => (
                <a
                  key={social.label}
                  className="chip bg-white/10 hover:border-white/40"
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      </ScrollLoad>
    </div>
  );
}
