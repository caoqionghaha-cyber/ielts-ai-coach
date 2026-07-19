"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { ideas } from "@/lib/api";
import type { Idea } from "@/lib/types";
import { Lightbulb, Plus, Sparkles, Search, ChevronDown, ChevronUp } from "lucide-react";

export default function IdeasPage() {
  const [list, setList] = useState<Idea[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ topic: "", question: "", position: "", reason: "", explanation: "", example: "", related_words: "", band_level: "Band 7+" });

  const load = async () => {
    setLoading(true);
    try {
      const [d, t] = await Promise.all([ideas.list({ topic: topic || undefined, search: search || undefined }), ideas.topics()]);
      setList(d.ideas); setTopics(t);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [topic]);

  const add = async () => {
    if (!form.question || !form.topic) return;
    try { await ideas.create(form); setForm({ topic: "", question: "", position: "", reason: "", explanation: "", example: "", related_words: "", band_level: "Band 7+" }); load(); } catch (e) { console.error(e); }
  };

  return (
    <NavLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><Lightbulb className="w-6 h-6 text-[#8FD8B5]" />Idea Bank</h1>
            <p className="text-[#636E72] mt-1">Structured arguments for IELTS topics</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-medium hover:bg-[#6BBF99] transition-all">
            <Plus className="w-4 h-4" /> Add Idea
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <h3 className="font-semibold text-[#2D3436] mb-4">New Argument</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-[#636E72] mb-1 block">Topic</label><input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">立场</label><input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" placeholder="Support/Oppose/Balanced" /></div>
              <div className="sm:col-span-2"><label className="text-xs text-[#636E72] mb-1 block">Question</label><input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div className="sm:col-span-2"><label className="text-xs text-[#636E72] mb-1 block">理由</label><textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={2} /></div>
              <div className="sm:col-span-2"><label className="text-xs text-[#636E72] mb-1 block">解释</label><textarea value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={2} /></div>
              <div className="sm:col-span-2"><label className="text-xs text-[#636E72] mb-1 block">例子</label><textarea value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={2} /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">相关词汇</label><input value={form.related_words} onChange={e => setForm({ ...form, related_words: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Band Level</label><select value={form.band_level} onChange={e => setForm({ ...form, band_level: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none text-sm"><option>Band 7+</option><option>Band 8+</option></select></div>
            </div>
            <button onClick={add} disabled={!form.question || !form.topic} className="mt-4 px-6 py-2.5 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">Add to Idea Bank</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2BEC3]" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F0F0EC] rounded-[16px] outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" />
          </div>
          <button onClick={() => setTopic("")} className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (!topic ? "bg-[#8FD8B5] text-white" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>All</button>
          {topics.map(t => (
            <button key={t} onClick={() => setTopic(t)} className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (topic === t ? "bg-[#8FD8B5] text-white" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>{t}</button>
          ))}
        </div>

        {/* Idea Cards */}
        <div className="space-y-4">
          {loading ? <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div> :
            list.length === 0 ? <div className="text-center py-12 text-[#B2BEC3]"><Lightbulb className="w-12 h-12 mx-auto mb-3" /><p>No ideas yet</p></div> :
            list.map(idea => (
              <div key={idea.id} className="bg-white rounded-[20px] border border-[#F0F0EC] overflow-hidden" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
                <button onClick={() => setExpanded(expanded === idea.id ? null : idea.id)} className="w-full text-left p-5 flex items-start justify-between hover:bg-[#FAFAF7] transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-xs rounded-full">{idea.topic}</span>
                      <span className="px-2.5 py-0.5 bg-[#FFF1C9] text-[#B8952E] text-xs rounded-full">{idea.position}</span>
                      <span className="px-2.5 py-0.5 bg-[#F0F0EC] text-[#636E72] text-xs rounded-full">{idea.band_level}</span>
                    </div>
                    <p className="font-medium text-[#2D3436] text-sm">{idea.question}</p>
                    <p className="text-sm text-[#636E72] mt-1">{idea.reason}</p>
                  </div>
                  {expanded === idea.id ? <ChevronUp className="w-5 h-5 text-[#8FD8B5] shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#B2BEC3] shrink-0" />}
                </button>
                {expanded === idea.id && (
                  <div className="px-5 pb-5 space-y-3 border-t border-[#F0F0EC] pt-4">
                    <div><p className="text-xs text-[#B2BEC3] font-semibold mb-1">解释</p><p className="text-sm text-[#636E72]">{idea.explanation}</p></div>
                    <div><p className="text-xs text-[#B2BEC3] font-semibold mb-1">例子</p><p className="text-sm text-[#636E72]">{idea.example}</p></div>
                    {idea.related_words && <div><p className="text-xs text-[#B2BEC3] font-semibold mb-1">相关词汇</p><div className="flex gap-2 flex-wrap">{idea.related_words.split(", ").map((w, i) => <span key={i} className="px-2.5 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-xs rounded-full">{w}</span>)}</div></div>}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </NavLayout>
  );
}
