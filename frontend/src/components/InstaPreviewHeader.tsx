import { Heart, MessageCircle, PlusSquare, Search } from "lucide-react";

interface InstaPreviewHeaderProps {
  clientName: string;
  clientAvatar?: string;
}

export function InstaPreviewHeader({ clientName, clientAvatar }: InstaPreviewHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dbdbdb] bg-white">
      {/* Main header */}
      <div className="flex h-[60px] items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-semibold tracking-tight text-[#262626]">InstaPreview</span>
        </div>

        {/* Search bar - desktop only */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e8e8e]" />
            <input
              type="text"
              placeholder="Buscar"
              className="h-9 w-[268px] rounded-lg bg-[#efefef] pl-10 pr-4 text-sm text-[#262626] placeholder-[#8e8e8e] outline-none"
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <button className="p-1 hover:opacity-70 transition-opacity">
            <svg aria-label="Inicio" className="h-7 w-7" fill="#262626" viewBox="0 0 24 24">
              <path d="M22 10.041c0-.727-.339-1.433-.933-1.891L12.89.585c-.63-.481-1.513-.481-2.143 0L2.932 8.15c-.594.458-.933 1.164-.933 1.891v9.765c0 1.104.896 2 2 2h16c1.104 0 2-.896 2-2v-9.765zM12 21.5V14h-1v7.5H6v-9.233c0-.297.138-.585.381-.773l5.62-4.313 5.62 4.313c.243.188.38.476.38.773V21.5h-5z"/>
            </svg>
          </button>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <MessageCircle className="h-7 w-7 rotate-[-20deg]" strokeWidth={1.5} />
            <div className="absolute -top-0.5 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-semibold text-white flex items-center justify-center">
              1
            </div>
          </button>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <PlusSquare className="h-7 w-7" strokeWidth={1.5} />
          </button>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <svg aria-label="Explorar" className="h-7 w-7" fill="none" stroke="#262626" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M13.173 13.164l1.491-3.829-3.83 1.49zM12.001.5a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12.001.5zm5.35 7.443l-2.478 6.369a1 1 0 0 1-.57.569l-6.36 2.47a1 1 0 0 1-1.294-1.294l2.48-6.369a1 1 0 0 1 .569-.569l6.359-2.47a1 1 0 0 1 1.294 1.294z"/>
            </svg>
          </button>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <Heart className="h-7 w-7" strokeWidth={1.5} />
          </button>
          <button className="relative p-1 hover:opacity-70 transition-opacity">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] p-[2px]">
              <div className="h-full w-full rounded-full bg-white p-[2px]">
                {clientAvatar ? (
                  <img src={clientAvatar} alt={clientName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                    {clientName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
