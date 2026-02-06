"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  section: string;
  data: {
    heroMessage?: string;
    stories?: any[];
    diyProjects?: any[];
    teamMembers?: any[];
    stats?: any[];
    galleryContent?: any;
    galleryTiles?: any[];
    ewasteImages?: string[];
    storyImages?: string[];
    submitCta?: any;
  };
}

export default function AdminPreviewModal({ open, onClose, section, data }: PreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass relative w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--panel)] border-b border-white/10 p-4 sm:p-6 backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Live Preview</p>
            <h2 className="text-xl font-semibold text-white capitalize">{section}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:border-white/40 hover:bg-white/20"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-4 sm:p-8 space-y-8">
          {/* Hero Preview */}
          {section === "hero" && data.heroMessage && (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">Hero Message Preview</p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <p className="text-3xl font-bold text-white leading-tight">{data.heroMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stories Preview */}
          {section === "stories" && data.stories && data.stories.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Stories Preview ({data.stories.length})</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.stories.map((story, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition">
                    {story.imageUrl ? (
                      <div className="relative h-40 w-full bg-slate-900">
                        <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23333' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23666'%3EImage not found%3C/text%3E%3C/svg%3E"}} />
                      </div>
                    ) : (
                      <div className="h-40 w-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                        No image
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs uppercase text-slate-400 mb-1">{story.category}</p>
                      <h3 className="font-semibold text-white text-sm mb-2">{story.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-2">{story.excerpt}</p>
                      <p className="text-xs text-slate-500 mt-2">{story.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIY Preview */}
          {section === "diy" && data.diyProjects && data.diyProjects.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">DIY Guides Preview ({data.diyProjects.length})</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.diyProjects.map((project, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition">
                    {project.imageUrl ? (
                      <div className="relative h-40 w-full bg-slate-900">
                        <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23333' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23666'%3EImage not found%3C/text%3E%3C/svg%3E"}} />
                      </div>
                    ) : (
                      <div className="h-40 w-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                        No image
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-white text-sm mb-2">{project.name}</h3>
                      <div className="flex gap-2 text-xs text-slate-400 mb-2">
                        <span>⏱ {project.time}</span>
                        <span>📊 {project.difficulty}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{project.outcome}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Preview */}
          {section === "team" && data.teamMembers && data.teamMembers.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Team Members Preview ({data.teamMembers.length})</p>
              <div className="grid gap-6 sm:grid-cols-2">
                {data.teamMembers.map((member, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center hover:border-white/20 transition">
                    {member.imageUrl ? (
                      <div className="relative h-32 w-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/20 bg-slate-900">
                        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Ccircle cx='64' cy='64' r='64' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%23666'%3ENo image%3C/text%3E%3C/svg%3E"}} />
                      </div>
                    ) : (
                      <div className="h-32 w-32 mx-auto mb-4 rounded-full bg-slate-900 flex items-center justify-center border-2 border-white/20 text-xs text-slate-500">
                        No avatar
                      </div>
                    )}
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-lime-300 mt-1">{member.role}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{member.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Preview */}
          {section === "stats" && data.stats && data.stats.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Stats Preview</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {data.stats.map((stat, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center hover:border-white/20 transition">
                    <p className="text-3xl font-bold text-lime-300">{stat.value}</p>
                    <p className="text-sm text-white mt-2 font-medium">{stat.label}</p>
                    <p className="text-xs text-slate-400 mt-2">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Preview */}
          {section === "gallery" && data.galleryContent && (
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-3">Gallery Hero</p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">{data.galleryContent.hero?.eyebrow}</p>
                  <h3 className="text-3xl font-bold text-white mb-3">{data.galleryContent.hero?.title}</h3>
                  <p className="text-slate-300">{data.galleryContent.hero?.description}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-3">Gallery Sections</p>
                <div className="grid gap-4">
                  {data.galleryContent.sections?.map((section: any, idx: number) => (
                    <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">{section.eyebrow}</p>
                      <h4 className="text-lg font-semibold text-white mb-2">{section.title}</h4>
                      <p className="text-sm text-slate-300">{section.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {data.galleryTiles && data.galleryTiles.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-3">Gallery Tiles Grid ({data.galleryTiles.length})</p>
                  <div className="grid auto-rows-[120px] gap-3 sm:auto-rows-[150px] sm:grid-cols-6">
                    {data.galleryTiles.map((tile, idx) => {
                      const tileSizeClasses: Record<string, string> = {
                        square: "col-span-1 row-span-1",
                        landscape: "col-span-2 row-span-1",
                        portrait: "col-span-1 row-span-2",
                        spotlight: "col-span-2 row-span-2",
                      };
                      return (
                        <div
                          key={idx}
                          className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition ${tileSizeClasses[tile.size] || tileSizeClasses.square}`}
                        >
                          {tile.src && tile.src.trim() ? (
                            <img src={tile.src} alt={tile.title || "Gallery tile"} className="h-full w-full object-cover" onError={(e) => {e.currentTarget.style.display = "none"}} />
                          ) : null}
                          {!tile.src || !tile.src.trim() ? (
                            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-500 bg-slate-900">
                              No image
                            </div>
                          ) : null}
                          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3">
                            {tile.title && <p className="text-xs font-semibold text-white line-clamp-1">{tile.title}</p>}
                            {tile.description && <p className="mt-1 text-[10px] text-slate-200 line-clamp-1">{tile.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Slideshows Preview */}
          {section === "slideshows" && (
            <div className="space-y-8">
              {data.ewasteImages && data.ewasteImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">E-Waste Slideshow ({data.ewasteImages.length})</p>
                  <div className="grid gap-3">
                    {data.ewasteImages.map((url, idx) => (
                      <div key={idx} className="relative h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                        {url && url.trim() ? (
                          <img src={url} alt={`E-waste ${idx}`} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.style.display = "none"}} />
                        ) : null}
                        {!url || !url.trim() ? (
                          <div className="flex h-full items-center justify-center text-sm text-slate-500">
                            Image {idx + 1} - No URL
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.storyImages && data.storyImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Story Slideshow ({data.storyImages.length})</p>
                  <div className="grid gap-3">
                    {data.storyImages.map((url, idx) => (
                      <div key={idx} className="relative h-48 w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                        {url && url.trim() ? (
                          <img src={url} alt={`Story ${idx}`} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.style.display = "none"}} />
                        ) : null}
                        {!url || !url.trim() ? (
                          <div className="flex h-full items-center justify-center text-sm text-slate-500">
                            Image {idx + 1} - No URL
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit CTA Preview */}
          {section === "submit-cta" && data.submitCta && (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Submit CTA Preview</p>
              <div className="rounded-2xl border border-lime-400/20 bg-lime-400/5 p-8 text-center">
                <h3 className="text-2xl font-bold text-white">{data.submitCta.title}</h3>
                <p className="text-slate-300 mt-3">{data.submitCta.description}</p>
                <button className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-lime-400 to-lime-300 text-black font-semibold transition hover:shadow-lg hover:shadow-lime-400/50">
                  {data.submitCta.buttonText}
                </button>
                <p className="text-sm text-slate-400 mt-4">{data.submitCta.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 bg-[var(--panel)] border-t border-white/10 p-4 sm:p-6 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-white/20 bg-white/10 text-white transition hover:border-white/40 hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
