export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold">InstaPreview</h1>
        <p className="mt-3 text-zinc-600">
          Previews tipo Instagram para clientes. Abre la URL:
        </p>
        <pre className="mt-4 rounded-lg bg-zinc-100 p-4 text-sm">
          /preview/&lt;client-slug&gt;
        </pre>
        <p className="mt-6 text-sm text-zinc-500">
          Este frontend consume el backend en {process.env.NEXT_PUBLIC_API_URL || "(set NEXT_PUBLIC_API_URL)"}.
        </p>
      </div>
    </main>
  );
}
