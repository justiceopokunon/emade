"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { stories as fallbackStories } from "@/lib/data";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeSlug = (value: string) => slugify(decodeURIComponent(value).trim());

export default function StoryDetailPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const [storyList, setStoryList] = useState(fallbackStories);
  const [chatName, setChatName] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { id: string; name: string; message: string; at: string }[]
  >([]);

  useEffect(() => {
    let active = true;
    fetch("/api/stories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : fallbackStories))
      .then((data) => {
        if (active && Array.isArray(data)) setStoryList(data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const story = useMemo(() => {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) return undefined;
    const target = normalizeSlug(slugParam);
    return storyList.find((item) => {
      const title = typeof item.title === "string" ? item.title : "";
      const slug = typeof item.slug === "string" ? item.slug : "";
      return normalizeSlug(slug || title) === target;
    });
  }, [storyList, params?.slug]);

  useEffect(() => {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) return;
    const key = `story-chat:${normalizeSlug(slugParam)}`;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setChatMessages(parsed);
      }
    } catch {
      setChatMessages([]);
    }
  }, [params?.slug]);

  const submitChat = () => {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) return;
    if (!chatMessage.trim()) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: chatName.trim() || "Anonymous",
      message: chatMessage.trim(),
      at: new Date().toISOString(),
    };
    const next = [entry, ...chatMessages].slice(0, 100);
    setChatMessages(next);
    setChatMessage("");
    const key = `story-chat:${normalizeSlug(slugParam)}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      undefined;
    }
  };

  if (!story) {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 pb-20 pt-16 sm:px-8">
        <Link className="btn-ghost w-fit" href="/stories">
          Back to community stories
        </Link>
        <div className="glass rounded-3xl border border-white/10 p-6">
          <h1 className="text-2xl font-semibold text-white">Story not found</h1>
          <p className="mt-2 text-sm text-slate-300">
            This story may have been renamed or archived by a local steward.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 pb-20 pt-16 sm:px-8">
      <Link className="btn-ghost w-fit" href="/stories">
        Back to community stories
      </Link>

      <motion.article
        className="glass relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-lime-200">
          <span>{story.category}</span>
          <span className="text-slate-600">•</span>
          <span>{story.time}</span>
          {story.status && (
            <span className="chip bg-white/10 text-[10px] uppercase tracking-[0.2em] text-slate-200">
              {story.status}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{story.title}</h1>
        <p className="mt-3 text-lg text-slate-200">{story.excerpt}</p>

        {story.imageUrl && (
          <div className="mt-6 h-56 w-full overflow-hidden rounded-2xl border border-white/10">
            <img
              src={story.imageUrl}
              alt={`${story.title} cover`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="mt-6 space-y-4 text-sm text-slate-300">
          {story.body.split("\n").map((paragraph, idx) => (
            <p key={`p-${idx}`} className="text-sm text-slate-300">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
          <span>{story.author}</span>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {story.tags.map((tag) => (
              <span key={tag} className="chip bg-white/10 text-slate-100">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link className="btn-ghost" href="/stories">
            More stories
          </Link>
        </div>
      </motion.article>

      <section className="glass rounded-3xl border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Story chat</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Community responses</h2>
          </div>
          <span className="chip bg-white/10 text-xs text-slate-200">
            Local-only
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Share reactions and local tips. Messages are stored in your browser for now.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
            placeholder="Your name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70"
            placeholder="Write a response"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitChat();
              }
            }}
          />
          <button type="button" className="btn-primary" onClick={submitChat}>
            Post
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {chatMessages.length === 0 && (
            <p className="text-sm text-slate-400">No comments yet. Start the conversation.</p>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{msg.name}</span>
                <span>{new Date(msg.at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-200">{msg.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
