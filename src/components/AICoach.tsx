"use client";
import { useEffect, useState } from "react";
import { Sparkles, BookOpen, Target, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CoachData {
  grammar_remaining: number;
  grammar_progress: number;
  vocabulary_remaining: number;
  vocabulary_progress: number;
  collocation_remaining: number;
  collocation_progress: number;
  insight_text: string;
  suggestion_text: string;
  score_trend: number;
  total_practices: number;
}

export default function AICoach() {
  const [data, setData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach/insight")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isGuest = !data || data.total_practices === 0;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-3 mb-5">
        <img src="/logo.svg" alt="AI Coach" className="w-6 h-6" />
        <div>
          <div className="text-sm font-semibold text-[#2D3436]">AI Coach</div>
          <div className="text-xs text-[#B2BEC3]">你的写作伙伴</div>
        </div>
      </div>

      <div className="bg-[#E6F7F0] rounded-2xl p-4 mb-4">
        <div className="text-xs text-[#636E72] font-medium mb-1">Good evening!</div>
        <div className="text-sm text-[#2D3436] font-semibold">准备好提升今天的写作了吗？</div>
      </div>

      {/* Today's Focus */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0F0EC] mb-4 shadow-sm">
        <div className="text-xs font-semibold text-[#B2BEC3] tracking-wider mb-3">今日重点</div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin w-5 h-5 border-2 border-[#8FD8B5] border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#636E72]">语法</span>
                  <span className="text-[#8FD8B5] font-semibold">{isGuest ? "待练习" : `剩余 ${data!.grammar_remaining} 项`}</span>
                </div>
                <div className="h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8FD8B5] rounded-full transition-all duration-500" style={{width: `${data?.grammar_progress || 0}%`}} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#636E72]">词汇</span>
                  <span className="text-[#8FD8B5] font-semibold">{isGuest ? "待练习" : `剩余 ${data!.vocabulary_remaining} 项`}</span>
                </div>
                <div className="h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8FD8B5] rounded-full transition-all duration-500" style={{width: `${data?.vocabulary_progress || 0}%`}} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2 mb-4">
        <Link href="/practice" className="flex items-center justify-between bg-white rounded-2xl p-3 border border-[#F0F0EC] hover:border-[#8FD8B5] transition-all shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8FD8B5]" />
            <span className="text-xs text-[#636E72] font-medium">句子练习</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#B2BEC3]" />
        </Link>
        <Link href="/errors" className="flex items-center justify-between bg-white rounded-2xl p-3 border border-[#F0F0EC] hover:border-[#FF8A8A] transition-all shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FF8A8A]" />
            <span className="text-xs text-[#636E72] font-medium">错误复习</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#B2BEC3]" />
        </Link>
      </div>

      {/* Insight */}
      <div className="bg-[#FFF1C9] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B8952E]" />
          <span className="text-xs font-semibold text-[#8B7A3E]">AI Insight</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin w-4 h-4 border-2 border-[#B8952E] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <p className="text-sm text-[#6B5E2E] leading-relaxed">&ldquo;{data?.insight_text || "暂无数据"}&rdquo;</p>
            <div className="mt-3 pt-3 border-t border-[#E8D8A0]">
              <p className="text-xs text-[#8B7A3E] font-medium mb-1">Today's Suggestion</p>
              <p className="text-xs text-[#6B5E2E]">{data?.suggestion_text || "完成一些练习获取建议。"}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
