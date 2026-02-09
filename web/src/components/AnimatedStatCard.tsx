"use client";

import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  index: number;
}

export function AnimatedStatCard({ label, value, detail, index }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Extract numeric value
    const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
    const suffix = value.replace(/[\d,]/g, "");
    
    if (numericValue === 0) {
      setDisplayValue(value);
      return;
    }

    let startTime: number | null = null;
    const duration = 2000;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * numericValue);
      
      setDisplayValue(current.toLocaleString() + suffix);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className="glass group relative overflow-hidden rounded-2xl p-4 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
      style={{ 
        transitionDelay: `${index * 100}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
      }}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-lime-400/20 to-emerald-400/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
      <p className="relative text-sm text-slate-300">{label}</p>
      <p className="relative mt-1 text-3xl font-semibold text-white transition-all duration-300">
        {displayValue}
      </p>
      <p className="relative mt-1 text-sm text-slate-400">{detail}</p>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}
