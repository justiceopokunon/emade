"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  stats as defaultStats,
  diyProjects as defaultDiyProjects,
  stories as defaultStories,
  teamMembers as defaultTeamMembers,
  galleryContent as defaultGalleryContent,
  galleryTiles as defaultGalleryTiles,
  submitCta as defaultSubmitCta,
} from "@/lib/data";

export type PreviewSection =
  | "hero"
  | "stats"
  | "slideshows"
  | "gallery"
  | "stories"
  | "diy"
  | "team"
  | "submit-cta";

type PreviewData = {
  heroMessage?: string;
  stories?: typeof defaultStories;
  diyProjects?: typeof defaultDiyProjects;
  teamMembers?: typeof defaultTeamMembers;
  stats?: typeof defaultStats;
  galleryContent?: typeof defaultGalleryContent;
  galleryTiles?: typeof defaultGalleryTiles;
  ewasteImages?: string[];
  storyImages?: string[];
  submitCta?: typeof defaultSubmitCta;
};

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  section: PreviewSection;
  data: PreviewData;
}

export default function AdminPreviewModal({ open, onClose, section, data }: PreviewModalProps) {
  const availableSections = useMemo(() => {
    const entries: Array<{ id: PreviewSection; label: string; enabled: boolean }> = [
      { id: "hero", label: "Hero", enabled: Boolean(data.heroMessage) },
      { id: "stats", label: "Stats", enabled: Array.isArray(data.stats) && data.stats.length > 0 },
      {
        id: "slideshows",
        label: "Slideshows",
        enabled: (data.ewasteImages?.length ?? 0) > 0 || (data.storyImages?.length ?? 0) > 0,
      },
      {
        id: "gallery",
        label: "Gallery",
        enabled: Boolean(data.galleryContent) || (data.galleryTiles?.length ?? 0) > 0,
      },
      { id: "stories", label: "Stories", enabled: (data.stories?.length ?? 0) > 0 },
      { id: "diy", label: "DIY", enabled: (data.diyProjects?.length ?? 0) > 0 },
      { id: "team", label: "Team", enabled: (data.teamMembers?.length ?? 0) > 0 },
      { id: "submit-cta", label: "Submit CTA", enabled: Boolean(data.submitCta) },
    ];
    return entries.filter((item) => item.enabled);
  }, [data]);

  const [activeSection, setActiveSection] = useState<PreviewSection>(section);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    setActiveSection(section);
  }, [section]);

  useEffect(() => {
    if (availableSections.length === 0) return;
    if (!availableSections.some((item) => item.id === activeSection)) {
      setActiveSection(availableSections[0].id);
    }
  }, [availableSections, activeSection]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "ADMIN_PREVIEW_READY") {
        setIframeReady(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      setIframeReady(false);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setIframeReady(false);
    }
  }, [open]);

  const postPreviewUpdate = useCallback(() => {
    const target = iframeRef.current?.contentWindow;
    if (!target) return;
    target.postMessage(
      {
        type: "ADMIN_PREVIEW_UPDATE",
        section: activeSection,
        data,
      },
      window.location.origin
    );
  }, [activeSection, data]);

  useEffect(() => {
    if (!open || !iframeReady) return;
    postPreviewUpdate();
  }, [open, iframeReady, postPreviewUpdate]);

  const activeLabel = availableSections.find((item) => item.id === activeSection)?.label ?? "Preview";
  if (!open) return null;

  const sectionToPath: Record<PreviewSection, string> = {
    hero: "/",
    stats: "/",
    slideshows: "/",
    gallery: "/gallery",
    stories: "/stories",
    diy: "/diy",
    team: "/team",
    "submit-cta": "/contact",
  };
  const livePath = sectionToPath[activeSection] ?? "/";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="glass relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--panel)] border-b border-white/10 p-4 sm:p-6 backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Preview</p>
            <h2 className="text-xl font-semibold text-white">{activeLabel}</h2>
          </div>
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {availableSections.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  activeSection === item.id
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={livePath}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost btn-sm"
            >
              View live
            </Link>
            <button onClick={onClose} className="btn-ghost btn-sm">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-6 space-y-4">
          {availableSections.length > 1 && (
            <div className="sm:hidden">
              <label className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Switch preview
              </label>
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value as PreviewSection)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
              >
                {availableSections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <iframe
              title={`${activeLabel} preview`}
              ref={iframeRef}
              src="/admin/preview"
              className="h-[72vh] w-full"
              loading="lazy"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 bg-[var(--panel)] border-t border-white/10 p-4 sm:p-6 backdrop-blur-sm">
          <button onClick={onClose} className="btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
