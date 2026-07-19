export function gradeTranslation(correctEnglish: string, _chinese: string, userAnswer: string): FeedbackResult {
  const userLower = userAnswer.toLowerCase().trim();
  const correctLower = correctEnglish.toLowerCase().trim();
  const userWords = new Set(userLower.split(/\s+/));
  const correctWords = new Set(correctLower.split(/\s+/));
  let overlap = 0;
  userWords.forEach(w => { if (correctWords.has(w)) overlap++; });
  const wordAccuracy = overlap / Math.max(correctWords.size, 1);
  const grammarIssues = checkGrammar(userAnswer);
  const vocabIssues = checkVocabulary(userAnswer);
  const collocationIssues = checkCollocations(userAnswer, correctEnglish);
  const naturalnessScore = Math.min(100, wordAccuracy * 85 + 15);
  const grammarPenalty = grammarIssues.length * 10;
  const vocabPenalty = vocabIssues.length * 8;
  const collocationPenalty = collocationIssues.length * 6;
  const grammarScore = Math.max(0, Math.min(100, wordAccuracy * 80 - grammarPenalty + 20));
  const vocabScore = Math.max(0, Math.min(100, wordAccuracy * 70 - vocabPenalty + 30));
  const totalScore = Math.max(0, Math.min(100, (grammarScore + vocabScore + naturalnessScore) / 3));
  const errors = [...grammarIssues, ...vocabIssues, ...collocationIssues];
  let improvement: string;
  if (totalScore >= 90) improvement = "翻译非常出色！你的英语表达自然准确。继续保持。\n\n达到 Band 8+ 的建议：\n" + correctEnglish;
  else if (totalScore >= 80) improvement = "非常好！有少量细节可以优化。\n\n参考译文：\n" + correctEnglish;
  else if (totalScore >= 70) improvement = "不错的尝试！有一些明确的改进空间。\n\n推荐版本：\n" + correctEnglish;
  else if (totalScore >= 60) improvement = "有进步！注意语法和词汇的准确性。\n\n正确答案：\n" + correctEnglish;
  else improvement = "需要大幅改进。先理解中文意思，再对比英文原文。\n\n正确答案：\n" + correctEnglish;
  let ieltsTips: string;
  if (totalScore >= 85) ieltsTips = "已达到 Band 7+ 水平！注意句式多样性和词汇精准度，冲击 Band 8。";
  else if (totalScore >= 70) ieltsTips = "Band 6-7 水平。重点提升高级词汇替换和语法准确性。";
  else if (totalScore >= 55) ieltsTips = "Band 5-6 水平。打好语法基础，熟记核心句型。";
  else ieltsTips = "Band 5 以下。从背诵和模仿范文句子开始，逐步提升。";
  return {
    total_score: Math.round(totalScore * 10) / 10,
    grammar_score: Math.round(grammarScore * 10) / 10,
    vocabulary_score: Math.round(vocabScore * 10) / 10,
    collocation_score: Math.round(naturalnessScore * 10) / 10,
    naturalness_score: Math.round(naturalnessScore * 10) / 10,
    errors,
    improvement,
    optimized_version: correctEnglish,
    ielts_tips: ieltsTips,
  };
}


export function gradeEssay(content: string, question: string): EssayScoreResult {
  const wordCount = content.split(/\s+/).length;
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const contentLower = content.toLowerCase();
  const sentences_count = (content.match(/[.?!]/g) || []).length;
  const avgSentenceLength = wordCount / Math.max(sentences_count, 1);

  // --- Task Response ---
  let taskResponse = 4.0;
  if (wordCount >= 50) taskResponse = 4.5;
  if (wordCount >= 100) taskResponse = 5.0;
  if (wordCount >= 150) taskResponse = 5.5;
  if (wordCount >= 200) taskResponse = 6.0;
  if (wordCount >= 250) taskResponse = 6.5;
  if (wordCount >= 300) taskResponse = 7.0;
  // Check if topic is addressed
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const topicMatchCount = questionWords.filter(w => contentLower.includes(w)).length;
  const topicRatio = topicMatchCount / Math.max(questionWords.length, 1);
  if (topicRatio > 0.3) taskResponse += 0.5;
  if (sentences_count >= 8) taskResponse += 0.5;
  taskResponse = Math.min(9, Math.max(1, taskResponse));

  // --- Coherence & Cohesion ---
  let coherence = 4.0;
  if (paragraphs.length >= 2) coherence = 5.0;
  if (paragraphs.length >= 3) coherence = 5.5;
  if (paragraphs.length >= 4) coherence = 6.5;
  const linkingWords = ['however', 'moreover', 'furthermore', 'nevertheless', 'therefore', 'consequently', 'in addition', 'on the other hand', 'in conclusion', 'for example', 'for instance', 'as a result', 'in contrast', 'firstly', 'secondly', 'finally'];
  const linkingCount = linkingWords.filter(w => contentLower.includes(w)).length;
  if (linkingCount >= 4) coherence += 1.0;
  else if (linkingCount >= 2) coherence += 0.5;
  const hasIntro = contentLower.includes('in conclusion') || contentLower.includes('to conclude') || contentLower.includes('to summarise') || contentLower.includes('in summary');
  if (hasIntro) coherence += 0.5;
  coherence = Math.min(9, Math.max(1, coherence));

  // --- Lexical Resource ---
  let lexicalResource = 4.0;
  if (wordCount >= 100) lexicalResource = 5.0;
  if (wordCount >= 200) lexicalResource = 5.5;
  const highLevelWords = ['significant', 'substantial', 'consequently', 'inevitable', 'comprehensive', 'demonstrate', 'mitigate', 'controversial', 'facilitate', 'detrimental', 'moreover', 'furthermore', 'nevertheless', 'therefore', 'essential', 'crucial', 'beneficial', 'considerable', 'remarkable', 'widespread'];
  const highLevelCount = highLevelWords.filter(w => contentLower.includes(w)).length;
  if (highLevelCount >= 8) lexicalResource += 2.0;
  else if (highLevelCount >= 5) lexicalResource += 1.5;
  else if (highLevelCount >= 3) lexicalResource += 1.0;
  else if (highLevelCount >= 1) lexicalResource += 0.5;
  // Check vocabulary diversity
  const uniqueWords = new Set(contentLower.split(/\s+/).filter(w => w.length > 2)).size;
  if (uniqueWords > 80) lexicalResource += 0.5;
  lexicalResource = Math.min(9, Math.max(1, lexicalResource));

  // --- Grammar ---
  let grammar = 4.0;
  if (sentences_count >= 3) grammar = 5.0;
  if (sentences_count >= 8) grammar = 5.5;
  if (sentences_count >= 12) grammar = 6.0;
  if (avgSentenceLength >= 12 && avgSentenceLength <= 25) grammar += 1.0;
  else if (avgSentenceLength >= 8) grammar += 0.5;
  // Check for complex structures
  const complexIndicators = ['which', 'that', 'although', 'because', 'while', 'whereas', 'despite', 'however'];
  const complexCount = complexIndicators.filter(w => contentLower.includes(' ' + w + ' ')).length;
  if (complexCount >= 5) grammar += 1.0;
  else if (complexCount >= 3) grammar += 0.5;
  // Penalty for very short content
  if (wordCount < 30) grammar = Math.min(grammar, 4.5);
  grammar = Math.min(9, Math.max(1, grammar));

  const overall = Math.round(((taskResponse + coherence + lexicalResource + grammar) / 4) * 2) / 2;

  // --- Suggestions ---
  var suggestions: string[] = [];
  if (wordCount < 250) suggestions.push("增加作文字数至至少 250 词（Task 2）。");
  if (paragraphs.length < 3) suggestions.push("将文章分为清晰段落：引言、主体段和结论。");
  if (highLevelCount < 3) suggestions.push("使用更多学术词汇提升词汇资源分数。目前使用的学术词汇较少。");
  if (avgSentenceLength < 10) suggestions.push("句子过短，尝试使用从句等复杂句式增加句式多样性。");
  if (linkingCount < 3) suggestions.push("使用更多连接词（如 however, moreover, furthermore）提升连贯性。");
  if (!hasIntro) suggestions.push("添加清晰的引言段和结论段。");
  if (topicRatio < 0.2) suggestions.push("确保文章内容紧扣题目主题。");
  if (sentences_count < 8) suggestions.push("文章篇幅不足，需要更充分地展开论述。");
  if (suggestions.length === 0) suggestions.push("整体表现良好，继续练习以保持水平。");

  const feedback = [
    "作文题目：" + question,
    "字数为 " + wordCount + " 词，共 " + paragraphs.length + " 段，" + sentences_count + " 句话。",
    "",
    "TR（任务回应）：" + taskResponse.toFixed(1) + " — " + (taskResponse >= 7 ? "较好回应题目" : taskResponse >= 5.5 ? "基本回应题目" : "回应不足"),
    "CC（连贯与衔接）：" + coherence.toFixed(1) + " — " + (coherence >= 7 ? "结构清晰连贯" : coherence >= 5.5 ? "结构基本合理" : "结构需要改进"),
    "LR（词汇资源）：" + lexicalResource.toFixed(1) + " — " + (lexicalResource >= 7 ? "词汇丰富多样" : lexicalResource >= 5.5 ? "词汇使用基本正确" : "词汇较为单一"),
    "GRA（语法范围与准确性）：" + grammar.toFixed(1) + " — " + (grammar >= 7 ? "语法准确且句式多样" : grammar >= 5.5 ? "语法基本正确" : "语法错误较多"),
    "",
    "改进建议：",
  ].concat(suggestions.map((s, i) => (i + 1) + ". " + s)).join("\n");

  return {
    task_response: Math.round(taskResponse * 10) / 10,
    coherence: Math.round(coherence * 10) / 10,
    lexical_resource: Math.round(lexicalResource * 10) / 10,
    grammar: Math.round(grammar * 10) / 10,
    overall,
    feedback,
    suggestions,
  };
}
interface FeedbackResult {
  total_score: number;
  grammar_score: number;
  vocabulary_score: number;
  collocation_score: number;
  naturalness_score: number;
  errors: Array<{ type: string; wrong: string; correct: string; context: string }>;
  improvement: string;
  optimized_version: string;
  ielts_tips: string;
}

interface EssayScoreResult {
  task_response: number;
  coherence: number;
  lexical_resource: number;
  grammar: number;
  overall: number;
  feedback: string;
  suggestions: string[];
}

function checkGrammar(text: string) {
  const issues: Array<{ type: string; wrong: string; correct: string; context: string }> = [];
  const words = text.split(/\s+/);
  const articleTriggers = ["government", "environment", "education", "society", "technology", "economy", "health", "internet"];
  for (let i = 0; i < words.length; i++) {
    const clean = words[i].toLowerCase().replace(/[.,!?;:]/g, "");
    if (articleTriggers.includes(clean)) {
      const hasArticle = i > 0 && ["a", "an", "the"].includes(words[i - 1].toLowerCase());
      if (!hasArticle) {
        issues.push({ type: "冠词", wrong: words[i], correct: "the " + words[i], context: "\"" + words[i] + "\" 通常需要加冠词" });
      }
    }
  }
  return issues;
}

function checkVocabulary(text: string) {
  const issues: Array<{ type: string; wrong: string; correct: string; context: string }> = [];
  const weakWords: Record<string, string> = { important: "significant / crucial / vital", good: "beneficial / advantageous / positive", bad: "harmful / detrimental / adverse", big: "substantial / considerable / immense", small: "minor / negligible / marginal", "a lot": "a great deal / significantly / substantially", very: "extremely / remarkably / considerably" };
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[.,!?;:]/g, "");
    if (weakWords[clean]) {
      issues.push({ type: "词汇", wrong: clean, correct: weakWords[clean], context: "将 '" + clean + "' 替换为更高级的雅思词汇" });
    }
  }
  return issues;
}

function checkCollocations(text: string, correct: string) {
  const issues: Array<{ type: string; wrong: string; correct: string; context: string }> = [];
  const badCollocs: Record<string, string> = { "make research": "conduct research", "do a decision": "make a decision", "make a choice": "make a choice" };
  const textLower = text.toLowerCase();
  for (const [bad, good] of Object.entries(badCollocs)) {
    if (textLower.includes(bad)) {
      issues.push({ type: "搭配", wrong: bad, correct: good, context: "使用正确的搭配" });
    }
  }
  const envPatterns = [["environment pollution", "environmental pollution"], ["make effort", "make an effort"], ["take attention", "pay attention"]];
  for (const [bad, good] of envPatterns) {
    if (textLower.includes(bad)) {
      issues.push({ type: "搭配", wrong: bad, correct: good, context: "标准雅思搭配" });
    }
  }
  return issues;
}
