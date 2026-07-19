"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AICoach from "./AICoach";
import { Menu, X, LogIn, UserPlus, LogOut, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function NavLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [mobileCoachOpen, setMobileCoachOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
        .then(res => { if (res.ok) return res.json(); throw new Error(); })
        .then(setUser).catch(() => localStorage.removeItem("token"));
    }
  }, [pathname]);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const sidebarExpanded = sidebarHovered;

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Mobile header */}
      <div className="fixed lg:hidden top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-lg border-b border-[#F0F0EC] flex items-center justify-between px-4 z-50">
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="p-2 hover:bg-[#F0F0EC] rounded-lg">
          {mobileSidebarOpen ? <X className="w-5 h-5 text-[#636E72]" /> : <Menu className="w-5 h-5 text-[#636E72]" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="IELTS AI Coach" className="w-6 h-6" />
          <span className="font-bold text-sm">IELTS AI Coach</span>
        </Link>
        <button onClick={() => setMobileCoachOpen(!mobileCoachOpen)} className="p-2 hover:bg-[#F0F0EC] rounded-lg">
          <img src="/logo.svg" alt="Coach" className="w-5 h-5" />
        </button>
      </div>

      <div className="flex pt-14 lg:pt-0" style={{ minHeight: "calc(100vh - 56px)" }}>
        {/* Mobile overlay */}
        {mobileSidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />}

        {/* ====== LEFT SIDEBAR ====== */}
        {/* Desktop: always visible, collapsed by default (56px), expand on hover (240px) */}
        <aside
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={"hidden lg:block sticky top-0 left-0 z-50 h-screen bg-white border-r border-[#F0F0EC] transition-all duration-300 overflow-hidden flex-shrink-0 " + (sidebarExpanded ? "w-[240px]" : "w-[56px]")}
        >
          <Sidebar onNavigate={() => {}} collapsed={!sidebarExpanded} onToggle={() => setSidebarHovered(!sidebarHovered)} />
        </aside>

        {/* Mobile: slide-in sidebar */}
        <aside className={"fixed lg:hidden top-14 left-0 z-50 h-[calc(100vh-56px)] bg-white border-r border-[#F0F0EC] transform transition-all duration-300 overflow-y-auto " + (mobileSidebarOpen ? "translate-x-0" : "-translate-x-full") + " w-[240px]"}>
          <Sidebar onNavigate={() => setMobileSidebarOpen(false)} collapsed={false} />
        </aside>

        {/* ====== MAIN CONTENT ====== */}
        <main className={"flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 transition-all duration-300 " + (sidebarExpanded ? "max-w-4xl" : "max-w-5xl")} style={{margin: "0 auto", width: "100%"}}>
          {pathname !== "/" && pathname !== "/dashboard" && (
            <button onClick={() => window.history.back()}
              className="flex items-center gap-1 text-sm text-[#636E72] hover:text-[#2D3436] transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {children}
        </main>

        {/* ====== RIGHT AI COACH TOGGLE BUTTON ====== */}
        {/* Desktop only: always visible toggle bar */}
        <div className="hidden lg:flex flex-col">
          <button
            onClick={() => setCoachOpen(!coachOpen)}
            className={"coach-toggle-btn " + (coachOpen ? "expanded" : "collapsed")}
            title={coachOpen ? "Close AI Coach" : "Open AI Coach"}
            style={{
              height: "100vh",
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              writingMode: "vertical-rl" as any,
            }}
          >
            {coachOpen ? (
              <ChevronRight className="w-4 h-4" style={{writingMode: "horizontal-tb"}} />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" style={{writingMode: "horizontal-tb"}} />
                <span className="text-[11px] font-semibold">AI</span>
              </>
            )}
          </button>
        </div>

        {/* ====== RIGHT AI COACH PANEL ====== */}
        {/* Desktop: show/hide panel */}
        <div className={"hidden lg:block coach-panel " + (coachOpen ? "" : "collapsed")}>
          <div className="flex items-center justify-end p-3 gap-2 border-b border-[#F0F0EC]" style={{minWidth: "280px"}}>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#636E72]">{user.username}</span>
                <button onClick={() => { localStorage.removeItem("token"); setUser(null); router.push("/"); }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#FF8A8A] hover:bg-[#FFF5F5] rounded-xl transition-all">
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-1">
                <Link href="/login" className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#636E72] hover:bg-[#F0F0EC] rounded-xl transition-all">
                  <LogIn className="w-3 h-3" /> Sign In
                </Link>
                <Link href="/register" className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#8FD8B5] text-white rounded-xl hover:bg-[#6BBF99] transition-all">
                  <UserPlus className="w-3 h-3" /> Sign Up
                </Link>
              </div>
            )}
          </div>
          <div style={{minWidth: "280px"}}>
            <AICoach />
          </div>
        </div>

        {/* Mobile AI Coach */}
        {mobileCoachOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/20" onClick={() => setMobileCoachOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl">
              <div className="flex items-center justify-between p-3 border-b border-[#F0F0EC]">
                <span className="text-xs text-[#636E72]">{user ? user.username : "Guest"}</span>
                <button onClick={() => setMobileCoachOpen(false)} className="p-1 hover:bg-[#F0F0EC] rounded-lg">
                  <X className="w-4 h-4 text-[#636E72]" />
                </button>
              </div>
              <div className="p-2">
                {!user && (
                  <div className="flex gap-2 mb-3">
                    <Link href="/login" onClick={() => setMobileCoachOpen(false)} className="flex-1 text-center px-3 py-2 text-xs bg-[#8FD8B5] text-white rounded-xl hover:bg-[#6BBF99] transition-all">Sign In</Link>
                    <Link href="/register" onClick={() => setMobileCoachOpen(false)} className="flex-1 text-center px-3 py-2 text-xs border border-[#8FD8B5] text-[#8FD8B5] rounded-xl hover:bg-[#E6F7F0] transition-all">Sign Up</Link>
                  </div>
                )}
              </div>
              <AICoach />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
