import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import {
  stats,
  stories,
  diyProjects,
  ewasteImages as defaultEwasteImages,
  storyImages as defaultStoryImages,
  submitCta as defaultSubmitCta,
} from "@/lib/data";

type SiteData = {
  heroMessage?: string;
  stats?: typeof stats;
  ewasteImages?: string[];
  storyImages?: string[];
  submitCta?: Partial<typeof defaultSubmitCta>;
};

const heroFallback =
  "E-MADE is a youth-led initiative that tackles the growing crisis of electronic waste by collecting, safely recycling, and repurposing discarded electronics. The project reduces toxic pollution from improper dumping and burning of e-waste while transforming valuable components into new products for community use. Through public education, hands-on innovation, and responsible recycling practices, E-MADE protects human health, creates green skills for young people, and promotes a circular economy where electronics are reused instead of wasted.";

const getApiBase = async () => {
  const host = (await headers()).get("host");
  if (!host) return "https://emade.social";
  const protocol = process.env.VERCEL ? "https" : "http";
  return `${protocol}://${host}`;
};

const fetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
};

export default async function Home() {
  const apiBase = await getApiBase();
  const siteData = await fetchJson<SiteData>(`${apiBase}/api/site`, {} as SiteData);
  const storyList = await fetchJson<typeof stories>(`${apiBase}/api/stories`, stories);
  const projects = await fetchJson<typeof diyProjects>(`${apiBase}/api/diy`, diyProjects);
  const heroCopy = typeof siteData.heroMessage === "string" ? siteData.heroMessage : heroFallback;
  const statsData = Array.isArray(siteData.stats) ? siteData.stats : stats;
  const ewasteImages = Array.isArray(siteData.ewasteImages) && siteData.ewasteImages.length > 0
    ? siteData.ewasteImages
    : defaultEwasteImages;
  const storyImages = Array.isArray(siteData.storyImages) && siteData.storyImages.length > 0
    ? siteData.storyImages
    : defaultStoryImages;
  const submitCta = { ...defaultSubmitCta, ...(siteData.submitCta ?? {}) };
  const ewasteHero = ewasteImages[0];
  const storyHero = storyImages[0];

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
                {statsData.map((stat) => (
                  <div
                    key={stat.label}
                    className="glass relative overflow-hidden rounded-2xl p-4"
                  >
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

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">DIY lab</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Local playbooks for safe handling</h2>
            </div>
            <Link className="btn-ghost" href="/diy">
              View all playbooks
            </Link>
          </div>
          <div className="slideshow relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-56 lg:h-64">
            {ewasteImages.slice(0, 3).map((src, idx) => (
              <Image
                key={idx}
                src={src}
                alt="E-waste education"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={50}
                priority={idx === 0}
              />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.name} href="/diy" className="h-full">
                <div className="glass group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 p-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0" />
                  {project.imageUrl && (
                    <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                      <Image
                        src={project.imageUrl}
                        alt={`${project.name} guide cover`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        quality={50}
                      />
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-[0.28em] text-lime-200">{project.difficulty}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{project.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">{project.outcome}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-200">
                    <span>{project.time}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community signals</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Stories, safety tips, and local action</h2>
            </div>
            <Link className="btn-ghost" href="/stories">
              Visit the forum
            </Link>
          </div>
          <div className="slideshow relative h-48 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:h-56 lg:h-64">
            {storyImages.slice(0, 3).map((src, idx) => (
              <Image
                key={idx}
                src={src}
                alt="Story highlights"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
                quality={50}
                priority={idx === 0}
              />
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {storyList.slice(0, 3).map((story) => (
              <Link key={story.slug} href={`/stories/${story.slug}`} className="h-full">
                <article className="glass relative flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-white/10 p-5">
                  <div className="space-y-3">
                    {story.imageUrl && (
                      <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                        <Image
                          src={story.imageUrl}
                          alt={`${story.title} cover`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          quality={50}
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
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass relative overflow-hidden rounded-3xl border border-lime-400/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-lime-500/10 via-transparent to-emerald-400/10" />
          <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-lime-300">Community contributions</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {submitCta.title}
              </h2>
              <p className="mt-2 text-slate-300">
                {submitCta.description}
              </p>
            </div>
            <a
              href={`mailto:${submitCta.email}?subject=E-Made Submission`}
              className="btn-primary whitespace-nowrap flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {submitCta.buttonText}
            </a>
          </div>
        </section>

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
                <Link className="btn-primary transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]" href="/admin" prefetch={false}>
                  Enter console
                </Link>
                <Link className="btn-ghost transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" href="/team">
                  Meet the team
                </Link>
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
      </main>

      <footer className="mx-auto mt-12 w-full max-w-6xl rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-slate-400">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-white">E-Made Community Lab</p>
            <p className="text-slate-400">Human-first education on e-waste safety, repair, and responsible recycling. Every guide ships free and printable.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs uppercase tracking-[0.25em] text-slate-300 sm:flex sm:gap-3">
            <Link href="/stories" className="whitespace-nowrap hover:text-lime-300">Forum</Link>
            <span className="hidden text-slate-600 sm:inline">•</span>
            <Link href="/diy" className="whitespace-nowrap hover:text-lime-300">DIY</Link>
            <span className="hidden text-slate-600 sm:inline">•</span>
            <Link href="/gallery" className="whitespace-nowrap hover:text-lime-300">Gallery</Link>
            <span className="hidden text-slate-600 sm:inline">•</span>
            <Link href="/team" className="whitespace-nowrap hover:text-lime-300">Team</Link>
            <span className="hidden text-slate-600 sm:inline">•</span>
            <Link href="/contact" className="whitespace-nowrap hover:text-lime-300">Contact</Link>
            <span className="hidden text-slate-600 sm:inline">•</span>
            <Link href="/admin" prefetch={false} className="whitespace-nowrap hover:text-lime-300">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
