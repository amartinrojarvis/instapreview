"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function loadClients() {
    const res = await fetch("/api/clients", { cache: "no-store" });
    if (!res.ok) throw new Error("No autorizado");
    const j = await res.json();
    setClients(j.clients);
    if (!selectedClientId && j.clients?.[0]?.id) setSelectedClientId(j.clients[0].id);
  }

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

  async function deleteClient(clientId: string) {
    if (!confirm("¿Eliminar cliente? (borra posts + archivos)")) return;
    const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando cliente");
    setSelectedClientId(null);
    await loadClients();
  }

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
      if (!upRes.ok) throw new Error(upJ.error || "Error subiendo archivos");
    } else {
      throw new Error("Selecciona archivos para el post");
    }

    await loadPosts(selectedClient.id);
    form.reset();
  }

  async function deletePost(postId: string) {
    if (!confirm("¿Eliminar post?")) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando post");
    if (selectedClient) await loadPosts(selectedClient.id);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">Clientes + Posts (máx 4 por cliente)</p>
          {status && <p className="mt-2 text-sm text-red-600">{status}</p>}
        </div>
        <button onClick={logout} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-zinc-50">
          Logout
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold">Clientes</h2>
          <div className="mt-3 space-y-2">
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  selectedClientId === c.id ? "border-black bg-zinc-50" : "hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-zinc-500">{c.posts_count ?? 0}/4</div>
                </div>
                <div className="text-xs text-zinc-500">/{c.slug}</div>
              </button>
            ))}
            {clients.length === 0 && <div className="text-sm text-zinc-500">No hay clientes.</div>}
          </div>

          {selectedClient && (
            <button
              className="mt-4 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => deleteClient(selectedClient.id).catch((e) => alert(e.message))}
            >
              Eliminar cliente
            </button>
          )}

          <hr className="my-5" />

          <h3 className="text-sm font-semibold">Crear cliente</h3>
          <form
            className="mt-3 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              createClient(e.currentTarget).catch((err) => alert(err.message));
            }}
          >
            <input name="name" placeholder="Nombre" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <input name="slug" placeholder="slug (ej: gozzo)" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <textarea
              name="description"
              placeholder="Descripción"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
            />
            <button className="w-full rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white">Crear</button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Posts</h2>
            {selectedClient && (
              <a
                className="text-sm font-medium text-blue-700 hover:underline"
                href={`http://localhost:3000/preview/${selectedClient.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir preview
              </a>
            )}
          </div>

          {!selectedClient ? (
            <div className="mt-4 text-sm text-zinc-500">Selecciona un cliente.</div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">#{p.position} — {p.type}</div>
                      <button className="text-sm text-red-600" onClick={() => deletePost(p.id).catch((e) => alert(e.message))}>
                        Eliminar
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">files: {p.file_count} · likes: {p.likes_count}</div>
                    <div className="mt-2 text-xs text-zinc-700 line-clamp-3 whitespace-pre-wrap">{p.caption}</div>
                  </div>
                ))}
                {posts.length === 0 && <div className="text-sm text-zinc-500">No hay posts.</div>}
              </div>

              <hr className="my-6" />

              <h3 className="text-sm font-semibold">Crear post</h3>
              <form
                className="mt-3 grid grid-cols-1 gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  createPost(e.currentTarget).catch((err) => alert(err.message));
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <select name="type" className="rounded-lg border px-3 py-2 text-sm" defaultValue="single">
                    <option value="single">single</option>
                    <option value="carousel">carousel</option>
                    <option value="video">video</option>
                  </select>
                  <select name="position" className="rounded-lg border px-3 py-2 text-sm" defaultValue="1">
                    <option value="1">Posición 1</option>
                    <option value="2">Posición 2</option>
                    <option value="3">Posición 3</option>
                    <option value="4">Posición 4</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="likes_count"
                    type="number"
                    min={0}
                    placeholder="Likes (ej: 123)"
                    className="rounded-lg border px-3 py-2 text-sm"
                    defaultValue={0}
                  />
                  <input
                    name="file_count"
                    type="number"
                    min={1}
                    max={10}
                    placeholder="Nº archivos (carrusel)"
                    className="rounded-lg border px-3 py-2 text-sm"
                    defaultValue={1}
                  />
                </div>

                <textarea name="caption" placeholder="Caption" className="rounded-lg border px-3 py-2 text-sm" rows={3} />
                <input name="hashtags" placeholder="#tags" className="rounded-lg border px-3 py-2 text-sm" />

                <input
                  name="files"
                  type="file"
                  multiple
                  className="rounded-lg border px-3 py-2 text-sm"
                  accept="image/*,video/mp4,video/quicktime"
                />

                <button className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white">Crear + Subir</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
