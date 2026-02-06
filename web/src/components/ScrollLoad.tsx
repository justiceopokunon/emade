"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface ScrollLoadProps {
  children: ReactNode;
  rootMargin?: string;
  once?: boolean;
  minHeight?: number;
  className?: string;
}

export function ScrollLoad({
  children,
  rootMargin = "0px 0px -10% 0px",
  once = true,
  minHeight = 240,
  className,
}: ScrollLoadProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldRender(true);
            setHasIntersected(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setShouldRender(false);
          }
        });
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  const visible = once ? hasIntersected : shouldRender;

  return (
    <div
      ref={containerRef}
      className={`scrollload ${visible ? "scrollload-visible" : "scrollload-hidden"} ${className ?? ""}`}
    >
      {shouldRender ? children : <div style={{ minHeight }} className="w-full" />}
    </div>
  );
}
