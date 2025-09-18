import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Confetti from "../components/Confetti";
import { useModal } from "../contexts/ModalContext";
import {
  executeCode,
  getQuestion,
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

const getExcerpt = (prompt: string) => {
  const clean = prompt.replace(/[#*>`-]/g, " ").replace(/\s+/g, " ").trim();
  return clean.slice(0, 90) + (clean.length > 90 ? "…" : "");
};

const QuestionBank: React.FC = () => {
  const { user, setUser } = useAuth();
  const { openModal, closeModal } = useModal();
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedChapter = searchParams.get("chapter") ?? "";
  const selectedDifficulty = searchParams.get("difficulty") ?? "";

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [detailQuestion, setDetailQuestion] = useState<Question | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [stdinMap, setStdinMap] = useState<Record<string, string>>({});
  const [runStates, setRunStates] = useState<Record<string, RunState>>({});
  const [judgeStates, setJudgeStates] = useState<Record<string, JudgeState>>({});
  const [selectedOption, setSelectedOption] = useState<Record<string, string>>({});
  const [celebrationMap, setCelebrationMap] = useState<Record<string, boolean>>({});
  const celebrationTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    listChapters()
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => a.order - b.order);
        setChapters(sorted);
      })
      .catch((err) => setListError(err.message));
  }, []);

  useEffect(() => {
    setLoadingList(true);
    listQuestions({
      chapter: selectedChapter || undefined,
      difficulty: selectedDifficulty || undefined,
    })
      .then((res) => {
        setQuestions(res.data);
        setListError(null);
      })
      .catch((err) => setListError(err.message))
      .finally(() => setLoadingList(false));
  }, [selectedChapter, selectedDifficulty]);

  useEffect(() => {
    return () => {
      Object.values(celebrationTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setDetailQuestion(null);
      return;
    }
    const existing = questions.find((question) => question.slug === slug);
    if (existing) {
      setDetailQuestion(existing);
      return;
    }
    getQuestion(slug)
      .then((res) => setDetailQuestion(res.data))
      .catch(() => setListError("未找到该题目"));
  }, [slug, questions]);

  const triggerCelebration = (questionSlug: string) => {
    setCelebrationMap((prev) => ({ ...prev, [questionSlug]: true }));
    if (celebrationTimers.current[questionSlug]) {
      window.clearTimeout(celebrationTimers.current[questionSlug]);
    }
    celebrationTimers.current[questionSlug] = window.setTimeout(() => {
      setCelebrationMap((prev) => ({ ...prev, [questionSlug]: false }));
      delete celebrationTimers.current[questionSlug];
    }, 3000);
  };

  const updateRunState = (questionSlug: string, data: Partial<RunState>) => {
    setRunStates((prev) => ({
      ...prev,
      [questionSlug]: { ...defaultRunState, ...(prev[questionSlug] ?? {}), ...data },
    }));
  };

  const updateJudgeState = (questionSlug: string, data: Partial<JudgeState>) => {
    setJudgeStates((prev) => ({
      ...prev,
      [questionSlug]: { ...defaultJudgeState, ...(prev[questionSlug] ?? {}), ...data },
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
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message;
      updateRunState(question.slug, { loading: false, error: detail, result: null });
    }
  };

  const requireLogin = () => {
    openModal({
      title: "需要登录",
      content: (
        <div className="modal__content">
          <p>请先登录账号以记录做题进度。</p>
          <button
            type="button"
            className="modal__primary"
            onClick={() => {
              closeModal();
              navigate("/login");
            }}
          >
            前往登录
          </button>
        </div>
      ),
    });
  };

  const handleJudge = async (question: Question) => {
    if (!user) {
      requireLogin();
      return;
    }
    const code = codeMap[question.slug] ?? "";
    if (!code.trim()) {
      openModal({ title: "提示", content: <p>请先在编辑器中编写代码。</p> });
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

      if (passed && user) {
        const progressRes = await recordProgress(user.username, question.slug, 1);
        setUser(progressRes.data.user);
        triggerCelebration(question.slug);
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message;
      updateJudgeState(question.slug, { loading: false, error: detail });
    }
  };

  const handleObjectiveCheck = async (question: Question) => {
    const selected = selectedOption[question.slug];
    if (!selected) {
      openModal({ title: "提示", content: <p>请先选择一个选项再提交。</p> });
      return;
    }
    const correctAnswer = (question.answer || "").trim();
    const normalized = question.type === "单选题" ? selected.toUpperCase() : selected;
    const isCorrect = normalized === correctAnswer;
    if (isCorrect) {
      triggerCelebration(question.slug);
    }
    if (!user) {
      if (isCorrect) {
        requireLogin();
      }
      return;
    }
    if (isCorrect) {
      try {
        const progressRes = await recordProgress(user.username, question.slug, 1);
        setUser(progressRes.data.user);
      } catch (error) {
        // ignore for now
      }
    } else {
      openModal({ title: "再想想", content: <p>答案不完全正确，再试一次吧。</p> });
    }
  };

  const updateFilter = (chapter: string, difficulty: string) => {
    const params = new URLSearchParams();
    if (chapter) params.set("chapter", chapter);
    if (difficulty) params.set("difficulty", difficulty);
    setSearchParams(params, { replace: true });
  };

  const handleCardClick = (question: Question) => {
    const params = searchParams.toString();
    const suffix = params ? `?${params}` : "";
    navigate(`/questions/${question.slug}${suffix}`);
  };

  const handleBackToList = () => {
    const params = searchParams.toString();
    navigate(`/questions${params ? `?${params}` : ""}`);
  };

  const activeQuestion = useMemo(() => {
    if (!slug) return null;
    return detailQuestion;
  }, [slug, detailQuestion]);

  const currentChapter = activeQuestion ? chapters.find((chapter) => chapter.slug === activeQuestion.chapter) : null;
  const chapterIndex = currentChapter ? chapters.findIndex((chapter) => chapter.slug === currentChapter.slug) : -1;
  const nextChapter = chapterIndex > -1 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  if (slug && !activeQuestion && !loadingList) {
    return (
      <section>
        <p>正在加载题目...</p>
        <button type="button" onClick={handleBackToList} className="question-detail__back">
          返回题库
        </button>
      </section>
    );
  }

  if (slug && activeQuestion) {
    const runState = runStates[activeQuestion.slug] ?? defaultRunState;
    const judgeState = judgeStates[activeQuestion.slug] ?? defaultJudgeState;
    const badgeClass = difficultyBadges[activeQuestion.difficulty] || "difficulty-badge";
    return (
      <section className="question-detail">
        <div className="question-detail__top">
          <button type="button" onClick={handleBackToList} className="question-detail__back">
            ← 返回题库
          </button>
          <div className="question-detail__breadcrumbs">
            {currentChapter && (
              <Link to={`/tutorial/${currentChapter.slug}`}>回到：{currentChapter.title}</Link>
            )}
            {nextChapter && (
              <Link to={`/tutorial/${nextChapter.slug}`}>下一个知识点：{nextChapter.title}</Link>
            )}
          </div>
        </div>
        <article className="question-card question-card--detail">
          <Confetti active={celebrationMap[activeQuestion.slug] ?? false} />
          <header>
            <div className="question-card__heading">
              <h3>{activeQuestion.title || getExcerpt(activeQuestion.prompt)}</h3>
              <span className={badgeClass}>{activeQuestion.difficulty}</span>
            </div>
            <div className="question-card__meta">
              <span>章节：{activeQuestion.chapter}</span>
              <span>题型：{activeQuestion.type}</span>
              {activeQuestion.memory_limit && <span>内存：{Math.round(activeQuestion.memory_limit / (1024 * 1024))}MB</span>}
            </div>
          </header>
          <div className="question-card__details">
            <div className="question-card__prompt">
              <ReactMarkdown>{activeQuestion.prompt}</ReactMarkdown>
            </div>

            {activeQuestion.type !== "编程题" && (
              <div className="question-card__objective">
                {(activeQuestion.type === "单选题" ? extractOptions(activeQuestion.prompt) : [
                  { key: "正确", label: "正确" },
                  { key: "错误", label: "错误" },
                ]).map((option) => (
                  <label key={option.key} className="question-card__option">
                    <input
                      type="radio"
                      name={`choice-${activeQuestion.slug}`}
                      value={option.key}
                      checked={selectedOption[activeQuestion.slug] === option.key}
                      onChange={(event) =>
                        setSelectedOption((prev) => ({
                          ...prev,
                          [activeQuestion.slug]: event.target.value,
                        }))
                      }
                    />
                    <span>
                      {option.key}. {option.label}
                    </span>
                  </label>
                ))}
                <button type="button" onClick={() => handleObjectiveCheck(activeQuestion)}>检查答案</button>
              </div>
            )}

            {activeQuestion.type === "编程题" && (
              <div className="question-card__coding">
                <label className="question-card__label" htmlFor={`code-${activeQuestion.slug}`}>
                  代码编辑
                </label>
                <textarea
                  id={`code-${activeQuestion.slug}`}
                  value={codeMap[activeQuestion.slug] ?? ""}
                  onChange={(event) =>
                    setCodeMap((prev) => ({
                      ...prev,
                      [activeQuestion.slug]: event.target.value,
                    }))
                  }
                  placeholder="在此编写你的代码..."
                />
                <label className="question-card__label" htmlFor={`stdin-${activeQuestion.slug}`}>
                  模拟输入（可选，每行代表一行输入）
                </label>
                <textarea
                  id={`stdin-${activeQuestion.slug}`}
                  value={stdinMap[activeQuestion.slug] ?? ""}
                  onChange={(event) =>
                    setStdinMap((prev) => ({
                      ...prev,
                      [activeQuestion.slug]: event.target.value,
                    }))
                  }
                  placeholder="如需模拟用户输入，在此填写。"
                  className="question-card__stdin"
                />
                <div className="question-card__actions">
                  <button type="button" onClick={() => handleRun(activeQuestion)} disabled={runState.loading}>
                    {runState.loading ? "运行中..." : "运行代码"}
                  </button>
                  <button type="button" onClick={() => handleJudge(activeQuestion)} disabled={judgeState.loading}>
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
                      {runState.result.error && <p className="error">{runState.result.error}</p>}
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

            {activeQuestion.explanation && (
              <section>
                <h4>解析</h4>
                <ReactMarkdown>{activeQuestion.explanation}</ReactMarkdown>
              </section>
            )}
            {activeQuestion.common_mistakes && (
              <section>
                <h4>常见错误</h4>
                <ReactMarkdown>{activeQuestion.common_mistakes}</ReactMarkdown>
              </section>
            )}
            {activeQuestion.advanced_insights && (
              <section>
                <h4>进阶拓展</h4>
                <ReactMarkdown>{activeQuestion.advanced_insights}</ReactMarkdown>
              </section>
            )}
          </div>
        </article>
      </section>
    );
  }

  return (
    <section>
      <header className="question-bank__controls">
        <div>
          <label htmlFor="chapter">章节：</label>
          <select
            id="chapter"
            value={selectedChapter}
            onChange={(event) => updateFilter(event.target.value, selectedDifficulty)}
          >
            <option value="">全部章节</option>
            {[...chapters].sort((a, b) => a.order - b.order).map((chapter) => (
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
            onChange={(event) => updateFilter(selectedChapter, event.target.value)}
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
          当前筛选：{selectedChapter ? chapters.find((c) => c.slug === selectedChapter)?.title ?? selectedChapter : "全部章节"}
          · {selectedDifficulty || "全部难度"} · 共 {questions.length} 道题
        </p>
      </header>

      {loadingList && <p>加载题目中...</p>}
      {listError && <p>加载失败：{listError}</p>}

      <div className="question-bank__list">
        {questions.map((question) => {
          const badgeClass = difficultyBadges[question.difficulty] || "difficulty-badge";
          return (
            <article
              key={question.slug}
              className="question-card question-card--compact"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(question)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleCardClick(question);
              }}
            >
              <header>
                <div className="question-card__heading">
                  <h3>{question.title || getExcerpt(question.prompt)}</h3>
                  <span className={badgeClass}>{question.difficulty}</span>
                </div>
                <div className="question-card__meta">
                  <span>章节：{question.chapter}</span>
                  <span>题型：{question.type}</span>
                </div>
              </header>
              <p className="question-card__excerpt">{getExcerpt(question.prompt)}</p>
              <footer>
                <Link
                  to={`/tutorial/${question.chapter}`}
                  className="question-card__tutorial-link"
                  onClick={(event) => event.stopPropagation()}
                >
                  查看知识点
                </Link>
                <button type="button">开始作答</button>
              </footer>
            </article>
          );
        })}
        {!loadingList && !questions.length && <p>当前筛选暂无题目，试试其它章节或难度。</p>}
      </div>
    </section>
  );
};

export default QuestionBank;
