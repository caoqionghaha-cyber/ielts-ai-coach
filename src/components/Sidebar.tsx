"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenSquare, BookOpen, Lightbulb, Library, TrendingUp, RotateCcw, Sparkles, FileText, BookMarked, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const navGroups = [
  { label: "Learning", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/practice", label: "Sentence Practice", icon: PenSquare },
    { href: "/essay-trainer", label: "Essay Trainer", icon: FileText },
  ]},
  { label: "Knowledge", items: [
    { href: "/materials", label: "My Library", icon: BookOpen },
    { href: "/vocabulary", label: "Vocabulary", icon: BookMarked },
    { href: "/ideas", label: "Idea Bank", icon: Lightbulb },
    { href: "/essays", label: "Essay Reader", icon: Library },
  ]},
  { label: "Growth", items: [
    { href: "/review", label: "Review", icon: RotateCcw },
    { href: "/errors", label: "Writing Improvement", icon: Sparkles },
    { href: "/report", label: "Progress Report", icon: TrendingUp },
  ]},
];

export default function Sidebar({ onNavigate, collapsed, onToggle }: { onNavigate?: () => void; collapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  return (
    <div className={"h-full flex flex-col py-6 transition-all duration-300 " + (collapsed ? "px-2" : "px-3")}>
      <Link href="/dashboard" onClick={onNavigate} className={"flex items-center gap-3 mb-8 " + (collapsed ? "justify-center px-0" : "px-3")}>
        <img src="/logo.svg" alt="IELTS AI Coach" className="w-7 h-7 shrink-0" />
        <div className={"overflow-hidden transition-all duration-300 whitespace-nowrap " + (collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <div className="font-bold text-[15px] leading-tight text-[#2D3436]">IELTS</div>
          <div className="font-bold text-[15px] leading-tight text-[#8FD8B5]">AI Coach</div>
        </div>
      </Link>
      <div className={"flex-1 space-y-6 overflow-y-auto " + (collapsed ? "overflow-x-hidden" : "")}>
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className={"text-[11px] font-semibold text-[#B2BEC3] uppercase tracking-widest mb-2 overflow-hidden transition-all duration-300 whitespace-nowrap " + (collapsed ? "w-0 opacity-0 px-0" : "w-auto opacity-100 px-3")}>{group.label}</div>
            <div className={collapsed ? "flex flex-col items-center" : "space-y-0.5"}>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                if (collapsed) {
                  return (
                    <Link key={item.href} href={item.href} onClick={onNavigate}
                      className={"flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 " + (isActive ? "bg-[#E6F7F0] text-[#2D3436]" : "text-[#636E72] hover:bg-[#F0F0EC] hover:text-[#2D3436]")}
                      title={item.label}>
                      <Icon className="w-[18px] h-[18px]" />
                    </Link>
                  );
                } else {
                  return (
                    <Link key={item.href} href={item.href} onClick={onNavigate}
                      className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 " + (isActive ? "bg-[#E6F7F0] text-[#2D3436]" : "text-[#636E72] hover:bg-[#F0F0EC] hover:text-[#2D3436]")}>
                      <Icon className="w-[18px] h-[18px]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={"flex items-center mt-2 " + (collapsed ? "flex-col gap-1" : "")}>
        <button onClick={onToggle} className={"flex items-center justify-center rounded-xl transition-all duration-200 text-[#636E72] hover:bg-[#F0F0EC] hover:text-[#2D3436] " + (collapsed ? "w-10 h-10" : "px-3 py-2.5 gap-3 flex-1")}>
          {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          <span className={"text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap " + (collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Collapse</span>
        </button>
        <Link href="/" onClick={() => { if (typeof window !== "undefined") localStorage.removeItem("token"); }}
          className={"flex items-center justify-center rounded-xl transition-all duration-200 text-[#636E72] hover:bg-[#F0F0EC] hover:text-[#FF8A8A] " + (collapsed ? "w-10 h-10" : "px-3 py-2.5 gap-3 flex-1")}
          title="Sign Out">
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span className={"text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap " + (collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Sign Out</span>
        </Link>
      </div>
    </div>
  );
}
