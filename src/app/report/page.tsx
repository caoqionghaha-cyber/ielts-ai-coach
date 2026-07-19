"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { report } from "@/lib/api";
import { TrendingUp, Sparkles, BookOpen, Star, AlertTriangle, Target, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    report.get().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <NavLayout><div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div></NavLayout>;

  return (
    <NavLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[#8FD8B5]" />Progress Report</h1>
          <p className="text-[#636E72] mt-1">Track your learning journey and improvements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Practices", value: data?.total_practices ?? 0, color: "#8FD8B5", icon: BookOpen },
            { label: "Avg Score", value: data?.average_score ?? 0, color: "#8FD8B5", icon: Star },
            { label: "Essays Written", value: data?.total_essays ?? 0, color: "#A8D8EA", icon: Target },
            { label: "Weekly Active", value: data?.weekly_practices ?? 0, color: "#FFD93D", icon: Sparkles },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-[20px] p-5 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "20" }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#2D3436]">{typeof s.value === "number" ? s.value : 0}</p>
                <p className="text-xs text-[#636E72] mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Learning Days & Band */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <h3 className="font-semibold text-[#2D3436] mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-[#FFD93D]" />Learning Streak</h3>
            <p className="text-3xl font-bold text-[#8FD8B5]">{data?.continuous_days ?? 0} days</p>
            <p className="text-xs text-[#636E72] mt-1">Keep the momentum going!</p>
          </div>
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <h3 className="font-semibold text-[#2D3436] mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-[#8FD8B5]" />Current Performance</h3>
            <div className="flex items-end gap-4">
              <div><p className="text-3xl font-bold text-[#2D3436]">{data?.average_score ?? 0}</p><p className="text-xs text-[#636E72]">Avg Score</p></div>
              <div className="text-[#8FD8B5] text-xl mb-1">→</div>
              <div><p className="text-3xl font-bold text-[#8FD8B5]">7.5</p><p className="text-xs text-[#636E72]">Target Band</p></div>
            </div>
          </div>
        </div>

        {/* Score History */}
        {data?.score_history && data.score_history.length > 0 && (
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <h3 className="font-semibold text-[#2D3436] mb-4">Recent Score Trend</h3>
            <div className="flex items-end gap-2 h-24">
              {data.score_history.map((score: number, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-lg transition-all" style={{
                    height: Math.max(score / 100 * 80, 8) + "px",
                    backgroundColor: score >= 80 ? "#8FD8B5" : score >= 60 ? "#FFD93D" : "#FF8A8A",
                    opacity: 0.6 + 0.4 * (i / data.score_history.length),
                  }} />
                  <span className="text-[10px] text-[#B2BEC3]">{Math.round(score)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Errors */}
        {data?.top_errors && data.top_errors.length > 0 && (
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <h3 className="font-semibold text-[#2D3436] mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-[#FF8A8A]" />Most Common Errors</h3>
            <div className="space-y-3">
              {data.top_errors.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#636E72]">{e.type}</span>
                  <span className="text-sm font-semibold text-[#FF8A8A]">{e.count}x</span>
                </div>
              ))}
            </div>
            <Link href="/errors" className="flex items-center justify-center gap-1 mt-4 text-sm text-[#8FD8B5] font-medium hover:text-[#6BBF99] transition-colors">
              Go to Writing Improvement <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/practice" className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] hover:border-[#8FD8B5] transition-all text-center" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <BookOpen className="w-8 h-8 text-[#8FD8B5] mx-auto mb-2" />
            <p className="font-semibold text-[#2D3436] text-sm">Sentence Practice</p>
          </Link>
          <Link href="/essay-trainer" className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] hover:border-[#8FD8B5] transition-all text-center" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <Target className="w-8 h-8 text-[#A8D8EA] mx-auto mb-2" />
            <p className="font-semibold text-[#2D3436] text-sm">Write an Essay</p>
          </Link>
          <Link href="/review" className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] hover:border-[#8FD8B5] transition-all text-center" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <Sparkles className="w-8 h-8 text-[#FFD93D] mx-auto mb-2" />
            <p className="font-semibold text-[#2D3436] text-sm">Review</p>
          </Link>
        </div>
      </div>
    </NavLayout>
  );
}

