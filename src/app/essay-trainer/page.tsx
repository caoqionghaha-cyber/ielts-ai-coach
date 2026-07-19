"use client";
import { useState } from "react";
import NavLayout from "@/components/NavLayout";
import { essayPractice } from "@/lib/api";
import type { EssayScore } from "@/lib/types";
import { FileText, Clock, Send, Sparkles, ChevronRight, Lightbulb } from "lucide-react";
import Link from "next/link";



const SAMPLE_ESSAYS = [
  { topic: "Education", title: "Should university education be free?", question: "Some people think university education should be free for all students. Discuss both views and give your opinion.", essay: `In recent years, the debate over whether university education should be free has gained significant attention. This essay will examine both sides of this issue before reaching a conclusion.\n\nOn one hand, proponents of free university education argue that it promotes social equality. Students from low-income families often cannot afford high tuition fees. Germany, for example, has abolished tuition fees for all students, resulting in a more educated workforce and reduced social inequality.\n\nOn the other hand, critics contend that free university education places an enormous burden on taxpayers. They argue that those who benefit from higher education should bear some of the costs themselves. Furthermore, when education is free, some students may not value it as much.\n\nIn my opinion, while free university education is an admirable goal, a more practical approach would be a hybrid system. Governments could subsidize a portion of tuition fees while requiring students to contribute through income-contingent loan schemes.\n\nIn conclusion, although completely free university education has its merits, a balanced approach that shares costs between the state and students is the most viable solution for most countries.` },
  { topic: "Technology", title: "Technology's impact on communication", question: "Technology has made communication between people easier but less personal. To what extent do you agree or disagree?", essay: `Technology has fundamentally transformed the way people communicate in the modern world. While this change has brought numerous benefits, it has also created some significant challenges.\n\nThe most obvious advantage of technological advancement in communication is speed and convenience. Through email, instant messaging, and video calls, people can now connect with anyone across the globe in seconds. This has revolutionized business operations, allowing companies to operate internationally with unprecedented efficiency.\n\nHowever, the over-reliance on digital communication has raised concerns about the quality of human interaction. Face-to-face conversations are increasingly being replaced by text messages, which cannot convey tone, emotion, and body language effectively.\n\nIn my view, the key lies not in rejecting technology but in using it mindfully. While digital tools are invaluable for staying connected, they should complement rather than replace in-person interactions.\n\nTo conclude, technology has undoubtedly enhanced our ability to communicate across distances, but we must be cautious not to sacrifice the depth and quality of our relationships in the process.` },
  { topic: "Environment", title: "Renewable energy investment", question: "Governments should invest more in renewable energy rather than fossil fuels. Do you agree or disagree?", essay: `The issue of energy production has become increasingly pressing in the face of climate change. I strongly agree that governments should prioritize investment in renewable energy over fossil fuels.\n\nFirstly, renewable energy sources such as solar, wind, and hydroelectric power are essential for combating climate change. Fossil fuels are the primary contributors to greenhouse gas emissions, which cause global warming. Denmark, for instance, now generates over 40% of its electricity from wind power and has significantly reduced its carbon footprint.\n\nSecondly, investing in renewable energy creates long-term economic benefits. The renewable energy sector creates more jobs per unit of energy produced compared to the fossil fuel industry.\n\nNevertheless, critics argue that renewable energy is unreliable and intermittent. However, advances in battery storage technology are rapidly solving this problem, making renewable energy increasingly viable as a primary power source.\n\nIn conclusion, the environmental and economic arguments for renewable energy are compelling. Governments should accelerate the transition away from fossil fuels and invest substantially in clean energy infrastructure for a sustainable future.` },
  { topic: "Society", title: "Social media's impact", question: "The rise of social media has had a negative impact on society. Discuss the advantages and disadvantages.", essay: `The proliferation of social media platforms has fundamentally altered how people interact, consume information, and perceive the world. This essay will examine both the positive and negative aspects of this phenomenon.\n\nOn the positive side, social media has democratized communication and information sharing. People from different corners of the world can connect instantly, share ideas, and build communities around common interests. Social media has also been instrumental in raising awareness about important social issues.\n\nHowever, the negative impacts of social media are equally significant. Studies have linked excessive social media use to increased rates of anxiety, depression, and loneliness, particularly among young people. Moreover, the spread of misinformation and echo chambers has contributed to political polarization.\n\nIn my opinion, social media is a tool whose impact depends largely on how it is used. While platforms have a responsibility to address harmful content, users must also develop digital literacy skills.\n\nIn conclusion, although social media presents significant challenges to mental health and social cohesion, its benefits in connecting people and enabling information sharing should not be overlooked.` },
  { topic: "Education", title: "The role of homework", question: "Some people believe that homework is essential for student success, while others think it is unnecessary. Discuss both sides.", essay: `The role of homework in education has been a subject of ongoing debate among educators, parents, and researchers. This essay will examine both perspectives before offering a balanced conclusion.\n\nThose who support homework argue that it reinforces classroom learning and develops important study habits. When students practice concepts at home, they consolidate their understanding and identify areas that need improvement. Homework also teaches time management, self-discipline, and independent problem-solving skills.\n\nOpponents of homework contend that it places undue stress on students and encroaches on family time. Children need time for physical activity, creative play, and social interaction. Moreover, homework can exacerbate educational inequalities.\n\nIn my view, the key is not whether homework should exist, but rather what form it should take. Homework should be purposeful, appropriately challenging, and tailored to students' needs.\n\nIn conclusion, while excessive or poorly designed homework can be detrimental, well-planned homework that reinforces learning and develops independent study skills remains a valuable educational tool.` },
];

const SAMPLE_QUESTIONS = [
  "Some people think university education should be free for all students. Discuss both views and give your opinion.",
  "Technology has made communication between people easier but less personal. To what extent do you agree or disagree?",
  "Governments should invest more in renewable energy rather than fossil fuels. Do you agree or disagree?",
  "The rise of social media has had a negative impact on society. Discuss the advantages and disadvantages.",
  "Some people believe that homework is essential for student success, while others think it is unnecessary. Discuss both sides.",
];

export default function EssayTrainerPage() {
  const [question, setQuestion] = useState("");
  const [content, setContent] = useState("");
  const [practiceId, setPracticeId] = useState<number | null>(null);
  const [score, setScore] = useState<EssayScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2400);
  const [showSamples, setShowSamples] = useState(false);
  const [selectedSample, setSelectedSample] = useState<typeof SAMPLE_ESSAYS[0] | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const selectSample = (essay: typeof SAMPLE_ESSAYS[0]) => {
    setSelectedSample(essay);
    setQuestion(essay.question);
    setContent(essay.essay);
    setShowSamples(false);
  };
  
  const startPractice = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await essayPractice.create(question);
      setPracticeId(res.id);
      setStarted(true);
      setTimeLeft(2400);
      setTimerRunning(true);
      const timer = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timer); setTimerRunning(false); return 0; } return t - 1; });
      }, 1000);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const submitEssay = async () => {
    if (!practiceId || !content.trim()) return;
    setLoading(true);
    try {
      const res = await essayPractice.submit(practiceId, content);
      setScore({ task_response: res.task_response, coherence: res.coherence, lexical_resource: res.lexical_resource, grammar: res.grammar, overall: res.overall, feedback: res.feedback, suggestions: res.suggestions });
      setTimerRunning(false);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateContent = (val: string) => {
    setContent(val);
    setWordCount(val.trim() ? val.trim().split(/\s+/).length : 0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  return (
    <NavLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436] flex items-center gap-2"><FileText className="w-6 h-6 text-[#8FD8B5]" />Essay Trainer</h1>
            <p className="text-[#636E72] mt-1">Practice writing full essays with AI scoring</p>
          </div>
        </div>

        {!started ? (
          <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-6" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#2D3436]">Choose a Topic</h2>
              <button onClick={() => setShowSamples(!showSamples)} className="px-3 py-1.5 bg-[#FFF1C9] text-[#6B5E2E] rounded-[16px] text-sm font-medium hover:bg-[#E8D8A0] transition-all">
                {showSamples ? "Hide Samples" : "Sample Essays"}
              </button>
            </div>
            <div className="space-y-2 mb-6">
              {SAMPLE_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => setQuestion(q)}
                  className={"w-full text-left p-4 rounded-2xl text-sm border transition-all " + (question === q ? "border-[#8FD8B5] bg-[#E6F7F0]" : "border-[#F0F0EC] hover:border-[#8FD8B5]/30")}>
                  <div className="flex items-start gap-3">
                    <Lightbulb className={"w-5 h-5 mt-0.5 " + (question === q ? "text-[#8FD8B5]" : "text-[#B2BEC3]")} />
                    <span className="text-[#2D3436]">{q}</span>
                  </div>
                </button>
              ))}
            </div>
            {showSamples && (
              <div className="mb-6 bg-[#FAFAF7] rounded-2xl p-4 border border-[#F0F0EC]">
                <h3 className="text-sm font-semibold text-[#2D3436] mb-3">Practice with Sample Essays</h3>
                <p className="text-xs text-[#636E72] mb-4">Click an essay to load it into the editor for typing practice. Study the vocabulary and sentence structures.</p>
                <div className="space-y-2">
                  {SAMPLE_ESSAYS.map((essay, i) => (
                    <button key={i} onClick={() => selectSample(essay)}
                      className="w-full text-left p-3 rounded-2xl border border-[#F0F0EC] bg-white hover:border-[#8FD8B5] transition-all">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-[10px] rounded-full">{essay.topic}</span>
                        <span className="text-xs text-[#B2BEC3]">Sample Essay</span>
                      </div>
                      <p className="text-sm font-medium text-[#2D3436]">{essay.title}</p>
                      <p className="text-xs text-[#636E72] mt-1 line-clamp-2">{essay.question.substring(0, 80)}...</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="text-sm font-medium text-[#636E72] block mb-2">Or write your own question:</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm" rows={2} placeholder="Paste an IELTS Task 2 question..." />
            </div>
            <button onClick={startPractice} disabled={!question.trim() || loading}
              className="flex items-center gap-2 bg-[#8FD8B5] text-white px-6 py-3 rounded-[16px] font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">
              {loading ? "Starting..." : "Start Writing"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : score ? (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-[20px] border-2 border-[#8FD8B5] p-6" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#8FD8B5]" />
                  <h2 className="font-bold text-[#2D3436]">AI Score</h2>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#8FD8B5]">{score.overall}</p>
                  <p className="text-xs text-[#B2BEC3]">Overall Band</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Task Response", value: score.task_response, color: "#8FD8B5" },
                  { label: "Coherence & Cohesion", value: score.coherence, color: "#FFD93D" },
                  { label: "Lexical Resource", value: score.lexical_resource, color: "#A8D8EA" },
                  { label: "Grammar", value: score.grammar, color: "#FF8A8A" },
                ].map(s => (
                  <div key={s.label} className="bg-[#FAFAF7] rounded-2xl p-4">
                    <p className="text-xs text-[#636E72]">{s.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-[#E6F7F0] rounded-2xl p-4">
                <p className="text-sm text-[#636E72] whitespace-pre-line">{score.feedback}</p>
              </div>
              {score.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-sm text-[#2D3436]">Suggestions:</h4>
                  {score.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#636E72]">
                      <span className="text-[#8FD8B5] font-bold mt-0.5">{i + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setStarted(false); setScore(null); setContent(""); setPracticeId(null); setQuestion(""); }}
              className="text-sm text-[#8FD8B5] font-medium hover:text-[#6BBF99] transition-colors">&larr; Practice another essay</button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedSample && (
              <div className="bg-[#FFF1C9]/50 rounded-[20px] border border-[#FFF1C9] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#6B5E2E]">Study: {selectedSample.title}</h3>
                  <span className="px-2 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] text-[10px] rounded-full">{selectedSample.topic}</span>
                </div>
                <p className="text-xs text-[#636E72] mb-2">Type the essay below to practice. Pay attention to vocabulary and sentence structure.</p>
                <details className="text-xs">
                  <summary className="text-[#8FD8B5] cursor-pointer font-medium hover:text-[#6BBF99]">Show key vocabulary</summary>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["significant", "substantial", "consequently", "fundamentally", "inevitable", "comprehensive", "demonstrate", "mitigate", "controversial", "furthermore", "nevertheless", "moreover"].map(w => (
                      <span key={w} className="px-2 py-0.5 bg-[#E6F7F0] text-[#8FD8B5] rounded-full">{w}</span>
                    ))}
                  </div>
                </details>
              </div>
            )}
            
            {/* Timer & Word Count */}
            <div className="flex items-center justify-between bg-white rounded-[20px] border border-[#F0F0EC] p-4" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8FD8B5]" />
                <span className={"font-semibold " + (timeLeft < 300 ? "text-[#FF8A8A]" : "text-[#2D3436]")}>{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8FD8B5]" />
                <span className="font-semibold text-[#2D3436]">{wordCount} words</span>
                {wordCount < 250 && <span className="text-xs text-[#B2BEC3]">(min 250)</span>}
              </div>
            </div>

            {/* Question */}
            <div className="bg-[#FFF1C9]/50 rounded-[20px] border border-[#FFF1C9] p-5">
              <p className="text-sm font-medium text-[#6B5E2E]">{question}</p>
            </div>

            {/* Writing Area */}
            <div className="bg-white rounded-[20px] border border-[#F0F0EC] p-4" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
              <textarea value={content} onChange={e => updateContent(e.target.value)}
                className="w-full min-h-[300px] bg-[#FAFAF7] border border-[#F0F0EC] rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#8FD8B5]/30 text-sm leading-relaxed resize-y"
                placeholder="Write your essay here..." />
            </div>

            <button onClick={submitEssay} disabled={!content.trim() || loading}
              className="flex items-center gap-2 bg-[#8FD8B5] text-white px-6 py-3 rounded-[16px] font-semibold hover:bg-[#6BBF99] transition-all disabled:opacity-50">
              {loading ? "Scoring..." : "Submit for AI Scoring"} <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </NavLayout>
  );
}
