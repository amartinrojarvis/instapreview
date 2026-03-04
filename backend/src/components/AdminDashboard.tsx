"use client";

import { useEffect, useMemo, useState } from "react";

// Tipo para el cliente y posts
type Client = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  posts_count?: number;
};

type Post = {
  id: string;
  client_id: string;
  type: "single" | "carousel" | "video";
  position: number;
  caption: string | null;
  hashtags: string | null;
  likes_count: number;
  file_count: number;
  storage_path: string;
};

export function AdminDashboard() {
  // Estados
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  // Cargar clientes
  async function loadClients() {
    const res = await fetch("/api/clients", { cache: "no-store" });
    if (!res.ok) throw new Error("No autorizado");
    const j = await res.json();
    setClients(j.clients);
    if (!selectedClientId && j.clients?.[0]?.id) setSelectedClientId(j.clients[0].id);
  }

  // Cargar posts
  async function loadPosts(clientId: string) {
    const res = await fetch(`/api/posts?clientId=${encodeURIComponent(clientId)}`, { cache: "no-store" });
    const j = await res.json();
    setPosts(j.posts || []);
  }

  useEffect(() => {
    loadClients().catch((e) => setStatus(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClientId) loadPosts(selectedClientId).catch(() => {});
  }, [selectedClientId]);

  // Crear cliente
  async function createClient(form: HTMLFormElement) {
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      slug: String(fd.get("slug") || "").trim(),
      description: String(fd.get("description") || "").trim(),
    };
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || "Error creando cliente");
    await loadClients();
    setSelectedClientId(j.client.id);
    form.reset();
  }

  // Eliminar cliente
  async function deleteClient(clientId: string) {
    if (!confirm("¿Eliminar cliente? (borra posts + archivos)")) return;
    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando cliente");
    setSelectedClientId(null);
    await loadClients();
  }

  // Crear post
  async function createPost(form: HTMLFormElement) {
    if (!selectedClient) throw new Error("Selecciona un cliente");

    const fd = new FormData(form);
    const type = String(fd.get("type") || "single") as Post["type"];
    const fileCount = Number(fd.get("file_count") || (type === "carousel" ? 2 : 1));

    const payload = {
      client_id: selectedClient.id,
      type,
      position: Number(fd.get("position") || 1),
      caption: String(fd.get("caption") || ""),
      hashtags: String(fd.get("hashtags") || ""),
      likes_count: Number(fd.get("likes_count") || 0),
      file_count: fileCount,
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || "Error creando post");

    // upload files
    const uploadFd = new FormData();
    uploadFd.set("clientSlug", selectedClient.slug);
    uploadFd.set("postId", j.post.id);
    uploadFd.set("type", type);

    const input = form.querySelector<HTMLInputElement>('input[name="files"]');
    const list = input?.files;
    if (list && list.length) {
      for (const f of Array.from(list)) uploadFd.append("files", f);
      const upRes = await fetch("/api/upload", { method: "POST", body: uploadFd });
      const upJ = await upRes.json().catch(() => ({}));
      if (!upRes.ok) throw new Error(upJ.error + (upJ.details ? ` - ${JSON.stringify(upJ.details)}` : "") || "Error subiendo archivos");
    } else {
      throw new Error("Selecciona archivos para el post");
    }

    await loadPosts(selectedClient.id);
    form.reset();
  }

  // Eliminar post
  async function deletePost(postId: string) {
    if (!confirm("¿Eliminar post?")) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando post");
    if (selectedClient) await loadPosts(selectedClient.id);
  }

  // Logout
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" strokeWidth="2"/>
                <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">InstaPreview Admin</h1>
          </div>
          <button 
            onClick={logout} 
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {status && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {status}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Panel Clientes */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 lg:col-span-1">
            <h2 className="text-lg font-semibold">Clientes</h2>
            <p className="mt-1 text-sm text-zinc-500">Máximo 4 posts por cliente</p>
            
            <div className="mt-4 space-y-2">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${
                    selectedClientId === c.id 
                      ? "border-pink-500 bg-pink-500/10" 
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-zinc-500">{c.posts_count ?? 0}/4</span>
                  </div>
                  <div className="text-xs text-zinc-600">/{c.slug}</div>
                </button>
              ))}
              {clients.length === 0 && (
                <div className="py-4 text-center text-sm text-zinc-600">No hay clientes.</div>
              )}
            </div>

            {selectedClient && (
              <button
                onClick={() => deleteClient(selectedClient.id).catch((e) => alert(e.message))}
                className="mt-4 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                Eliminar cliente
              </button>
            )}

            <hr className="my-6 border-zinc-800" />

            {/* Crear cliente */}
            <h3 className="font-semibold">Crear cliente</h3>
            <form
              className="mt-3 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                createClient(e.currentTarget).catch((err) => alert(err.message));
              }}
            >
              <input
                name="name"
                placeholder="Nombre del cliente"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-pink-500 focus:outline-none"
              />
              <input
                name="slug"
                placeholder="slug (ej: gozzo)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-pink-500 focus:outline-none"
              />
              <textarea
                name="description"
                placeholder="Descripción"
                rows={3}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-pink-500 focus:outline-none"
              />
              <button className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Crear cliente
              </button>
            </form>
          </section>

          {/* Panel Posts */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Posts</h2>
              {selectedClient && (
                <a
                  href={`https://frontend-five-nu-38.vercel.app/preview/${selectedClient.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-pink-400 hover:text-pink-300"
                >
                  Abrir preview →
                </a>
              )}
            </div>

            {!selectedClient ? (
              <div className="mt-8 py-8 text-center text-zinc-600">Selecciona un cliente para ver sus posts.</div>
            ) : (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {posts.map((p) => (
                    <div key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#{p.position} — {p.type}</span>
                        <button
                          onClick={() => deletePost(p.id).catch((e) => alert(e.message))}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {p.file_count} archivos · {p.likes_count} likes
                      </div>
                      {p.caption && (
                        <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{p.caption}</p>
                      )}
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <div className="col-span-full py-8 text-center text-sm text-zinc-600">No hay posts.</div>
                  )}
                </div>

                <hr className="my-6 border-zinc-800" />

                {/* Crear post */}
                <h3 className="font-semibold">Crear post</h3>
                <form
                  className="mt-3 grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createPost(e.currentTarget).catch((err) => alert(err.message));
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      name="type"
                      defaultValue="single"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-pink-500 focus:outline-none"
                    >
                      <option value="single">Single</option>
                      <option value="carousel">Carousel</option>
                      <option value="video">Video</option>
                    </select>
                    <select
                      name="position"
                      defaultValue="1"
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-pink-500 focus:outline-none"
                    >
                      <option value="1">Posición 1</option>
                      <option value="2">Posición 2</option>
                      <option value="3">Posición 3</option>
                      <option value="4">Posición 4</option>
                    </select>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="likes_count"
                      type="number"
                      min={0}
                      placeholder="Likes"
                      defaultValue={0}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
                    />
                    <input
                      name="file_count"
                      type="number"
                      min={1}
                      max={10}
                      placeholder="Nº archivos"
                      defaultValue={1}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  <textarea
                    name="caption"
                    placeholder="Caption del post"
                    rows={3}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
                  />
                  <input
                    name="hashtags"
                    placeholder="#hashtags"
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
                  />

                  <input
                    name="files"
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/quicktime"
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:text-sm file:text-zinc-300"
                  />

                  <button className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                    Crear post + Subir archivos
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
