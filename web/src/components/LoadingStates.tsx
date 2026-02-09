"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-lime-400/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-lime-400" />
      </div>
    </div>
  );
}

export function PulseLoader() {
  return (
    <div className="flex items-center justify-center gap-2 p-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-3 w-3 rounded-full bg-lime-400 animate-pulse-glow"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 animate-pulse">
      <div className="h-36 w-full rounded-xl bg-white/10 mb-3" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
      </div>
    </div>
  );
}
