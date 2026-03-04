export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="mx-auto max-w-xl px-6 py-12 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 mb-4 shadow-lg shadow-purple-500/25">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">InstaPreview</h1>
          <p className="mt-3 text-lg text-gray-400">
            Previews tipo InstaPreview para tus clientes
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-xl">
          <p className="text-sm text-gray-400 mb-4">
            Abre la URL de preview de un cliente:
          </p>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-purple-400 border border-gray-700">
            /preview/<span className="text-gray-500">client-slug</span>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Ejemplo: <span className="text-gray-400">/preview/gozzo</span>
          </p>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Backend: <span className="text-gray-400">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}</span>
        </div>
      </div>
    </main>
  );
}
