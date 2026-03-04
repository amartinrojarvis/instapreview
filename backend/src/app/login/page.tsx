"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Login failed (${res.status})`);
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 mb-6 shadow-lg shadow-pink-500/20">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" strokeWidth="2"/>
              <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">InstaPreview</h1>
          <p className="text-zinc-500">Panel de Administración</p>
        </div>

        {/* Formulario */}
        <form 
          onSubmit={onSubmit} 
          className="space-y-4"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-pink-500 focus:outline-none transition-colors"
            />

            {error && (
              <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? "Entrando..." : "Entrar al Panel"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          © 2026 InstaPreview. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
