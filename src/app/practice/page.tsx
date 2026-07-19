'use client';
import { useEffect, useRef, useState } from 'react';
import NavLayout from '@/components/NavLayout';
import { sentences, practice } from '@/lib/api';
import type { Sentence, PracticeResult } from '@/lib/types';
import { Brain, Send, ChevronRight, Sparkles, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const TOPIC_EN: Record<string, string> = {
  "环境": "Environment", "教育": "Education", "科技": "Technology",
  "全球化": "Globalization", "健康": "Health", "文化": "Culture",
  "犯罪": "Crime", "经济": "Economy", "General": "General",
};
function topicDisplay(t: string) { return TOPIC_EN[t] || t; }


export default function PracticePage() {
  const [sentenceList, setSentenceList] = useState<Sentence[]>([]);
  const [current, setCurrent] = useState<Sentence | null>(null);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(true);
  const [total, setTotal] = useState(0);
  const [topicFilter, setTopicFilter] = useState("");
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [practiceHistory, setPracticeHistory] = useState<Record<number, PracticeResult[]>>({});
  const [historyLoading, setHistoryLoading] = useState<Record<number, boolean>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<number, boolean>>({});
  const [practiceData, setPracticeData] = useState<Record<number, { answer: string; result: PracticeResult | null }>>(() => {
    try { return JSON.parse(localStorage.getItem('practiceData') || '{}'); }
    catch { return {}; }
  });

  useEffect(() => {
    sentences.list({ limit: 100 }).then(r => {
      setSentenceList(r.sentences); setTotal(r.total);
      if (r.sentences.length > 0) setCurrent(r.sentences[0]);
      const topics = [...new Set(r.sentences.map((s: Sentence) => s.topic || "General"))].sort();
      setAllTopics(topics);
    }).catch(console.error).finally(() => setInit(false));
  }, []);

  // Fetch history for initial sentence
  useEffect(() => {
    if (current) fetchHistory(current.id);
  }, [current]);

  // Persist practiceData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('practiceData', JSON.stringify(practiceData));
  }, [practiceData]);
  const practiceDataRef = useRef(practiceData);
  practiceDataRef.current = practiceData;

  const fetchHistory = async (sentenceId: number) => {
    if (practiceHistory[sentenceId] !== undefined || historyLoading[sentenceId]) return;
    setHistoryLoading(prev => ({ ...prev, [sentenceId]: true }));
    try {
      const res = await fetch('/api/practice/history?sentence_id=' + sentenceId + '&limit=20');
      if (res.ok) {
        const data = await res.json();
        setPracticeHistory(prev => ({ ...prev, [sentenceId]: data }));
      }
    } catch (e) { console.error(e); }
    finally { setHistoryLoading(prev => ({ ...prev, [sentenceId]: false })); }
  };

  const select = (s: Sentence, i: number) => {
    fetchHistory(s.id);
    const saved = practiceDataRef.current[s.id];
    setCurrent(s); setIdx(i);
    if (saved) { setAnswer(saved.answer); setResult(saved.result); }
    else { setAnswer(''); setResult(null); }
  };
  const handleAnswerChange = (val: string) => {
    setAnswer(val);
    if (current) {
      const updated = { ...practiceDataRef.current, [current.id]: { ...practiceDataRef.current[current.id], answer: val } };
      practiceDataRef.current = updated;
      setPracticeData(updated);
    }
  };

  const submit = async () => {
    if (!current || !answer.trim()) return;
    setLoading(true);
    try {
      const res = await practice.submit(current.id, answer.trim());
      setResult(res);
      // Clear cached history so it refetches after submit
      setPracticeHistory(prev => ({ ...prev, [current.id]: undefined as any }));
      fetchHistory(current.id);
      const updated = { ...practiceDataRef.current, [current.id]: { answer: answer.trim(), result: res } };
      practiceDataRef.current = updated;
      setPracticeData(updated);
    }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  const next = () => {
    if (idx + 1 < sentenceList.length) {
      // Save current state before moving
      if (current && answer.trim()) {
        const updated2 = { ...practiceDataRef.current, [current.id]: { answer, result } };
        practiceDataRef.current = updated2;
        setPracticeData(updated2);
      }
      const nextSent = sentenceList[idx + 1];
      const saved = practiceDataRef.current[nextSent.id];
      setCurrent(nextSent); setIdx(idx + 1);
      if (saved) { setAnswer(saved.answer); setResult(saved.result); }
      else { setAnswer(''); setResult(null); }
    }
  };

  if (init) return <NavLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div></NavLayout>;

  const filteredList = topicFilter ? sentenceList.filter(s => (s.topic || "General") === topicFilter) : sentenceList;

  return (
    <NavLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><Brain className="w-6 h-6 text-[#8FD8B5]" />Writing Practice</h1>
          <p className="text-[#636E72] mt-1">中译英训练 · AI 实时批改</p>
        </div>

        {sentenceList.length === 0 ? (
          <div className="bg-white rounded-[20px] p-12 text-center border border-[#F0F0EC]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <Brain className="w-12 h-12 text-[#B2BEC3] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#636E72]">No sentences yet</h2>
            <p className="text-sm text-[#B2BEC3] mt-1 mb-6">Add some sentences to your library first</p>
            <Link href="/materials" className="inline-flex items-center gap-2 bg-[#8FD8B5] text-white px-6 py-3 rounded-[16px] font-semibold hover:bg-[#6BBF99] transition-colors">Go to Library <ChevronRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <>
            {/* Topic Navigation Bar */}
            <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-3" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-[#B2BEC3] uppercase tracking-wider">Categories</span>
                <div className="flex-1 h-px bg-[#F0F0EC]" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setTopicFilter(""); }} className={"px-4 py-2 rounded-[16px] text-sm font-medium transition-all " + (!topicFilter ? "bg-[#8FD8B5] text-white shadow-sm" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>
                  All
                </button>
                {allTopics.map(t => (
                  <button key={t} onClick={() => setTopicFilter(t)} className={"px-4 py-2 rounded-[16px] text-sm font-medium transition-all " + (topicFilter === t ? "bg-[#8FD8B5] text-white shadow-sm" : "bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]")}>
                    {topicDisplay(t)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sentence List */}
              <div className="lg:col-span-1 bg-white rounded-[20px] border border-[#F0F0EC] p-4 max-h-[70vh] overflow-y-auto" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                <h3 className="text-xs font-semibold text-[#B2BEC3] uppercase tracking-wider mb-3 px-1">Sentences ({filteredList.length})</h3>
                <div className="space-y-1.5">
                  {filteredList.map(s => {
                    const globalIdx = sentenceList.indexOf(s);
                    return (
                      <button key={s.id} onClick={() => select(s, globalIdx)} className={`w-full text-left p-3 rounded-2xl text-sm transition-all ${current?.id === s.id ? 'bg-[#E6F7F0] border border-[#8FD8B5]/30' : 'hover:bg-[#F0F0EC]/50 border border-transparent'}`}>
                        <p className="font-medium text-[#2D3436] truncate">{s.chinese}</p>
                        <p className="text-xs text-[#B2BEC3] mt-0.5">{s.topic || "General"} · {s.band_level}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Practice Area */}
              <div className="lg:col-span-2 space-y-4">
                {current && (
                  <>
                    <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-[#E6F7F0] text-[#8FD8B5] text-xs font-semibold rounded-full">{current.topic || 'General'}</span>
                        <span className="px-3 py-1 bg-[#F0F0EC] text-[#636E72] text-xs font-semibold rounded-full">{current.band_level}</span>
                      </div>
                      <h3 className="font-semibold text-[#2D3436] mb-3">翻译下面的句子：</h3>
                      <div className="bg-[#FFF1C9]/50 rounded-2xl p-5 border border-[#FFF1C9]">
                        <p className="text-lg font-medium text-[#2D3436]">{current.chinese}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                      <h3 className="font-semibold text-[#2D3436] mb-3">你的答案</h3>
                      <textarea value={answer} onChange={e => handleAnswerChange(e.target.value)}
                        className="w-full min-h-[120px] bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm leading-relaxed resize-y"
                        placeholder="输入你的英文翻译..." />
                      <div className="flex items-center justify-between mt-4">
                        <button onClick={submit} disabled={!answer.trim() || loading}
                          className="flex items-center gap-2 bg-[#8FD8B5] text-white px-6 py-3 rounded-[16px] font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">
                          {loading ? '批改中...' : '提交答案'} <Send className="w-4 h-4" />
                        </button>
                        {idx + 1 < sentenceList.length && (
                          <button onClick={next} className="flex items-center gap-2 bg-[#8FD8B5] text-white px-6 py-3 rounded-[16px] font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">
                            下一题 <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {result && result.feedback && (
                      <div className="bg-white rounded-[20px] border-2 p-6 space-y-4" style={{
                        borderColor: result.feedback.total_score >= 80 ? '#8FD8B5' : result.feedback.total_score >= 60 ? '#FFD93D' : '#FF8A8A',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                      }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#8FD8B5]" />
                            <h3 className="font-bold text-[#2D3436]">AI 批改反馈</h3>
                          </div>
                          <div className="text-center">
                            <p className={`text-3xl font-bold ${result.feedback.total_score >= 80 ? 'text-[#8FD8B5]' : result.feedback.total_score >= 60 ? 'text-[#FFD93D]' : 'text-[#FF8A8A]'}`}>{result.feedback.total_score}</p>
                            <p className="text-xs text-[#B2BEC3]">得分</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#E6F7F0] rounded-2xl p-3"><p className="text-xs text-[#636E72]">语法</p><p className="text-lg font-bold text-[#8FD8B5]">{result.feedback.grammar_score}</p></div>
                          <div className="bg-[#E6F7F0] rounded-2xl p-3"><p className="text-xs text-[#636E72]">词汇</p><p className="text-lg font-bold text-[#8FD8B5]">{result.feedback.vocabulary_score}</p></div>
                        </div>
                        {result.feedback.errors.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-[#2D3436] mb-2 flex items-center gap-1.5"><XCircle className="w-4 h-4 text-[#FF8A8A]" />需要改进</h4>
                            <div className="space-y-2">
                              {result.feedback.errors.map((err, i) => (
                                <div key={i} className="bg-[#FFF5F5] rounded-2xl p-3">
                                  <p className="text-sm text-[#2D3436]">
                                    <span className="font-semibold text-[#FF8A8A]">[{err.type}]</span>{' '}
                                    <span className="line-through text-[#FF8A8A]">{err.wrong}</span>
                                    {' → '}
                                    <span className="font-semibold text-[#8FD8B5]">{err.correct}</span>
                                  </p>
                                  {err.context && <p className="text-xs text-[#636E72] mt-0.5">{err.context}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="bg-[#E6F7F0] rounded-2xl p-4">
                          <h4 className="font-semibold text-sm text-[#8FD8B5] flex items-center gap-1.5 mb-2"><Sparkles className="w-4 h-4" />改进建议</h4>
                          <p className="text-sm text-[#636E72] whitespace-pre-line">{result.feedback.improvement}</p>
                        </div>
                        <div className="bg-[#E6F7F0] rounded-2xl p-4">
                          <h4 className="font-semibold text-sm text-[#8FD8B5] flex items-center gap-1.5 mb-2"><CheckCircle className="w-4 h-4" />参考译文</h4>
                          <p className="text-sm text-[#636E72]">{result.feedback.optimized_version}</p>
                        </div>
                        <div className="bg-[#FFF1C9]/50 rounded-2xl p-4">
                          <h4 className="font-semibold text-sm text-[#B8952E] flex items-center gap-1.5 mb-2"><AlertCircle className="w-4 h-4" />雅思提分建议</h4>
                          <p className="text-sm text-[#6B5E2E]">{result.feedback.ielts_tips}</p>
                        </div>

                        {/* Practice History */}
                        {current && practiceHistory[current.id] && practiceHistory[current.id].length > 0 && (
                          <div className="border-t border-[#F0F0EC] pt-4 mt-4">
                            <button
                              onClick={() => setExpandedHistory(prev => ({ ...prev, [current.id]: !prev[current.id] }))}
                              className="flex items-center justify-between w-full text-left"
                            >
                              <h4 className="font-semibold text-sm text-[#636E72] flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-[#B2BEC3]" />
                                History ({practiceHistory[current.id].length})
                              </h4>
                              <span className="text-xs text-[#B2BEC3]">{expandedHistory[current.id] ? "▲" : "▼"}</span>
                            </button>
                            {expandedHistory[current.id] && (
                              <div className="space-y-3 mt-3">
                                {practiceHistory[current.id].map((h, hidx) => {
                                  const f = h.feedback;
                                  return (
                                    <div key={h.id} className="bg-[#FAFAF7] rounded-2xl p-3 border border-[#F0F0EC]">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-[#B2BEC3] font-mono">
                                          {new Date(h.practice_time).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        <span className={"text-xs font-bold px-2 py-0.5 rounded-full " + ((f?.total_score || h.score) >= 80 ? "bg-[#E6F7F0] text-[#8FD8B5]" : (f?.total_score || h.score) >= 60 ? "bg-[#FFF8E1] text-[#B8952E]" : "bg-[#FFF5F5] text-[#FF8A8A]")}>
                                          {(f?.total_score || h.score)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-[#2D3436] font-medium mb-1.5">{h.answer}</p>
                                      {f && f.errors && f.errors.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-1">
                                          {f.errors.map((err, ei) => (
                                            <span key={ei} className="text-[10px] px-1.5 py-0.5 bg-[#FFF5F5] text-[#FF8A8A] rounded-lg">
                                              {err.wrong}→{err.correct}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {f && f.improvement && (
                                        <p className="text-[10px] text-[#636E72] leading-relaxed truncate">{f.improvement}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </NavLayout>
  );
}








