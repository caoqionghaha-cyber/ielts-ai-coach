'use client';

import { useEffect, useState } from 'react';
import NavLayout from '@/components/NavLayout';
import { sentences } from '@/lib/api';
import type { Sentence } from '@/lib/types';
import { BookOpen, Plus, Search, Upload } from 'lucide-react';
import Link from 'next/link';
const TOPIC_EN: Record<string, string> = {
  "环境": "Environment", "教育": "Education", "科技": "Technology",
  "全球化": "Globalization", "健康": "Health", "文化": "Culture",
  "犯罪": "Crime", "经济": "Economy", "General": "General",
};
function topicDisplay(t: string) { return TOPIC_EN[t] || t; }

const SEED = [
  { english: 'The government should take effective measures to tackle environmental pollution.', chinese: '政府应该采取有效措施解决环境污染。', topic: '环境', band_level: 'Band 7+' },
  { english: 'Education plays a crucial role in personal development and social progress.', chinese: '教育在个人发展和社会进步中起着关键作用。', topic: '教育', band_level: 'Band 7+' },
  { english: 'Technological advancements have significantly improved our daily lives.', chinese: '技术进步显著提高了我们的日常生活质量。', topic: '科技', band_level: 'Band 7+' },
  { english: 'Globalization has brought about unprecedented economic growth and cultural exchange.', chinese: '全球化带来了前所未有的经济增长和文化交流。', topic: '全球化', band_level: 'Band 7+' },
  { english: 'A healthy diet combined with regular exercise is essential for maintaining good health.', chinese: '健康饮食加上定期运动对保持身体健康至关重要。', topic: '健康', band_level: 'Band 7+' },
  { english: "Parents play a vital role in shaping their children's character and values.", chinese: '父母在塑造孩子的性格和价值观方面起着重要作用。', topic: '教育', band_level: 'Band 7+' },
  { english: 'The rapid development of AI is transforming various industries worldwide.', chinese: '人工智能的快速发展正在改变各行各业。', topic: '科技', band_level: 'Band 8+' },
  { english: 'The preservation of cultural heritage is crucial for future generations.', chinese: '保护文化遗产对后代至关重要。', topic: '文化', band_level: 'Band 8+' },
  { english: 'Governments should invest more in renewable energy to combat climate change.', chinese: '政府应该投资更多可再生能源以应对气候变化。', topic: '环境', band_level: 'Band 8+' },
  { english: 'Social media has fundamentally changed how people communicate and share information.', chinese: '社交媒体根本性改变了人们的沟通和信息共享方式。', topic: '科技', band_level: 'Band 7+' },
];

export default function MaterialsPage() {
  const [list, setList] = useState<Sentence[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ english: '', chinese: '', topic: '', band_level: 'Band 7+' });
  const [uploading, setUploading] = useState(false);
  const [parsedPairs, setParsedPairs] = useState<Array<{chinese: string; english: string}>>([]);
  const [uploadError, setUploadError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const d = await sentences.list({ topic: topic || undefined, search: search || undefined, limit: 100 });
      if (d && d.sentences) setList(d.sentences);
    } catch (e) { console.error('Failed to load sentences:', e); }
    try {
      const t = await sentences.topics();
      if (t) setTopics(t);
    } catch (e) { console.error('Failed to load topics:', e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [topic]);

  const seed = async () => {
    try { await sentences.batchCreate(SEED); load(); } catch (e) { console.error(e); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError(''); setParsedPairs([]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setParsedPairs(data.pairs);
      if (data.pairs.length === 0) setUploadError('文件中未找到中英文句子对');
    } catch (err) { setUploadError(err instanceof Error ? err.message : 'Upload failed'); }
    finally { setUploading(false); }
  };

  const importParsed = async () => {
    if (parsedPairs.length === 0) return;
    try {
      await sentences.batchCreate(parsedPairs.map(p => ({ english: p.english, chinese: p.chinese, topic: form.topic || '', band_level: 'Band 7+' })));
      setParsedPairs([]);
      load();
    } catch (err) { setUploadError('Import failed'); }
  };
  const add = async () => {
    if (!form.english || !form.chinese) return;
    try { await sentences.create({ ...form, tags: '', source: '' }); setForm({ english: '', chinese: '', topic: '', band_level: 'Band 7+' }); load(); } catch (e) { console.error(e); }
  };

  return (
    <NavLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><BookOpen className="w-6 h-6 text-[#8FD8B5]" />My Library</h1>
            <p className="text-[#636E72] mt-1">Manage your sentence collection</p>
          </div>
          <div className="flex gap-2">
            <button onClick={seed} className="px-4 py-2 bg-[#F0F0EC] text-[#636E72] rounded-[16px] text-sm font-medium hover:bg-[#E0E0DC] transition-all">📥 Import</button>
            <label className="px-4 py-2 bg-[#8FD8B5]/20 text-[#8FD8B5] rounded-[16px] text-sm font-medium hover:bg-[#8FD8B5]/30 transition-all cursor-pointer flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> Upload
              <input type="file" accept=".txt,.docx,.pdf" onChange={handleUpload} className="hidden" />
            </label>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-medium hover:bg-[#6BBF99] transition-all flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add</button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-[20px] p-6 border border-[#F0F0EC]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <h3 className="font-semibold text-[#2D3436] mb-4">New Sentence</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs text-[#636E72] mb-1 block">English</label><textarea value={form.english} onChange={e => setForm({ ...form, english: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={2} /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Chinese</label><textarea value={form.chinese} onChange={e => setForm({ ...form, chinese: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={2} /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Topic</label><input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" /></div>
              <div><label className="text-xs text-[#636E72] mb-1 block">Band</label><select value={form.band_level} onChange={e => setForm({ ...form, band_level: e.target.value })} className="w-full px-4 py-2.5 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none text-sm"><option>Band 5</option><option>Band 6</option><option>Band 6.5</option><option>Band 7</option><option>Band 7+</option><option>Band 8+</option></select></div>
            </div>
            <button onClick={add} disabled={!form.english || !form.chinese} className="mt-4 px-6 py-2.5 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">Add to Library</button>
          </div>
        )}

        
        {parsedPairs.length > 0 && (
          <div className="bg-white rounded-[20px] p-6 border-2 border-[#8FD8B5]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#2D3436]">解析出 {parsedPairs.length} 组中英文句子对</h3>
              <div className="flex gap-2">
                <button onClick={importParsed} className="px-4 py-2 bg-[#8FD8B5] text-white rounded-[16px] text-sm font-semibold hover:bg-[#6BBF99] transition-all">导入全部</button>
                <button onClick={() => setParsedPairs([])} className="px-4 py-2 bg-[#F0F0EC] text-[#636E72] rounded-[16px] text-sm hover:bg-[#E0E0DC] transition-all">取消</button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {parsedPairs.slice(0, 20).map((p, i) => (
                <div key={i} className="bg-[#FAFAF7] rounded-2xl p-3 border border-[#F0F0EC]">
                  <p className="text-xs text-[#636E72]">{p.chinese}</p>
                  <p className="text-sm text-[#2D3436] font-medium">{p.english}</p>
                </div>
              ))}
              {parsedPairs.length > 20 && <p className="text-xs text-[#B2BEC3] text-center py-2">...还有 {parsedPairs.length - 20} 组</p>}
            </div>
          </div>
        )}

        {uploadError && (
          <div className="bg-[#FFF5F5] text-[#FF8A8A] rounded-2xl p-4 text-sm">{uploadError}</div>
        )}

        {uploading && (
          <div className="bg-white rounded-[20px] p-6 text-center border border-[#F0F0EC]">
            <div className="animate-spin w-6 h-6 border-3 border-[#8FD8B5] border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-[#636E72]">解析文件中...</p>
          </div>
        )}
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B2BEC3]" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F0F0EC] rounded-[16px] outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" />
          </div>
          <button onClick={() => setTopic('')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !topic ? 'bg-[#8FD8B5] text-white' : 'bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]'
          }`}>All</button>
          {topics.map(t => (
            <button key={t} onClick={() => setTopic(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              topic === t ? 'bg-[#8FD8B5] text-white' : 'bg-[#F0F0EC] text-[#636E72] hover:bg-[#E0E0DC]'
            }`}>{topicDisplay(t)}</button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-[20px] border border-[#F0F0EC] overflow-hidden" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-3 border-[#8FD8B5] border-t-transparent rounded-full" /></div>
          ) : list.length === 0 ? (
            <div className="text-center py-12 text-[#B2BEC3]">
              <BookOpen className="w-12 h-12 mx-auto mb-3" />
              <p>Your library is empty</p>
              <p className="text-sm mt-1">点击 Import 添加示例句子</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0EC]">
              {list.map(s => (
                <div key={s.id} className="p-4 hover:bg-[#FAFAF7] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#636E72]">{s.chinese}</p>
                      <p className="text-[#2D3436] font-medium mt-0.5">{s.english}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2.5 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-xs rounded-full">{s.topic || 'General'}</span>
                        <span className="px-2.5 py-0.5 bg-[#F0F0EC] text-[#636E72] text-xs rounded-full">{s.band_level}</span>
                      </div>
                    </div>
                    <Link href="/practice" className="shrink-0 px-4 py-2 bg-[#E6F7F0] text-[#8FD8B5] rounded-[16px] text-sm font-medium hover:bg-[#8FD8B5] hover:text-white transition-all">Practice →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NavLayout>
  );
}


