"use client";
import { useEffect, useState } from "react";
import NavLayout from "@/components/NavLayout";
import { errors, practice } from "@/lib/api";
import { Sparkles, Trash2, TrendingDown, Brain, Send, ChevronRight } from "lucide-react";

export default function ErrorsPage() {
  const [list, setList] = useState<any[]>([]);
  const [types, setTypes] = useState<Array<{ type: string; count: number }>>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [trainingMode, setTrainingMode] = useState(false);
  const [trainSentences, setTrainSentences] = useState<any[]>([]);
  const [currentTrainIdx, setCurrentTrainIdx] = useState(0);
  const [trainAnswer, setTrainAnswer] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [e, t] = await Promise.all([errors.list(selected || undefined), errors.types()]);
      setList(e); setTypes(t);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [selected]);

  const del = async (id: number) => { await errors.delete(id); load(); };

  const startTraining = async () => {
    try {
      const res = await practice.errorTraining(selected || "", 5);
      setTrainSentences(res.sentences);
      setCurrentTrainIdx(0);
      setTrainAnswer("");
      setTrainingMode(true);
    } catch (e) { console.error(e); }
  };

  return (
    <NavLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#8FD8B5]" />Writing Improvement</h1>
            <p className="text-[#636E72] mt-1">Track and eliminate your mistakes</p>
          </div>
          {list.length > 0 && !trainingMode && (
            <button onClick={startTraining} className="flex items-center gap-1.5 px-4 py-2 bg-[#E6F7F0] text-[#8FD8B5] rounded-[16px] text-sm font-medium hover:bg-[#8FD8B5] hover:text-white transition-all">
              <Brain className="w-4 h-4" /> Error Training
            </button>
          )}
        </div>

        {/* Error Training Mode */}
        {trainingMode ? (
          <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#2D3436] flex items-center gap-2"><Brain className="w-5 h-5 text-[#8FD8B5]" />Error Training</h3>
              <button onClick={() => setTrainingMode(false)} className="text-sm text-[#B2BEC3] hover:text-[#636E72]">Exit</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-[#F0F0EC] rounded-full h-2"><div className="bg-[#8FD8B5] h-2 rounded-full transition-all" style={{ width: ((currentTrainIdx + 1) / trainSentences.length) * 100 + "%" }} /></div>
              <span className="text-sm text-[#B2BEC3] shrink-0">{currentTrainIdx + 1}/{trainSentences.length}</span>
            </div>
            {trainSentences[currentTrainIdx] && (
              <div className="space-y-4">
                <div className="bg-[#FFF5F5] rounded-2xl p-4">
                  <p className="text-xs text-[#FF8A8A] font-semibold mb-1">{trainSentences[currentTrainIdx].error_type} Error</p>
                  <p className="text-lg font-medium text-[#2D3436]">{trainSentences[currentTrainIdx].chinese}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#636E72] block mb-2">Your correction:</label>
                  <textarea value={trainAnswer} onChange={e => setTrainAnswer(e.target.value)} className="w-full px-4 py-3 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setCurrentTrainIdx(i => Math.min(i + 1, trainSentences.length - 1)); setTrainAnswer(""); }} className="flex items-center gap-2 bg-[#8FD8B5] text-white px-6 py-2.5 rounded-[16px] font-semibold hover:bg-[#6BBF99] transition-all">
                    {currentTrainIdx >= trainSentences.length - 1 ? "Done" : "Next"} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-[20px] p-5 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
                <p className="text-sm text-[#636E72]">Total Issues</p>
                <p className="text-2xl font-bold text-[#2D3436] mt-1">{list.length}</p>
              </div>
              {types.slice(0, 2).map(t => (
                <div key={t.type} className="bg-white rounded-[20px] p-5 border border-[#F0F0EC]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
                  <p className="text-sm text-[#636E72]">{t.type}</p>
                  <p className="text-2xl font-bold text-[#FF8A8A] mt-1">{t.count}</p>
                  <div className="flex items-center gap-1 text-xs text-[#8FD8B5] mt-1"><TrendingDown className="w-3 h-3" /> Improving</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setSelected("")} className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (!selected ? "bg-[#8FD8B5] text-white" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>All</button>
              {types.map(t => (
                <button key={t.type} onClick={() => setSelected(t.type)} className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (selected === t.type ? "bg-[#8FD8B5] text-white" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>{t.type} ({t.count})</button>
              ))}
            </div>

            {/* Error List */}
            <div className="bg-white rounded-[20px] border border-[#F0F0EC] overflow-hidden" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              {loading ? <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div> :
                list.length === 0 ? <div className="text-center py-12 text-[#B2BEC3]"><Sparkles className="w-12 h-12 mx-auto mb-3" /><p>No issues found ??</p><p className="text-sm mt-1">Keep practicing and they will appear here</p></div> :
                <div className="divide-y divide-[#F0F0EC]">
                  {list.map(e => (
                    <div key={e.id} className="flex items-start gap-4 p-4 hover:bg-[#FAFAF7] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 bg-[#FFF5F5] text-[#FF8A8A] text-xs font-medium rounded-full">{e.error_type}</span>
                          <span className="text-xs text-[#B2BEC3]">{e.count}x</span>
                        </div>
                        <p className="text-sm text-[#2D3436]"><span className="line-through text-[#FF8A8A]">{e.wrong}</span> �� <span className="font-semibold text-[#8FD8B5]">{e.correct}</span></p>
                        {e.context && <p className="text-xs text-[#B2BEC3] mt-0.5">{e.context}</p>}
                      </div>
                      <button onClick={() => del(e.id)} className="p-2 text-[#B2BEC3] hover:text-[#FF8A8A] transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              }
            </div>
          </>
        )}
      </div>
    </NavLayout>
  );
}
