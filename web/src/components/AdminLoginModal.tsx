"use client";

import { useState } from "react";

export default function AdminLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Login failed");
        setLoading(false);
        return;
      }
      // success — redirect to /admin so the cookie is used by the request
      window.location.href = "/admin";
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white">Admin login</h3>
        <p className="mt-2 text-sm text-slate-300">Enter the admin password to open the stewardship console.</p>
        <input
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="mt-4 w-full rounded-md border border-white/10 bg-white/3 px-3 py-2 text-white"
        />
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
        <div className="mt-4 flex justify-end gap-3">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
