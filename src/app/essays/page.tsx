"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { essays } from "@/lib/api";
import type { Essay } from "@/lib/types";
import { Library, ChevronRight, Sparkles, ChevronDown, ChevronUp, Upload, X } from "lucide-react";

export default function EssaysPage() {
  const [list, setList] = useState<Essay[]>([]);
  const [selected, setSelected] = useState<Essay | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedSentence, setExpandedSentence] = useState<number | null>(null);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const topics = allTopics;
  const [showImport, setShowImport] = useState(false);
  const [importTitle, setImportTitle] = useState("");
  const [importTopic, setImportTopic] = useState("");
  const [importContent, setImportContent] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    setLoading(true);
    essays.list(topic || undefined).then(r => setList(r.essays)).catch(console.error).finally(() => setLoading(false));
  }, [topic]);

  useEffect(() => {
    essays.list().then(r => {
      const t = [...new Set(r.essays.map(e => e.topic))].sort();
      setAllTopics(t);
    }).catch(() => {});
  }, []);

  const handleImport = async () => {
    if (!importContent.trim()) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);
    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: importTitle || "Imported Essay", content: importContent, topic: importTopic })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportResult(data);
      setImportTitle(""); setImportTopic(""); setImportContent("");
      setShowImport(false);
      essays.list(topic || undefined).then(r => setList(r.essays));
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    }
    setImporting(false);
  };

  return (
    <NavLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><Library className="w-6 h-6 text-[#8FD8B5]" />Essay Reader</h1>
            <p className="text-[#636E72] mt-1">Read and analyze high-scoring IELTS essays</p>
          </div>
          <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-1.5 px-4 py-2 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-medium hover:bg-[#6BBF99] transition-all shrink-0">
            {showImport ? <X className="w-4 h-4" /> : <Upload className="w-4 h-4" />} {showImport ? "取消" : "Import"}
          </button>
        </div>

        {/* Import Form */}
        {showImport && (
          <div className="bg-white rounded-[20px] p-6 border-2 border-[#8FD8B5]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <h3 className="font-semibold text-[#2D3436] mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-[#8FD8B5]" />导入文章</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#636E72] mb-1 block">标题（可选）</label>
                <input value={importTitle} onChange={e => setImportTitle(e.target.value)} placeholder="输入文章标题" className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#636E72] mb-1 block">主题（可选）</label>
                <input value={importTopic} onChange={e => setImportTopic(e.target.value)} placeholder="例如：教育、科技、环境" className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" />
              </div>
              <div>
                <label className="text-xs text-[#636E72] mb-1 block">文章内容 *</label>
                <textarea value={importContent} onChange={e => setImportContent(e.target.value)} placeholder="在此粘贴文章内容..." rows={8} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" />
              </div>
              {importError && <p className="text-sm text-[#FF8A8A]">{importError}</p>}
              <div className="flex gap-2">
                <button onClick={handleImport} disabled={!importContent.trim() || importing} className="px-6 py-2.5 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">
                  {importing ? "分析中..." : "导入并自动分析"}
                </button>
                <button onClick={() => { setShowImport(false); setImportContent(""); setImportError(""); }} className="px-6 py-2.5 bg-[#F0F0EC] text-[#636E72] rounded-[16px] text-sm font-semibold hover:bg-[#E0E0DC] transition-all">取消</button>
              </div>
            </div>
          </div>
        )}

        {/* Import Success */}
        {importResult && (
          <div className="bg-white rounded-[20px] p-5 border-2 border-[#8FD8B5]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <p className="text-sm text-[#8FD8B5] font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" />文章已导入！点击查看文章分析</p>
          </div>
        )}

        {/* Topic Filters (not selected) */}
        {!selected && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setTopic("")} className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (!topic ? "bg-[#8FD8B5] text-white" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>All</button>
              {topics.map(t => (
                <button key={t} onClick={() => setTopic(t)} className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (topic === t ? "bg-[#8FD8B5] text-white" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>{t}</button>
              ))}
            </div>

            <div className="grid gap-4">
              {loading ? <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div> :
                list.length === 0 ? <div className="text-center py-12 text-[#B2BEC3]"><Library className="w-12 h-12 mx-auto mb-3" /><p>No essays yet</p></div> :
                list.map(e => (
                  <button key={e.id} onClick={() => setSelected(e)} className="bg-white rounded-[20px] p-5 border border-[#F0F0EC] hover:border-[#8FD8B5] text-left transition-all" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2D3436]">{e.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2.5 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-xs rounded-full">{e.topic}</span>
                          <span className="px-2.5 py-0.5 bg-[#FFF1C9] text-[#B8952E] text-xs rounded-full">Band {e.band_score}</span>
                          {e.source === "Imported" && <span className="px-2.5 py-0.5 bg-[#FFD93D]/20 text-[#B8952E] text-xs rounded-full">Imported</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#B2BEC3] shrink-0" />
                    </div>
                  </button>
                ))
              }
            </div>
          </>
        )}

        {/* Essay Detail */}
        {selected && (
          <div className="space-y-6">
            <button onClick={() => setSelected(null)} className="text-sm text-[#8FD8B5] font-medium hover:text-[#6BBF99] transition-colors">&larr; Back to essays</button>

            <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-[#E6F7F0] text-[#8FD8B5] text-xs font-semibold rounded-full">{selected.topic}</span>
                <span className="px-3 py-1 bg-[#FFF1C9] text-[#B8952E] text-xs font-semibold rounded-full">Band {selected.band_score}</span>
              </div>
              <h2 className="text-lg font-bold text-[#2D3436] mb-4">{selected.title}</h2>
              <div className="prose max-w-none">
                {selected.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-[#636E72] leading-relaxed mb-4 text-sm">{para}</p>
                ))}
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#8FD8B5]" />
                <h3 className="font-bold text-[#2D3436]">AI 分析</h3>
              </div>
              <div className="text-sm text-[#636E72] leading-relaxed whitespace-pre-line">{selected.analysis}</div>
            </div>

            {/* Sentence Analysis */}
            <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <h3 className="font-bold text-[#2D3436] mb-4">逐句分析</h3>
              <div className="space-y-2">
                {selected.content.split("\n\n").map((para, pi) => (
                  para.split(". ").filter(Boolean).map((sentence, si) => {
                    const idx = pi * 100 + si;
                    const words = sentence.split(" ");
                    const hasHighLevel = words.some(w => ["significant","substantial","consequently","inevitable","comprehensive","demonstrate","mitigate","furthermore","nevertheless"].includes(w.toLowerCase()));
                    return (
                      <div key={idx}>
                        <button onClick={() => setExpandedSentence(expandedSentence === idx ? null : idx)}
                          className="w-full text-left p-3 rounded-xl hover:bg-[#F0F0EC]/50 transition-all flex items-start gap-2">
                          <span>{expandedSentence === idx ? <ChevronUp className="w-4 h-4 mt-0.5 text-[#8FD8B5]" /> : <ChevronDown className="w-4 h-4 mt-0.5 text-[#B2BEC3]" />}</span>
                          <span className="text-sm text-[#2D3436]">{sentence}{sentence.endsWith(".") ? "" : "."}</span>
                          {hasHighLevel && <span className="shrink-0 px-2 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-[10px] font-medium rounded-full mt-0.5">Band 7+</span>}
                        </button>
                        {expandedSentence === idx && (
                          <div className="ml-8 p-4 bg-[#E6F7F0]/50 rounded-2xl mb-2 space-y-2">
                            <p className="text-xs text-[#8FD8B5] font-semibold">结构: {sentence.length > 80 ? "复杂句" : "简单/中等句"}</p>
                            <p className="text-xs text-[#8FD8B5] font-semibold">单词数: {words.length}</p>
                            <p className="text-xs text-[#636E72]">句型: {sentence.includes("that") ? "从句" : sentence.includes("which") ? "关系从句" : "简单/并列句"}</p>
                            <p className="text-xs text-[#636E72]">关键词汇: {words.filter(w => w.length > 6).join(", ").substring(0, 100) || "基础词汇"}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </NavLayout>
  );
}


