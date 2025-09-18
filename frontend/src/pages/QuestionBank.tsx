import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router-dom";
import Confetti from "../components/Confetti";
import {
  executeCode,
  judgeAnswer,
  listChapters,
  listQuestions,
  recordProgress,
} from "../services/api";
import type { Chapter, ExecutionResult, Question } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/question-bank.css";

const SYSTEM_PROMPT = `你是一名耐心的 Python 新手导师，需要根据题目要求判断学习者提交的代码是否完全满足题意。请逐步指出：\n1. 代码是否满足功能需求；\n2. 若不满足，请列出问题，并给出修改建议；\n3. 若满足，说明通过原因。\n请使用中文分步说明。`;

const difficultyBadges: Record<string, string> = {
  基础: "difficulty-badge difficulty-badge--easy",
  进阶: "difficulty-badge difficulty-badge--medium",
  挑战: "difficulty-badge difficulty-badge--hard",
};

const difficultyOrder = ["基础", "进阶", "挑战"] as const;

type RunState = {
  loading: boolean;
  result: ExecutionResult | null;
  error: string | null;
};

type JudgeState = {
  loading: boolean;
  feedback: string[];
  passed: boolean | null;
  error: string | null;
};

const defaultRunState: RunState = { loading: false, result: null, error: null };
const defaultJudgeState: JudgeState = { loading: false, feedback: [], passed: null, error: null };

const extractOptions = (prompt: string) => {
  const regex = /^-\s*([A-Z])\.\s*(.+)$/i;
  return prompt
    .split("\n")
    .map((line) => {
      const match = line.match(regex);
      if (!match) return null;
      return { key: match[1].toUpperCase(), label: match[2].trim() };
    })
    .filter((item): item is { key: string; label: string } => Boolean(item));
};

const deriveTitle = (question: Question) => {
  const lines = question.prompt.split("\n");
  const candidate = lines.find((line) => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith("#");
  });
  if (!candidate) return question.slug;
  return candidate.replace(/^[-*0-9.\s]+/, "").slice(0, 50);
};

const QuestionBank: React.FC = () => {
  const { user, setUser } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChapter, setSelectedChapter] = useState<string>(searchParams.get("chapter") || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(searchParams.get("difficulty") || "");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [stdinMap, setStdinMap] = useState<Record<string, string>>({});
  const [runStates, setRunStates] = useState<Record<string, RunState>>({});
  const [judgeStates, setJudgeStates] = useState<Record<string, JudgeState>>({});
  const [selectedOption, setSelectedOption] = useState<Record<string, string>>({});
  const [answerState, setAnswerState] = useState<Record<string, "correct" | "incorrect" | null>>({});
  const [messageState, setMessageState] = useState<Record<string, string | null>>({});
  const [celebrationMap, setCelebrationMap] = useState<Record<string, boolean>>({});
  const celebrationTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    listChapters().then((res) => setChapters(res.data));
  }, []);

  useEffect(() => {
    listQuestions({
      chapter: selectedChapter || undefined,
      difficulty: selectedDifficulty || undefined,
    }).then((res) => setQuestions(res.data));
  }, [selectedChapter, selectedDifficulty]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedChapter) params.set("chapter", selectedChapter);
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedChapter, selectedDifficulty, searchParams, setSearchParams]);

  
  useEffect(() => {
    const chapterParam = searchParams.get("chapter") || "";
    const difficultyParam = searchParams.get("difficulty") || "";
    setSelectedChapter((prev) => (prev === chapterParam ? prev : chapterParam));
    setSelectedDifficulty((prev) => (prev === difficultyParam ? prev : difficultyParam));
  }, [searchParams]);

const activeChapterTitle = useMemo(() => {
    if (!selectedChapter) return "全部章节";
    const chapter = chapters.find((item) => item.slug === selectedChapter);
    return chapter ? chapter.title : selectedChapter;
  }, [chapters, selectedChapter]);

  useEffect(() => () => {
    Object.values(celebrationTimers.current).forEach((timer) => window.clearTimeout(timer));
  }, []);

  const triggerCelebration = (slug: string) => {
    setCelebrationMap((prev) => ({ ...prev, [slug]: true }));
    if (celebrationTimers.current[slug]) {
      window.clearTimeout(celebrationTimers.current[slug]);
    }
    celebrationTimers.current[slug] = window.setTimeout(() => {
      setCelebrationMap((prev) => ({ ...prev, [slug]: false }));
      delete celebrationTimers.current[slug];
    }, 3000);
  };

  const updateRunState = (slug: string, data: Partial<RunState>) => {
    setRunStates((prev) => ({
      ...prev,
      [slug]: { ...defaultRunState, ...(prev[slug] ?? {}), ...data },
    }));
  };

  const updateJudgeState = (slug: string, data: Partial<JudgeState>) => {
    setJudgeStates((prev) => ({
      ...prev,
      [slug]: { ...defaultJudgeState, ...(prev[slug] ?? {}), ...data },
    }));
  };

  const handleRun = async (question: Question) => {
    const code = codeMap[question.slug] ?? "";
    updateRunState(question.slug, { loading: true, error: null });
    try {
      const response = await executeCode({
        code,
        stdin: stdinMap[question.slug] ?? undefined,
        memory_limit: question.memory_limit ?? undefined,
      });
      updateRunState(question.slug, { loading: false, result: response.data });
      setMessageState((prev) => ({ ...prev, [question.slug]: null }));
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message;
      updateRunState(question.slug, { loading: false, error: detail, result: null });
    }
  };

  const handleJudge = async (question: Question) => {
    if (!user) {
      setMessageState((prev) => ({ ...prev, [question.slug]: "请先登录再提交评测。" }));
      return;
    }
    const code = codeMap[question.slug] ?? "";
    if (!code.trim()) {
      setMessageState((prev) => ({ ...prev, [question.slug]: "请先编写代码。" }));
      return;
    }

    updateJudgeState(question.slug, { loading: true, error: null, feedback: [], passed: null });
    try {
      const payload = {
        question: question.prompt,
        reference: question.answer ?? "",
        user_code: code,
      };
      const response = await judgeAnswer(SYSTEM_PROMPT, JSON.stringify(payload));
      const { passed, feedback_steps } = response.data;
      updateJudgeState(question.slug, {
        loading: false,
        feedback: feedback_steps,
        passed,
      });

      if (passed) {
        const progressRes = await recordProgress(user.username, question.slug, 1);
        setUser(progressRes.data.user);
        setAnswerState((prev) => ({ ...prev, [question.slug]: "correct" }));
        setMessageState((prev) => ({ ...prev, [question.slug]: "判题通过，已记录进度。" }));
        triggerCelebration(question.slug);
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message;
      updateJudgeState(question.slug, { loading: false, error: detail });
    }
  };

  const handleCheckObjective = async (question: Question) => {
    const selected = selectedOption[question.slug];
    if (!selected) {
      setMessageState((prev) => ({ ...prev, [question.slug]: "请先选择一个选项。" }));
      return;
    }

    const correctAnswer = (question.answer || "").trim();
    const normalized = question.type === "单选题" ? selected.toUpperCase() : selected;
    const isCorrect = normalized === correctAnswer;
    setAnswerState((prev) => ({ ...prev, [question.slug]: isCorrect ? "correct" : "incorrect" }));
    setMessageState((prev) => ({
      ...prev,
      [question.slug]: isCorrect ? "回答正确！" : "回答错误，再试试看。",
    }));

    if (isCorrect) {
      triggerCelebration(question.slug);
    }

    if (isCorrect && user) {
      try {
        const progressRes = await recordProgress(user.username, question.slug, 1);
        setUser(progressRes.data.user);
      } catch (error: any) {
        const detail = error?.response?.data?.detail || error.message;
        setMessageState((prev) => ({ ...prev, [question.slug]: `答案正确，但进度保存失败：${detail}` }));
      }
    }
  };

  const renderObjectiveControls = (question: Question) => {
    if (question.type === "单选题") {
      const options = extractOptions(question.prompt);
      return (
        <div className="question-card__objective">
          {options.map((option) => (
            <label key={option.key} className="question-card__option">
              <input
                type="radio"
                name={`choice-${question.slug}`}
                value={option.key}
                checked={selectedOption[question.slug] === option.key}
                onChange={(event) =>
                  setSelectedOption((prev) => ({
                    ...prev,
                    [question.slug]: event.target.value,
                  }))
                }
              />
              <span>
                {option.key}. {option.label}
              </span>
            </label>
          ))}
          <button type="button" onClick={() => handleCheckObjective(question)}>检查答案</button>
        </div>
      );
    }

    if (question.type === "判断题") {
      const options = ["正确", "错误"];
      return (
        <div className="question-card__objective">
          {options.map((value) => (
            <label key={value} className="question-card__option">
              <input
                type="radio"
                name={`judge-${question.slug}`}
                value={value}
                checked={selectedOption[question.slug] === value}
                onChange={(event) =>
                  setSelectedOption((prev) => ({
                    ...prev,
                    [question.slug]: event.target.value,
                  }))
                }
              />
              <span>{value}</span>
            </label>
          ))}
          <button type="button" onClick={() => handleCheckObjective(question)}>检查答案</button>
        </div>
      );
    }

    return null;
  };

  const sortedChapters = useMemo(() => [...chapters].sort((a, b) => a.order - b.order), [chapters]);

  return (
    <section>
      <header className="question-bank__controls">
        <div>
          <label htmlFor="chapter">章节：</label>
          <select
            id="chapter"
            value={selectedChapter}
            onChange={(event) => setSelectedChapter(event.target.value)}
          >
            <option value="">全部章节</option>
            {sortedChapters.map((chapter) => (
              <option key={chapter.slug} value={chapter.slug}>
                {chapter.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="difficulty">难度：</label>
          <select
            id="difficulty"
            value={selectedDifficulty}
            onChange={(event) => setSelectedDifficulty(event.target.value)}
          >
            <option value="">全部</option>
            {difficultyOrder.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <p className="question-bank__summary">
          当前筛选：{activeChapterTitle} · {selectedDifficulty || "全部难度"} · 共 {questions.length} 道题
        </p>
      </header>

      <div className="question-bank__list">
        {questions.map((question) => {
          const isExpanded = expanded === question.slug;
          const runState = runStates[question.slug] ?? defaultRunState;
          const judgeState = judgeStates[question.slug] ?? defaultJudgeState;
          const title = deriveTitle(question);
          const badgeClass = difficultyBadges[question.difficulty] || "difficulty-badge";
          return (
            <article key={question.slug} className="question-card">
              <Confetti active={celebrationMap[question.slug] ?? false} />
              <header>
                <div className="question-card__heading">
                  <h3>{title}</h3>
                  <span className={badgeClass}>{question.difficulty}</span>
                </div>
                <div className="question-card__meta">
                  <span>章节：{question.chapter}</span>
                  <span>题型：{question.type}</span>
                  {question.memory_limit && <span>内存：{Math.round(question.memory_limit / (1024 * 1024))}MB</span>}
                </div>
              </header>
              {isExpanded && (
                <div className="question-card__details">
                  <div className="question-card__prompt">
                    <ReactMarkdown>{question.prompt}</ReactMarkdown>
                  </div>

                  {renderObjectiveControls(question)}

                  {question.type === "编程题" && (
                    <div className="question-card__coding">
                      <label className="question-card__label" htmlFor={`code-${question.slug}`}>
                        代码编辑
                      </label>
                      <textarea
                        id={`code-${question.slug}`}
                        value={codeMap[question.slug] ?? ""}
                        onChange={(event) =>
                          setCodeMap((prev) => ({
                            ...prev,
                            [question.slug]: event.target.value,
                          }))
                        }
                        placeholder="在此编写你的代码..."
                      />
                      <label className="question-card__label" htmlFor={`stdin-${question.slug}`}>
                        模拟输入（可选，每行代表一行输入）
                      </label>
                      <textarea
                        id={`stdin-${question.slug}`}
                        value={stdinMap[question.slug] ?? ""}
                        onChange={(event) =>
                          setStdinMap((prev) => ({
                            ...prev,
                            [question.slug]: event.target.value,
                          }))
                        }
                        placeholder="如需模拟用户输入，在此填写。"
                        className="question-card__stdin"
                      />
                      <div className="question-card__actions">
                        <button
                          type="button"
                          onClick={() => handleRun(question)}
                          disabled={runState.loading}
                        >
                          {runState.loading ? "运行中..." : "运行代码"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleJudge(question)}
                          disabled={judgeState.loading}
                        >
                          {judgeState.loading ? "判题中..." : "提交判题"}
                        </button>
                      </div>
                      <div className="question-card__console">
                        {runState.error && <p className="error">运行失败：{runState.error}</p>}
                        {runState.result && (
                          <div>
                            <p><strong>程序输出：</strong></p>
                            <pre>{runState.result.stdout || "(无输出)"}</pre>
                            {runState.result.stderr && (
                              <div>
                                <p><strong>错误输出：</strong></p>
                                <pre>{runState.result.stderr}</pre>
                              </div>
                            )}
                            {runState.result.error && (
                              <p className="error">{runState.result.error}</p>
                            )}
                          </div>
                        )}
                      </div>
                      {judgeState.error && <p className="error">判题失败：{judgeState.error}</p>}
                      {judgeState.feedback.length > 0 && (
                        <div className={`judge-feedback ${judgeState.passed ? "judge-feedback--pass" : ""}`}>
                          <strong>判题反馈：</strong>
                          <ReactMarkdown>{judgeState.feedback.join("\n")}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}

                  {question.explanation && (
                    <section>
                      <h4>解析</h4>
                      <ReactMarkdown>{question.explanation}</ReactMarkdown>
                    </section>
                  )}
                  {question.common_mistakes && (
                    <section>
                      <h4>常见错误</h4>
                      <ReactMarkdown>{question.common_mistakes}</ReactMarkdown>
                    </section>
                  )}
                  {question.advanced_insights && (
                    <section>
                      <h4>进阶拓展</h4>
                      <ReactMarkdown>{question.advanced_insights}</ReactMarkdown>
                    </section>
                  )}

                  {answerState[question.slug] && question.answer && (
                    <div
                      className={`question-card__answer ${
                        answerState[question.slug] === "correct" ? "is-correct" : "is-wrong"
                      }`}
                    >
                      <p>
                        正确答案：
                        <pre>{question.answer}</pre>
                      </p>
                    </div>
                  )}

                  {messageState[question.slug] && (
                    <p className="question-card__message">{messageState[question.slug]}</p>
                  )}
                </div>
              )}
              <footer>
                <button type="button" onClick={() => setExpanded(isExpanded ? null : question.slug)}>
                  {isExpanded ? "收起详情" : "查看详情"}
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default QuestionBank;
