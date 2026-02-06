"use client";

import { motion } from "framer-motion";
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
    <motion.div
      ref={containerRef}
      className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 32 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {shouldRender ? children : <div style={{ minHeight }} className="w-full" />}
    </motion.div>
  );
}
