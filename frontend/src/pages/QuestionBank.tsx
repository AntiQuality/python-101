import React, { useEffect, useMemo, useState } from "react";
import type { Chapter, Question } from "../services/api";
import { listChapters, listQuestions } from "../services/api";
import "../styles/question-bank.css";

const difficulties = ["基础", "进阶", "挑战"];

const QuestionBank: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    listChapters().then((res) => setChapters(res.data));
  }, []);

  useEffect(() => {
    listQuestions({
      chapter: selectedChapter || undefined,
      difficulty: selectedDifficulty || undefined,
    }).then((res) => setQuestions(res.data));
  }, [selectedChapter, selectedDifficulty]);

  const activeChapterTitle = useMemo(() => {
    if (!selectedChapter) return "全部章节";
    const chapter = chapters.find((item) => item.slug === selectedChapter);
    return chapter ? chapter.title : selectedChapter;
  }, [chapters, selectedChapter]);

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
            {chapters.map((chapter) => (
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
            {difficulties.map((level) => (
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
          return (
            <article key={question.slug} className="question-card">
              <header>
                <h3>{question.prompt.split("\n")[0]}</h3>
                <div className="question-card__meta">
                  <span>章节：{question.chapter}</span>
                  <span>难度：{question.difficulty}</span>
                  <span>类型：{question.type}</span>
                  {question.memory_limit && <span>内存：{Math.round(question.memory_limit / (1024 * 1024))}MB</span>}
                </div>
              </header>
              {isExpanded && (
                <div className="question-card__details">
                  <pre className="question-card__prompt">{question.prompt}</pre>
                  {question.explanation && (
                    <section>
                      <h4>解析</h4>
                      <p>{question.explanation}</p>
                    </section>
                  )}
                  {question.common_mistakes && (
                    <section>
                      <h4>常见错误</h4>
                      <p>{question.common_mistakes}</p>
                    </section>
                  )}
                  {question.advanced_insights && (
                    <section>
                      <h4>进阶拓展</h4>
                      <p>{question.advanced_insights}</p>
                    </section>
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
