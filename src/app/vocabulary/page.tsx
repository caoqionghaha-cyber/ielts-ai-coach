"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { vocabulary } from "@/lib/api";
import type { Vocabulary } from "@/lib/types";
import { BookMarked, Plus, Search, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export default function VocabularyPage() {
  const [list, setList] = useState<Vocabulary[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ word: "", meaning: "", synonyms: "", collocations: "", example: "", topic: "", band_level: "Band 7+" });

  const load = async () => {
    setLoading(true);
    try {
      const [d, t] = await Promise.all([vocabulary.list({ topic: topic || undefined, search: search || undefined }), vocabulary.topics()]);
      setList(d.vocabulary); setTopics(t);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [topic]);

  const add = async () => {
    if (!form.word || !form.meaning) return;
    try { await vocabulary.create(form); setForm({ word: "", meaning: "", synonyms: "", collocations: "", example: "", topic: "", band_level: "Band 7+" }); load(); } catch (e) { console.error(e); }
  };

  return (
    <NavLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><BookMarked className="w-6 h-6 text-[#8FD8B5]" />Vocabulary</h1>
            <p className="text-[#636E72] mt-1">Build your IELTS vocabulary bank</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-medium hover:bg-[#6BBF99] transition-all">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <h3 className="font-semibold text-[#2D3436] mb-4">New Vocabulary</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-[#636E72] mb-1 block">Word</label><input value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Meaning (Chinese)</label><input value={form.meaning} onChange={e => setForm({ ...form, meaning: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Synonyms</label><input value={form.synonyms} onChange={e => setForm({ ...form, synonyms: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Collocations</label><input value={form.collocations} onChange={e => setForm({ ...form, collocations: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div className="sm:col-span-2"><label className="text-xs text-[#636E72] mb-1 block">Example</label><textarea value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={2} /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Topic</label><input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Band</label><select value={form.band_level} onChange={e => setForm({ ...form, band_level: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none text-sm"><option>Band 5</option><option>Band 6</option><option>Band 6.5</option><option>Band 7</option><option>Band 7+</option><option>Band 8+</option></select></div>
            </div>
            <button onClick={add} disabled={!form.word || !form.meaning} className="mt-4 px-6 py-2.5 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">Add to Vocabulary</button>
          </div>
        )}

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

        <div className="space-y-3">
          {loading ? <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div> :
            list.length === 0 ? <div className="text-center py-12 text-[#B2BEC3]"><BookMarked className="w-12 h-12 mx-auto mb-3" /><p>No vocabulary yet</p></div> :
            list.map(item => (
              <div key={item.id} className="bg-white rounded-[20px] border border-[#F0F0EC] overflow-hidden" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
                <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="w-full text-left p-4 flex items-start justify-between hover:bg-[#FAFAF7] transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#2D3436]">{item.word}</span>
                      <span className="text-sm text-[#B2BEC3]">/ {item.meaning}</span>
                      <span className="px-2 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-[10px] rounded-full">{item.band_level}</span>
                    </div>
                    <p className="text-sm text-[#636E72]">{item.example}</p>
                  </div>
                  {expanded === item.id ? <ChevronUp className="w-4 h-4 text-[#8FD8B5] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#B2BEC3] shrink-0" />}
                </button>
                {expanded === item.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#F0F0EC] pt-3">
                    {item.synonyms && <div><p className="text-xs text-[#B2BEC3] font-semibold mb-1">Synonyms</p><div className="flex gap-2 flex-wrap">{item.synonyms.split(", ").map((s, i) => <span key={i} className="px-2.5 py-0.5 bg-[#FFF1C9] text-[#6B5E2E] text-xs rounded-full">{s}</span>)}</div></div>}
                    {item.collocations && <div><p className="text-xs text-[#B2BEC3] font-semibold mb-1">Collocations</p><div className="flex gap-2 flex-wrap">{item.collocations.split(", ").map((c, i) => <span key={i} className="px-2.5 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-xs rounded-full">{c}</span>)}</div></div>}
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
