"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" | "blur";
  threshold?: number;
}

export function AnimatedSection({ 
  children, 
  className = "", 
  delay = 0,
  animation = "fade",
  threshold = 0.1
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-700 ease-out";
    
    if (!isVisible) {
      switch (animation) {
        case "slide-up":
          return `${baseClasses} opacity-0 translate-y-12`;
        case "slide-left":
          return `${baseClasses} opacity-0 translate-x-12`;
        case "slide-right":
          return `${baseClasses} opacity-0 -translate-x-12`;
        case "scale":
          return `${baseClasses} opacity-0 scale-95`;
        case "blur":
          return `${baseClasses} opacity-0 blur-sm`;
        default:
          return `${baseClasses} opacity-0`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100 blur-0`;
  };

  return (
    <div 
      ref={ref} 
      className={`${getAnimationClasses()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
