'use client';

import { useEffect, useState } from 'react';
import NavLayout from '@/components/NavLayout';
import { review } from '@/lib/api';
import type { ReviewItem } from '@/lib/types';
import { RotateCcw, XCircle, ThumbsDown, ThumbsUp } from 'lucide-react';

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{ total_scheduled: number; pending_reviews: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [showAns, setShowAns] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const [d, s] = await Promise.all([review.today(), review.stats()]); setItems(d); setStats(s); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleReview = async (quality: number) => {
    const item = items[idx];
    if (!item) return;
    try {
      await review.complete(item.id, quality);
      if (idx + 1 < items.length) { setIdx(idx + 1); setShowAns(false); }
      else { load(); setIdx(0); setShowAns(false); }
    } catch (e) { console.error(e); }
  };

  const item = items[idx];

  return (
    <NavLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><RotateCcw className="w-6 h-6 text-[#8FD8B5]" />Review</h1>
          <p className="text-[#636E72] mt-1">Spaced repetition for effective learning</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[20px] p-5 border border-[#F0F0EC]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <p className="text-2xl font-bold text-[#8FD8B5]">{stats.total_scheduled}</p>
              <p className="text-xs text-[#636E72]">Scheduled</p>
            </div>
            <div className="bg-white rounded-[20px] p-5 border border-[#F0F0EC]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <p className="text-2xl font-bold text-[#FFD93D]">{stats.pending_reviews}</p>
              <p className="text-xs text-[#636E72]">Due today</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-[#B2BEC3]">
              <RotateCcw className="w-12 h-12 mx-auto mb-3" />
              <p>All caught up! 🎉</p>
              <p className="text-sm mt-1">Complete more practice to get review items</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#F0F0EC] rounded-full h-2">
                  <div className="bg-[#8FD8B5] h-2 rounded-full transition-all" style={{ width: (idx / items.length) * 100 + '%' }} />
                </div>
                <span className="text-sm text-[#B2BEC3] shrink-0">{idx + 1}/{items.length}</span>
              </div>

              <div className="border-2 border-[#F0F0EC] rounded-[20px] p-6 min-h-[200px]">
                {item?.content_type === 'practice' && item.content ? (
                  <div className="space-y-4">
                    <div className="bg-[#FFF1C9]/50 rounded-2xl p-4">
                      <p className="text-xs text-[#B8952E] mb-1">Chinese</p>
                      <p className="text-lg font-medium text-[#2D3436]">{String((item.content as any).chinese || '')}</p>
                    </div>
                    {showAns ? (
                      <>
                        <div className="bg-[#E6F7F0] rounded-2xl p-4">
                          <p className="text-xs text-[#8FD8B5] mb-1">Your answer</p>
                          <p className="text-[#2D3436]">{String((item.content as any).answer || '')}</p>
                        </div>
                        <div className="bg-[#E6F7F0] rounded-2xl p-4">
                          <p className="text-xs text-[#8FD8B5] mb-1">Reference</p>
                          <p className="text-[#2D3436]">{String((item.content as any).english || '')}</p>
                        </div>
                        <div className="text-center pt-2">
                          <p className="text-sm text-[#636E72] mb-3">Did you remember this?</p>
                          <div className="flex justify-center gap-3">
                            <button onClick={() => handleReview(0)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FFF5F5] text-[#FF8A8A] rounded-[16px] hover:bg-[#FFE0E0] transition-all text-sm font-medium"><XCircle className="w-4 h-4" />Forgot</button>
                            <button onClick={() => handleReview(3)} className="flex items-center gap-2 px-5 py-2.5 bg-[#FFF8E1] text-[#B8952E] rounded-[16px] hover:bg-[#FFF1C9] transition-all text-sm font-medium"><ThumbsDown className="w-4 h-4" />Hard</button>
                            <button onClick={() => handleReview(5)} className="flex items-center gap-2 px-5 py-2.5 bg-[#E6F7F0] text-[#8FD8B5] rounded-[16px] hover:bg-[#D0F0E0] transition-all text-sm font-medium"><ThumbsUp className="w-4 h-4" />Got it</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setShowAns(true)} className="w-full py-4 bg-[#F0F0EC] text-[#636E72] rounded-[16px] font-medium hover:bg-[#E0E0DC] transition-all">Show Answer</button>
                    )}
                  </div>
                ) : item?.content_type === 'error' && item.content ? (
                  <div className="space-y-4">
                    <div className="bg-[#FFF5F5] rounded-2xl p-4">
                      <p className="text-xs text-[#FF8A8A] mb-1">{String((item.content as any).error_type || '')}</p>
                      <p className="text-[#2D3436]"><span className="line-through text-[#FF8A8A]">{String((item.content as any).wrong || '')}</span> → <span className="text-[#8FD8B5] font-semibold">{String((item.content as any).correct || '')}</span></p>
                    </div>
                    {showAns ? (
                      <div className="text-center pt-2">
                        <p className="text-sm text-[#636E72] mb-3">Did you master this?</p>
                        <div className="flex justify-center gap-3">
                          <button onClick={() => handleReview(0)} className="px-5 py-2.5 bg-[#FFF5F5] text-[#FF8A8A] rounded-[16px] hover:bg-[#FFE0E0] transition-all text-sm font-medium">Not yet</button>
                          <button onClick={() => handleReview(3)} className="px-5 py-2.5 bg-[#FFF8E1] text-[#B8952E] rounded-[16px] hover:bg-[#FFF1C9] transition-all text-sm font-medium">Unsure</button>
                          <button onClick={() => handleReview(5)} className="px-5 py-2.5 bg-[#E6F7F0] text-[#8FD8B5] rounded-[16px] hover:bg-[#D0F0E0] transition-all text-sm font-medium">Mastered</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAns(true)} className="w-full py-4 bg-[#F0F0EC] text-[#636E72] rounded-[16px] font-medium hover:bg-[#E0E0DC] transition-all">Rate Your Recall</button>
                    )}
                  </div>
                ) : <p className="text-[#B2BEC3] text-center py-8">Unknown review type</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </NavLayout>
  );
}
