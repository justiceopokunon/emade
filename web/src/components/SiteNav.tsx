"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeProvider";
import { navItems as defaultNavItems } from "@/lib/data";

export function SiteNav() {
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState(defaultNavItems);
  const [siteName, setSiteName] = useState("E-MADE");
  const [siteTagline, setSiteTagline] = useState("Reduce. Reuse. Recycle");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollRef = useRef(0);
  useEffect(() => {
    let active = true;
    fetch("/api/site", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (typeof data.siteName === "string" && data.siteName.trim()) {
          setSiteName(data.siteName.trim());
        }
        if (typeof data.siteTagline === "string" && data.siteTagline.trim()) {
          setSiteTagline(data.siteTagline.trim());
        }
        if (Array.isArray(data.navItems) && data.navItems.length > 0) {
          setNavItems(data.navItems);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      const last = lastScrollRef.current;
      const delta = current - last;
      lastScrollRef.current = current;

      if (current < last) {
        setIsVisible(true);
        return;
      }

      if (current <= 120) {
        setIsVisible(true);
        return;
      }

      if (delta > 2) {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) setIsVisible(true);
  }, [menuOpen]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 w-full px-4 pt-4 sm:px-8 transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-70"
        }`}
      >
        <header className="flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_20px_60px_-34px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="animate-pulse-glow">
            <Image
              src="/logo.png"
              alt="E-MADE logo"
              width={60}
              height={60}
              className="object-contain drop-shadow-[0_12px_30px_rgba(158,240,26,0.45)] saturate-150 transition-transform duration-300 hover:scale-110"
              priority
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-300">{siteTagline}</p>
            <p className="text-lg font-semibold text-white truncate max-w-[160px] sm:max-w-none">{siteName}</p>
          </div>
        </div>
        <nav className="hidden items-center gap-3 text-sm font-medium text-slate-200 sm:flex sm:flex-1 sm:justify-end sm:flex-wrap">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link className="btn-ghost hover-lift" href={item.href}>
                {item.label}
              </Link>
            </div>
          ))}
          <div>
            <Link className="btn-primary hover-lift" href="/admin" aria-label="Open admin deck">
              Admin deck
            </Link>
          </div>
          <ThemeToggle />
        </nav>
        <div className="flex items-center gap-3 sm:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle navigation menu"
            className="rounded-full border border-white/20 bg-white/10 p-3 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`mt-1 block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`mt-1 block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
        </header>
        {menuOpen && (
          <div className="sm:hidden animate-[fade-in-up_0.3s_ease-out]">
            <div className="mx-auto mt-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.7)] backdrop-blur-md">
              <div className="flex flex-col gap-3 text-sm font-medium text-slate-200">
                {navItems.map((item, index) => (
                  <div
                    key={item.label}
                    className="animate-[slide-in-left_0.3s_ease-out]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      className="btn-ghost w-full justify-start hover-scale"
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
                <div
                  className="animate-[bounce-in_0.5s_ease-out]"
                  style={{ animationDelay: `${navItems.length * 50}ms` }}
                >
                  <Link
                    className="btn-primary w-full justify-center hover-lift"
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin deck
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      
      </div>
      <div className="header-spacer w-full" aria-hidden="true" />
    </>
  );
}
