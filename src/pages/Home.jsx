import { CalendarDays } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69fd0add5545130d2d15d03c/456db1150_ChatGPTImageMay15202605_49_31PM.png";

export default function Home() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#071828] font-inter text-white">
      <header
        className="sticky top-0 z-20 h-[56px]"
        style={{
          background: "linear-gradient(180deg,#0c2e4a 0%,#071e33 100%)",
          borderBottom: "1px solid #1a3a56",
        }}
      >
        <div className="flex h-full w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Riyadh Metro"
              className="h-10 w-auto object-contain"
            />
            <div className="h-6 w-px bg-[#1a3a56]" />
            <span className="text-sm font-bold tracking-tight text-white">
              L3 TC Template
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-[#1a3a56] bg-[#071828] px-3 py-1.5 sm:flex">
            <CalendarDays className="h-3.5 w-3.5 text-[#7eb8e0]" />
            <span className="text-[10px] text-[#7eb8e0]">{today}</span>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-56px)]" />
    </div>
  );
}
