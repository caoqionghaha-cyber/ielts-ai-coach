"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { dashboard } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, TrendingUp, Target, BookOpen, AlertTriangle, Sparkles } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [targetInput, setTargetInput] = useState("7.0");
  const [currentBand, setCurrentBand] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
        .then(res => { if (res.ok) return res.json(); throw new Error(); })
        .then(setUser).catch(() => {});
    }
  }, []);

  useEffect(() => {
    dashboard.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (data?.average_score && data.average_score > 0) {
      const band = 4 + (data.average_score / 100) * 5;
      setCurrentBand(Math.round(band * 2) / 2);
    }
    const saved = localStorage.getItem("targetBand");
    if (saved) setTargetBand(parseFloat(saved));
  }, [data]);

  const saveTarget = () => {
    const val = parseFloat(targetInput);
    if (val >= 1 && val <= 9) {
      setTargetBand(val);
      localStorage.setItem("targetBand", String(val));
      setShowTargetInput(false);
    }
  };

  if (loading) return <NavLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div></NavLayout>;
  return (
    <NavLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2">Hi {user?.username || "there"} 👋</h1>
          <p className="text-[#636E72] mt-1">Let&apos;s improve your Writing today.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Practices", value: data?.today_practice_count ?? 0, color: "#8FD8B5", icon: BookOpen },
            { label: "To Review", value: data?.today_review_count ?? 0, color: "#FFD93D", icon: Target },
            { label: "Mistakes", value: data?.today_error_count ?? 0, color: "#FF8A8A", icon: AlertTriangle },
            { label: "Avg Score", value: data?.average_score ?? 0, color: "#A8D8EA", icon: TrendingUp },
          ].map((s) => { const Icon = s.icon; return (
            <div key={s.label} className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{backgroundColor: s.color + "20"}}>
                  <Icon className="w-4 h-4" style={{color: s.color}} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#2D3436]">{s.value}</p>
              <p className="text-xs text-[#636E72] mt-0.5">{s.label}</p>
            </div>
          );})}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">Today&apos;s Mission</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/practice" className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] hover:border-[#8FD8B5] transition-all" style={{boxShadow: "0 8px 30px rgba(0,0,0,0.04)"}}>
              <div className="w-10 h-10 bg-[#8FD8B5]/20 rounded-2xl flex items-center justify-center mb-3"><BookOpen className="w-5 h-5 text-[#8FD8B5]" /></div>
              <h3 className="font-semibold text-[#2D3436]">Sentence Practice</h3>
              <p className="text-xs text-[#636E72] mt-1">Practice translations</p>
            </Link>
            <Link href="/essay-trainer" className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] hover:border-[#FFD93D] transition-all" style={{boxShadow: "0 8px 30px rgba(0,0,0,0.04)"}}>
              <div className="w-10 h-10 bg-[#FFD93D]/20 rounded-2xl flex items-center justify-center mb-3"><Target className="w-5 h-5 text-[#FFD93D]" /></div>
              <h3 className="font-semibold text-[#2D3436]">Essay Training</h3>
              <p className="text-xs text-[#636E72] mt-1">Practice Task 2 essay</p>
            </Link>
            <Link href="/vocabulary" className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] hover:border-[#A8D8EA] transition-all" style={{boxShadow: "0 8px 30px rgba(0,0,0,0.04)"}}>
              <div className="w-10 h-10 bg-[#A8D8EA]/20 rounded-2xl flex items-center justify-center mb-3"><Sparkles className="w-5 h-5 text-[#A8D8EA]" /></div>
              <h3 className="font-semibold text-[#2D3436]">Vocabulary</h3>
              <p className="text-xs text-[#636E72] mt-1">Build your word bank</p>
            </Link>
          </div>
        </div>

        {/* Writing Growth */}
        <div>
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">Writing Growth</h2>
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{boxShadow: "0 8px 30px rgba(0,0,0,0.04)"}}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <p className="text-xs text-[#B2BEC3] font-semibold mb-1">Current Band</p>
                <p className="text-3xl font-bold text-[#2D3436]">{currentBand ? currentBand.toFixed(1) : "—"}</p>
                <p className="text-xs text-[#B2BEC3] mt-0.5">{currentBand ? "based on your practice" : "start practicing to see"}</p>
              </div>
              <div className="text-[#B2BEC3] text-2xl font-light px-4">→</div>
              <div className="text-center flex-1">
                <p className="text-xs text-[#B2BEC3] font-semibold mb-1">Target Band</p>
                {targetBand ? (
                  <div>
                    <p className="text-3xl font-bold text-[#8FD8B5]">{targetBand.toFixed(1)}</p>
                    <button onClick={() => setShowTargetInput(true)} className="text-xs text-[#8FD8B5] hover:text-[#6BBF99] mt-0.5">Change target</button>
                  </div>
                ) : (
                  <div>
                    {showTargetInput ? (
                      <div className="flex items-center justify-center gap-2">
                        <input type="number" step="0.5" min="1" max="9" value={targetInput} onChange={e => setTargetInput(e.target.value)}
                          className="w-16 px-2 py-1 text-center bg-[#FAFAF7] border border-[#F0F0EC] rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#8FD8B5]/30" />
                        <button onClick={saveTarget} className="px-3 py-1 bg-[#8FD8B5] text-white text-xs rounded-xl hover:bg-[#6BBF99]">Set</button>
                        <button onClick={() => setShowTargetInput(false)} className="px-3 py-1 text-xs text-[#B2BEC3] hover:text-[#636E72]">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowTargetInput(true)} className="px-4 py-2 bg-[#E6F7F0] text-[#8FD8B5] rounded-[16px] text-sm font-medium hover:bg-[#8FD8B5] hover:text-white transition-all">Set Target</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {currentBand && targetBand && (
              <div>
                <div className="flex justify-between text-xs text-[#636E72] mb-1">
                  <span>Progress</span>
                  <span>{currentBand.toFixed(1)} / {targetBand.toFixed(1)}</span>
                </div>
                <div className="h-3 bg-[#F0F0EC] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#8FD8B5] to-[#6BBF99] rounded-full transition-all duration-500"
                    style={{width: Math.min(100, (currentBand / targetBand) * 100) + "%"}} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Coach Insight */}
        <div className="bg-[#E6F7F0] rounded-[20px] p-6 border border-[#8FD8B5]/20">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.svg" alt="AI Coach" className="w-8 h-8" />
            <div>
              <p className="font-semibold text-[#2D3436] text-sm">AI Coach Insight</p>
              <p className="text-xs text-[#8FD8B5]">Your writing partner</p>
            </div>
          </div>
          <p className="text-sm text-[#2D3436] leading-relaxed">
            {data?.average_score > 0
              ? "Keep practicing! Your writing skills are improving."
              : "开始第一次练习，AI教练将为你提供个性化建议。"}
          </p>
          <div className="mt-4 pt-4 border-t border-[#8FD8B5]/20">
            <Link href="/practice" className="inline-flex items-center gap-1 text-sm font-medium text-[#8FD8B5] hover:text-[#6BBF99] transition-colors">
              Start Practice <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </NavLayout>
  );
}



