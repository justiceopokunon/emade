import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { AnimatedSection } from "@/components/AnimatedSection";
import { InteractiveCard } from "@/components/InteractiveCard";
import { AnimatedStatCard } from "@/components/AnimatedStatCard";
import { ParallaxSection, FloatingElement } from "@/components/ParallaxSection";
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
        <AnimatedSection animation="fade" className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-10 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.8)] sm:px-8 sm:py-12">
          <FloatingElement duration={4} className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
          <FloatingElement duration={5} delay={1} className="absolute -right-20 -bottom-28 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <AnimatedSection animation="slide-up" delay={100}>
                <div className="chip text-xs uppercase tracking-[0.28em] text-lime-200">
                  Reduce. Reuse. Recycle
                </div>
              </AnimatedSection>
              <AnimatedSection animation="slide-up" delay={200}>
                <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                  Safer e-waste, stronger communities.
                </h1>
              </AnimatedSection>
              <AnimatedSection animation="slide-up" delay={300}>
                <p className="max-w-2xl text-lg text-slate-200">{heroCopy}</p>
              </AnimatedSection>
              <AnimatedSection animation="slide-up" delay={400}>
                <div className="flex flex-wrap gap-3">
                  <Link className="btn-primary hover-lift" href="/diy">
                    Open the DIY safety kit
                  </Link>
                  <Link className="btn-ghost hover-lift" href="/stories">
                    Read local stories
                  </Link>
                  <Link className="btn-ghost hover-lift" href="/admin" prefetch={false}>
                    Stewardship console
                  </Link>
                </div>
              </AnimatedSection>
              <div className="grid gap-4 sm:grid-cols-3">
                {statsData.map((stat, index) => (
                  <AnimatedStatCard 
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    detail={stat.detail}
                    index={index}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <AnimatedSection animation="slide-left" delay={200}>
                <div className="chip w-fit bg-white/10 text-lime-200">Field notes + workshops</div>
              </AnimatedSection>
              <AnimatedSection animation="slide-left" delay={300}>
                <div className="glass relative flex flex-col gap-5 rounded-2xl p-6">
                  <ParallaxSection speed={0.3}>
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
                  </ParallaxSection>
                  <div className="space-y-4 text-sm text-slate-200">
                    {[
                      { color: "bg-lime-400", title: "Battery safety pop-ups", desc: "Hands-on coaching to identify, isolate, and store damaged cells.", delay: 400 },
                      { color: "bg-emerald-300", title: "Data wipe clinics", desc: "Families learning secure erase before reuse or recycling.", delay: 500 },
                      { color: "bg-purple-400", title: "Certified drop-off mapping", desc: "Neighborhood lists verified with trusted recyclers.", delay: 600 }
                    ].map((item) => (
                      <AnimatedSection key={item.title} animation="slide-left" delay={item.delay}>
                        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.color} animate-pulse-glow`} />
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-slate-400">{item.desc}</p>
                          </div>
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="slide-left" delay={700}>
                <Link className="btn-primary hover-lift" href="/stories">
                  Explore community signals
                </Link>
              </AnimatedSection>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="slide-up">
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">DIY lab</p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">Local playbooks for safe handling</h2>
              </div>
              <Link className="btn-ghost hover-lift" href="/diy">
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
              {projects.map((project, index) => (
                <AnimatedSection key={project.name} animation="scale" delay={index * 100}>
                  <Link href="/diy" className="block h-full">
                    <InteractiveCard className="h-full">
                      <div className="glass relative h-full overflow-hidden rounded-2xl border border-white/10 p-5 card-interactive">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {project.imageUrl && (
                          <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
                            <Image
                              src={project.imageUrl}
                              alt={`${project.name} guide cover`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
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
                    </InteractiveCard>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection animation="slide-up">
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Community signals</p>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">Stories, safety tips, and local action</h2>
              </div>
              <Link className="btn-ghost hover-lift" href="/stories">
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
              {storyList.slice(0, 3).map((story, index) => (
                <AnimatedSection key={story.slug} animation="fade" delay={index * 150}>
                  <Link href={`/stories/${story.slug}`} className="block h-full">
                    <InteractiveCard className="h-full">
                      <article className="glass relative flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-white/10 p-5 card-interactive">
                        <div className="space-y-3">
                          {story.imageUrl && (
                            <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
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
                    </InteractiveCard>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection animation="scale">
          <section className="glass relative overflow-hidden rounded-3xl border border-lime-400/20 p-8 gradient-animate-bg">
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
                className="btn-primary whitespace-nowrap flex items-center gap-2 hover-lift"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {submitCta.buttonText}
              </a>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection animation="slide-up">
          <section className="glass relative overflow-hidden rounded-3xl border border-white/10 p-8">
            <FloatingElement duration={6} className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-emerald-400/10" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Stewardship console</p>
                <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                  Keep the guidance accurate, humane, and local.
                </h2>
                <p className="mt-3 text-lg text-slate-200">
                  Update playbooks, safety checklists, and community stories so neighbors can handle devices without harm.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="btn-primary hover-lift" href="/admin" prefetch={false}>
                    Enter console
                  </Link>
                  <Link className="btn-ghost hover-lift" href="/team">
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
                ].map((item, index) => (
                  <AnimatedSection key={item} animation="scale" delay={index * 100}>
                    <div className="glass rounded-2xl border border-white/10 p-5 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover-scale">
                      <p className="text-sm text-slate-200">{item}</p>
                      <p className="text-xs text-slate-400">Editable in the admin console with safety checks.</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      </main>

      <AnimatedSection animation="fade">
        <footer className="mx-auto mt-12 w-full max-w-6xl rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-sm text-slate-400 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-white font-semibold">E-Made Community Lab</p>
              <p className="text-slate-400">Human-first education on e-waste safety, repair, and responsible recycling. Every guide ships free and printable.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs uppercase tracking-[0.25em] text-slate-300 sm:flex sm:gap-3">
              <Link href="/stories" className="whitespace-nowrap hover:text-lime-300 transition-colors">Forum</Link>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <Link href="/diy" className="whitespace-nowrap hover:text-lime-300 transition-colors">DIY</Link>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <Link href="/gallery" className="whitespace-nowrap hover:text-lime-300 transition-colors">Gallery</Link>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <Link href="/team" className="whitespace-nowrap hover:text-lime-300 transition-colors">Team</Link>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <Link href="/contact" className="whitespace-nowrap hover:text-lime-300 transition-colors">Contact</Link>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <Link href="/admin" prefetch={false} className="whitespace-nowrap hover:text-lime-300 transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </AnimatedSection>
    </div>
  );
}
