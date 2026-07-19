// In-memory database
interface StoredUser {
  id: number; email: string; username: string; hashed_password: string;
  target_band: number; current_band: number; continuous_days: number; created_time: string;
}
interface StoredSentence {
  id: number; english: string; chinese: string; topic: string;
  band_level: string; tags: string; source: string; created_time: string;
}
interface StoredPractice {
  id: number; user_id: number; sentence_id: number; answer: string;
  score: number; practice_time: string;
}
interface StoredFeedback {
  id: number; practice_id: number; grammar_score: number;
  vocabulary_score: number; feedback_json: Record<string, unknown>; created_time: string;
}
interface StoredError {
  id: number; user_id: number; error_type: string; wrong: string;
  correct: string; context: string; count: number; created_time: string;
}
interface StoredReview {
  id: number; user_id: number; content_type: string; content_id: number;
  mastery: number; error_count: number; review_count: number;
  next_review_time: string; created_time: string;
}
interface StoredVocabulary {
  id: number; user_id: number; word: string; meaning: string;
  synonyms: string; collocations: string; example: string;
  topic: string; band_level: string; created_time: string;
}
interface StoredIdea {
  id: number; user_id: number; topic: string; question: string;
  position: string; reason: string; explanation: string;
  example: string; related_words: string; band_level: string; created_time: string;
}
interface StoredEssay {
  id: number; user_id: number; title: string; content: string;
  band_score: string; topic: string; analysis: string;
  source: string; created_time: string;
}
interface StoredEssayPractice {
  id: number; user_id: number; question: string; content: string;
  word_count: number; submitted: boolean; task_response: number;
  coherence: number; lexical_resource: number; grammar: number;
  overall: number; feedback: string; suggestions: string;
  created_time: string;
}

interface Database {
  users: StoredUser[]; sentences: StoredSentence[];
  practices: StoredPractice[]; feedbacks: StoredFeedback[];
  errors: StoredError[]; reviews: StoredReview[];
  vocabulary: StoredVocabulary[]; ideas: StoredIdea[];
  essays: StoredEssay[]; essay_practices: StoredEssayPractice[];
  counters: Record<string, number>;
}

let db: Database = {
  users: [], sentences: [], practices: [], feedbacks: [],
  errors: [], reviews: [], vocabulary: [], ideas: [],
  essays: [], essay_practices: [],
  counters: { users: 0, sentences: 0, practices: 0, feedbacks: 0, errors: 0, reviews: 0, vocabulary: 0, ideas: 0, essays: 0, essay_practices: 0 }
};

export function readDb(): Database { return db; }
export function writeDb(newDb: Database) { db = newDb; }


// Seed sample sentences
export function seedSentences() {
  if (db.sentences.length > 0) return;
  const samples = [
    { english: "The government should take effective measures to tackle environmental pollution.", chinese: "政府应该采取有效措施解决环境污染。", topic: "环境", band_level: "Band 7" },
    { english: "Education plays a crucial role in personal development and social progress.", chinese: "教育在个人发展和社会进步中起着关键作用。", topic: "教育", band_level: "Band 7" },
    { english: "Technological advancements have significantly improved our daily lives.", chinese: "技术进步显著提高了我们的日常生活质量。", topic: "科技", band_level: "Band 7" },
    { english: "Globalization has brought about unprecedented economic growth and cultural exchange.", chinese: "全球化带来了前所未有的经济增长和文化交流。", topic: "全球化", band_level: "Band 7" },
    { english: "A healthy diet combined with regular exercise is essential for maintaining good health.", chinese: "健康饮食加上定期运动对保持身体健康至关重要。", topic: "健康", band_level: "Band 7" },
    { english: "Parents play a vital role in shaping their children's character and values.", chinese: "父母在塑造孩子的性格和价值观方面起着重要作用。", topic: "教育", band_level: "Band 7" },
    { english: "The rapid development of AI is transforming various industries worldwide.", chinese: "人工智能的快速发展正在改变各行各业。", topic: "科技", band_level: "Band 8" },
    { english: "The preservation of cultural heritage is crucial for future generations.", chinese: "保护文化遗产对后代至关重要。", topic: "文化", band_level: "Band 8" },
    { english: "Governments should invest more in renewable energy to combat climate change.", chinese: "政府应该投资更多可再生能源以应对气候变化。", topic: "环境", band_level: "Band 8" },
    { english: "Social media has fundamentally changed how people communicate and share information.", chinese: "社交媒体根本改变了人们的沟通和信息共享方式。", topic: "科技", band_level: "Band 7" },
    { english: "The government must implement stricter laws to reduce crime rates in urban areas.", chinese: "政府必须实施更严格的法律来降低城市犯罪率。", topic: "犯罪", band_level: "Band 7" },
    { english: "Economic growth should not come at the expense of environmental sustainability.", chinese: "经济增长不应以环境可持续性为代价。", topic: "经济", band_level: "Band 8" },
    { english: "Access to quality healthcare is a fundamental right that every citizen deserves.", chinese: "获得优质医疗服务是每个公民应有的基本权利。", topic: "健康", band_level: "Band 7" },
    { english: "International trade agreements can foster economic cooperation between nations.", chinese: "国际贸易协定可以促进国家间的经济合作。", topic: "经济", band_level: "Band 7" },
    { english: "Rehabilitation programs are more effective than prison sentences for minor offenders.", chinese: "对轻罪罪犯而言，改造计划比监禁更有效。", topic: "犯罪", band_level: "Band 8" },
    { english: "Cultural diversity enriches society and promotes mutual understanding between different communities.", chinese: "文化多样性丰富了社会，促进了不同社区之间的相互理解。", topic: "文化", band_level: "Band 8" },
  ];
  for (const s of samples) {
    db.sentences.push({ id: ++db.counters.sentences, english: s.english, chinese: s.chinese, topic: s.topic, band_level: s.band_level, tags: "", source: "Seed", created_time: new Date().toISOString() });
  }
}

// Seed sample essays
export function seedEssays() {
  const e = db.essays;
  if (e.length > 0) return;
  const samples = [
    {
      title: "Should university education be free?",
      content: `In recent years, the debate over whether university education should be free has gained significant attention. This essay will examine both sides of this issue before reaching a conclusion.\n\nOn one hand, proponents of free university education argue that it promotes social equality. Students from low-income families often cannot afford high tuition fees, which prevents them from accessing higher education. Germany, for example, has abolished tuition fees for all students, resulting in a more educated workforce and reduced social inequality.\n\nOn the other hand, critics contend that free university education places an enormous burden on taxpayers. They argue that those who benefit from higher education should bear some of the costs themselves. Furthermore, when education is free, some students may not value it as much, potentially leading to higher dropout rates.\n\nIn my opinion, while free university education is an admirable goal, a more practical approach would be a hybrid system. Governments could subsidize a portion of tuition fees while requiring students to contribute through income-contingent loan schemes. This would ensure access for disadvantaged students while maintaining the quality of education.\n\nIn conclusion, although completely free university education has its merits, a balanced approach that shares costs between the state and students is the most viable solution for most countries.`,
      band_score: "7.5",
      topic: "Education",
      analysis: `## 文章结构分析\n\n### 引言\n- 开头：概括性陈述\n- 论点：将讨论双方观点\n\n### 主体段 1（支持）\n- 主题句：促进社会平等\n- 例子：德国\n- 使用具体论据\n\n### 主体段 2（反对）\n- 主题句：纳税人负担\n- 反驳并论证\n\n### 主体段 3（观点）\n- 明确的个人立场\n- 提出实际解决方案\n\n### 结论\n- 总结立场\n- 展望性陈述\n\n## 主要优点\n- 清晰的段落结构\n- 均衡论证\n- 具体例子\n- 高级词汇\n\n## 改进方向\n- 可以使用更多复杂句式\n- 更多样化的连接词`,
      source: "Sample"
    },
    {
      title: "Technology's impact on communication",
      content: `Technology has fundamentally transformed the way people communicate in the modern world. While this change has brought numerous benefits, it has also created some significant challenges that deserve careful consideration.\n\nThe most obvious advantage of technological advancement in communication is speed and convenience. Through email, instant messaging, and video calls, people can now connect with anyone across the globe in seconds. This has revolutionized business operations, allowing companies to operate internationally with unprecedented efficiency. Moreover, social media platforms enable people to maintain relationships across vast distances.\n\nHowever, the over-reliance on digital communication has raised concerns about the quality of human interaction. Face-to-face conversations are increasingly being replaced by text messages and emojis, which cannot convey tone, emotion, and body language effectively. Research has shown that excessive screen time can lead to social anxiety and reduced empathy among young people.\n\nIn my view, the key lies not in rejecting technology but in using it mindfully. While digital tools are invaluable for staying connected, they should complement rather than replace in-person interactions. Setting boundaries, such as device-free family meals, can help maintain the balance between virtual and real-world communication.\n\nTo conclude, technology has undoubtedly enhanced our ability to communicate across distances, but we must be cautious not to sacrifice the depth and quality of our relationships in the process.`,
      band_score: "7.0",
      topic: "Technology",
      analysis: `## 文章结构\n- 清晰引言陈述双方观点\n- 充分展开的主体段落\n- 个人观点段落\n- 有力的结论\n\n## 词汇亮点\n- "fundamentally transformed"\n- "unprecedented efficiency"\n- "over-reliance"\n- "mindfully"\n\n## 语法\n- 良好使用复杂句\n- 适当使用被动语态`,
      source: "Sample"
    }
  ];
  for (const s of samples) {
    db.essays.push({
      id: ++db.counters.essays, user_id: 0,
      title: s.title, content: s.content, band_score: s.band_score,
      topic: s.topic, analysis: s.analysis, source: s.source,
      created_time: new Date().toISOString()
    });
  }
}

// Seed sample vocabulary
export function seedVocabulary() {
  if (db.vocabulary.length > 0) return;
  const samples = [
    { word: "significant", meaning: "重要的，有意义的", synonyms: "crucial, vital, substantial, considerable", collocations: "significant impact, significant role, significant improvement", example: "Technology plays a significant role in modern education.", topic: "General", band_level: "Band 7" },
    { word: "demonstrate", meaning: "展示，证明", synonyms: "show, illustrate, indicate, reveal", collocations: "demonstrate the importance, demonstrate the effectiveness", example: "The study demonstrates the effectiveness of early intervention.", topic: "Academic", band_level: "Band 7" },
    { word: "consequently", meaning: "因此，所以", synonyms: "therefore, thus, hence, as a result", collocations: "consequently leads to, consequently results in", example: "Consequently, the government has decided to implement new policies.", topic: "General", band_level: "Band 7" },
    { word: "inevitable", meaning: "不可避免的", synonyms: "unavoidable, certain, destined", collocations: "inevitable consequence, inevitable result", example: "Climate change is an inevitable consequence of unchecked pollution.", topic: "Environment", band_level: "Band 8" },
    { word: "comprehensive", meaning: "全面的，综合的", synonyms: "thorough, complete, extensive, exhaustive", collocations: "comprehensive approach, comprehensive understanding", example: "A comprehensive approach is needed to solve this complex issue.", topic: "Academic", band_level: "Band 7" },
    { word: "mitigate", meaning: "减轻、缓解", synonyms: "alleviate, reduce, lessen, ease", collocations: "mitigate the impact, mitigate the effects", example: "Governments should take action to mitigate the effects of climate change.", topic: "Environment", band_level: "Band 8" },
    { word: "controversial", meaning: "有争议的", synonyms: "contentious, disputed, debatable", collocations: "controversial issue, controversial topic", example: "The issue of genetic engineering remains highly controversial.", topic: "Technology", band_level: "Band 7" },
    { word: "substantial", meaning: "大量的、实质的", synonyms: "considerable, significant, ample", collocations: "substantial investment, substantial evidence", example: "The government has made substantial investment in renewable energy.", topic: "General", band_level: "Band 7" },
    { word: "facilitate", meaning: "促进、推动", synonyms: "enable, promote, ease, assist", collocations: "facilitate communication, facilitate learning", example: "Technology can facilitate cross-cultural communication.", topic: "Technology", band_level: "Band 8" },
    { word: "detrimental", meaning: "有害的", synonyms: "harmful, damaging, adverse, negative", collocations: "detrimental effect, detrimental impact", example: "Excessive screen time can have a detrimental effect on children's health.", topic: "Health", band_level: "Band 8" },
  ];
  for (const s of samples) {
    db.vocabulary.push({ id: ++db.counters.vocabulary, user_id: 0, word: s.word, meaning: s.meaning, synonyms: s.synonyms, collocations: s.collocations, example: s.example, topic: s.topic, band_level: s.band_level, created_time: new Date().toISOString() });
  }
}

// Seed sample ideas
export function seedIdeas() {
  if (db.ideas.length > 0) return;
  const samples = [
    { topic: "Education", question: "Should university education be free?", position: "Support", reason: "Promotes social equality and economic growth", explanation: "免费教育让来自弱势家庭的有才华学生也能接受高等教育，缩小贫富差距。", example: "Germany abolished tuition fees in 2014, leading to higher enrollment rates from low-income families.", related_words: "机会平等、社会流动性、可及性、公共投资", band_level: "Band 7" },
    { topic: "Education", question: "Is homework beneficial for students?", position: "Conditional support", reason: "Reinforces learning when appropriately assigned", explanation: "家庭作业有助于巩固课堂学习，但过多的作业会造成压力，减少家庭时间。", example: "Studies show that 30 minutes of homework per night is optimal for primary school students.", related_words: "学业表现、课业量、自学、时间管理", band_level: "Band 7" },
    { topic: "Environment", question: "Should governments invest more in renewable energy?", position: "Strongly support", reason: "Combat climate change and ensure energy security", explanation: "可再生能源减少碳排放和对化石燃料的依赖，而化石燃料是有限的资源。", example: "Denmark now generates over 40% of its electricity from wind power.", related_words: "可持续发展、碳足迹、清洁能源、绿色科技", band_level: "Band 7" },
    { topic: "Technology", question: "Does social media do more harm than good?", position: "Balanced view", reason: "Benefits of connection must be weighed against mental health concerns", explanation: "社交媒体促进了全球连接和信息共享，但过度使用可能导致焦虑、抑郁和现实社交减少。", example: "A 2023 study found that limiting social media to 30 minutes per day significantly improved well-being.", related_words: "数字健康、在线隐私、屏幕时间、网络欺凌", band_level: "Band 7" },
    { topic: "Health", question: "Should governments ban junk food advertising?", position: "Support", reason: "Reduce obesity rates and healthcare costs", explanation: "广告影响消费者行为，尤其是儿童。禁止垃圾食品广告可以促进更健康的饮食习惯。", example: "Chile implemented strict food labeling and advertising regulations, leading to a 23% reduction in sugary drink purchases.", related_words: "公共卫生、肥胖流行、食品监管、营养意识", band_level: "Band 7" },
    { topic: "Technology", question: "Will AI replace human jobs?", position: "Cautious optimism", reason: "AI will transform rather than eliminate employment", explanation: "AI 将自动化重复性任务，但也会创造新的职业类别，让人们专注于创造性和人际交往工作。", example: "The Industrial Revolution eliminated many agricultural jobs but created entirely new industries.", related_words: "自动化、岗位替代、技能重塑、人类创造力", band_level: "Band 8" },
  ];
  for (const s of samples) {
    db.ideas.push({ id: ++db.counters.ideas, user_id: 0, topic: s.topic, question: s.question, position: s.position, reason: s.reason, explanation: s.explanation, example: s.example, related_words: s.related_words, band_level: s.band_level, created_time: new Date().toISOString() });
  }
}
