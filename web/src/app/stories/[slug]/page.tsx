"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { stories as fallbackStories } from "@/lib/data";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeSlug = (value: string) => slugify(decodeURIComponent(value).trim());

interface ChatMessage {
  id: string;
  storySlug: string;
  name: string;
  message: string;
  at: string;
  reactions?: { [key: string]: number };
  replyTo?: string;
  status?: "pending" | "approved" | "flagged";
  storage?: string;
}

const REACTION_OPTIONS = [
  { emoji: "👍", label: "Helpful" },
  { emoji: "❤️", label: "Supportive" },
  { emoji: "✅", label: "Verified" },
];

export default function StoryDetailPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const [storyList, setStoryList] = useState(fallbackStories);
  const [chatName, setChatName] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());

  // Fetch stories
  useEffect(() => {
    let active = true;
    fetch("/api/stories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : fallbackStories))
      .then((data) => {
        if (active && Array.isArray(data)) {
          const normalized = data.map((item: any) => ({
            ...item,
            pdfUrl: item?.pdfUrl ?? "",
          }));
          setStoryList(normalized);
        }
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

  // Fetch chat messages
  const fetchChat = async () => {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) return;

    const normalizedSlug = normalizeSlug(slugParam);
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/chats?storySlug=${encodeURIComponent(normalizedSlug)}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(Array.isArray(data) ? data : []);
        setError("");
        setLastUpdate(Date.now());
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      setError("Connection error - messages may be delayed");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch chat on mount and set up polling
  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 4000); // Poll every 4 seconds
    return () => clearInterval(interval);
  }, [params?.slug]);

  const submitChat = async () => {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) return;
    if (!chatMessage.trim()) return;

    const normalizedSlug = normalizeSlug(slugParam);
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug: normalizedSlug,
          name: chatName.trim() || "Anonymous",
          message: chatMessage.trim(),
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setChatMessages((prev) => [newMessage, ...prev].slice(0, 200));
        setChatMessage("");
        setChatName("");
        setLastUpdate(Date.now());
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to post message");
      }
    } catch (err) {
      setError("Connection error - message may not have posted");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slugParam) return;

    const normalizedSlug = normalizeSlug(slugParam);
    const reactionKey = `${messageId}-${emoji}`;

    // Prevent duplicate clicking
    if (userReactions.has(reactionKey)) return;
    setUserReactions((prev) => new Set([...prev, reactionKey]));

    try {
      const res = await fetch("/api/chats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug: normalizedSlug,
          messageId,
          reaction: emoji,
        }),
      });

      if (res.ok) {
        await fetchChat();
      } else {
        setUserReactions((prev) => {
          const next = new Set(prev);
          next.delete(reactionKey);
          return next;
        });
      }
    } catch (err) {
      setUserReactions((prev) => {
        const next = new Set(prev);
        next.delete(reactionKey);
        return next;
      });
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

      <article className="glass relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8">
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
          <div className="relative mt-6 h-56 w-full overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={story.imageUrl}
              alt={`${story.title} cover`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              quality={50}
              priority
            />
          </div>
        )}

        <div className="mt-6 space-y-4 text-sm text-slate-300">
          {(typeof story.body === "string" ? story.body : "")
            .split("\n")
            .map((paragraph, idx) => (
            <p key={`p-${idx}`} className="text-sm text-slate-300">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
          <span>{story.author}</span>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {(Array.isArray(story.tags) ? story.tags : []).map((tag) => (
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
          {story.pdfUrl && (
            <a
              className="btn-ghost"
              href={story.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          )}
        </div>
      </article>

      <section className="glass rounded-3xl border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">Story chat</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Community responses</h2>
          </div>
          <span className="chip bg-white/10 text-xs text-slate-200">
            {isLoading ? "Loading..." : isSubmitting ? "Submitting..." : "Live"}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Share reactions and responses with other community members. Messages appear in real-time across all visitors.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-red-400/50 bg-red-900/20 p-3 text-xs text-red-200">
            ⚠️ {error}
          </div>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <input
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70 disabled:opacity-50"
            placeholder="Your name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            disabled={isSubmitting}
          />
          <input
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-400/70 disabled:opacity-50"
            placeholder="Write a response"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSubmitting) {
                e.preventDefault();
                submitChat();
              }
            }}
            disabled={isSubmitting}
          />
          <button 
            type="button" 
            className="btn-primary disabled:opacity-50" 
            onClick={submitChat}
            disabled={isSubmitting || !chatMessage.trim()}
          >
            {isSubmitting ? "..." : "Post"}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {chatMessages.length === 0 && !isLoading && (
            <p className="text-sm text-slate-400">No comments yet. Be the first to share your thoughts.</p>
          )}
          {isLoading && chatMessages.length === 0 && (
            <p className="text-sm text-slate-400">Loading comments...</p>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold text-slate-100">{msg.name}</h3>
                  <p className="text-xs text-slate-500">
                    {new Date(msg.at).toLocaleString()}
                  </p>
                </div>
                {msg.status === "flagged" && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded">
                    ⚠️ Under review
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-200 leading-relaxed">{msg.message}</p>
              
              {/* Reactions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {REACTION_OPTIONS.map((reaction) => {
                  const count = msg.reactions?.[reaction.emoji] || 0;
                  const hasReacted = userReactions.has(`${msg.id}-${reaction.emoji}`);
                  return (
                    <button
                      key={reaction.emoji}
                      onClick={() => addReaction(msg.id, reaction.emoji)}
                      disabled={hasReacted}
                      title={reaction.label}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition ${
                        hasReacted
                          ? "bg-lime-400/20 text-lime-200 cursor-not-allowed"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 active:scale-95"
                      }`}
                    >
                      <span className="text-sm">{reaction.emoji}</span>
                      {count > 0 && <span>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {chatMessages.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
