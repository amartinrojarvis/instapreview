"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-xl font-bold">No se pudo cargar la preview</h1>
        <p className="mt-2 text-sm text-zinc-600">{error.message}</p>
        <button
          className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
          onClick={() => reset()}
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
