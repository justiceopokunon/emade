"use client";

import { ReactNode, useState, MouseEvent } from "react";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  glowEffect?: boolean;
  tiltEffect?: boolean;
}

export function InteractiveCard({ 
  children, 
  className = "",
  glowEffect = true,
  tiltEffect = true
}: InteractiveCardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0.5, y: 0.5 });
    setIsHovered(false);
  };

  const tiltX = tiltEffect ? (position.y - 0.5) * -10 : 0;
  const tiltY = tiltEffect ? (position.x - 0.5) * 10 : 0;

  return (
    <div
      className={`group relative transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tiltEffect 
          ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${isHovered ? '10px' : '0'})` 
          : undefined,
        transformStyle: "preserve-3d",
      }}
    >
      {glowEffect && isHovered && (
        <div 
          className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-lime-400/40 via-emerald-400/30 to-purple-400/40 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ zIndex: -1 }}
        />
      )}
      {children}
    </div>
  );
}
