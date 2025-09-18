import React, { useEffect, useMemo, useState } from "react";
import {
  adminListQuestions,
  adminListUsers,
  adminUpsertChapter,
  adminUpsertQuestion,
  listChapters,
} from "../services/api";
import type {
  Chapter,
  Question,
  ChapterUpsertPayload,
  QuestionUpsertPayload,
  User,
} from "../services/api";
import "../styles/admin.css";
import { useAuth } from "../contexts/AuthContext";

const defaultChapterForm: ChapterUpsertPayload = {
  slug: "",
  title: "",
  order: 1,
  description: "",
  body: "",
};

const defaultQuestionForm: QuestionUpsertPayload = {
  slug: "",
  chapter: "",
  difficulty: "基础",
  type: "单选题",
  title: "",
  memory_limit: undefined,
  show_in_tutorial: true,
  show_in_bank: true,
  prompt: "",
  answer: "",
  explanation: "",
  common_mistakes: "",
  advanced_insights: "",
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState(defaultChapterForm);
  const [questionForm, setQuestionForm] = useState(defaultQuestionForm);
  const [memoryInMB, setMemoryInMB] = useState<number | "">(8);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const chapterSlugOptions = useMemo(() => chapters.map((item) => item.slug), [chapters]);

  useEffect(() => {
    if (!user?.is_admin) {
      return;
    }
    Promise.all([adminListUsers(), adminListQuestions(), listChapters()])
      .then(([usersRes, questionRes, chapterRes]) => {
        setUsers(usersRes.data);
        setQuestions(questionRes.data);
        setChapters(chapterRes.data);
      })
      .catch((err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!chapterForm.slug && chapters.length > 0) {
      setChapterForm((prev) => ({ ...prev, slug: chapters[0].slug }));
    }
    if (!questionForm.chapter && chapters.length > 0) {
      setQuestionForm((prev) => ({ ...prev, chapter: chapters[0].slug }));
    }
  }, [chapters]);

  const refreshQuestions = async () => {
    if (!user?.is_admin) {
      return;
    }
    const [questionRes, chapterRes] = await Promise.all([adminListQuestions(), listChapters()]);
    setQuestions(questionRes.data);
    setChapters(chapterRes.data);
  };

  const handleChapterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await adminUpsertChapter({
        ...chapterForm,
        description: chapterForm.description || undefined,
      });
      setMessage("章节已保存。");
      setChapterForm(defaultChapterForm);
      await refreshQuestions();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err.message;
      setMessage(`保存章节失败：${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuestionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const payload: QuestionUpsertPayload = {
        ...questionForm,
        title: questionForm.title || undefined,
        memory_limit: memoryInMB ? Number(memoryInMB) * 1024 * 1024 : undefined,
        show_in_tutorial: questionForm.show_in_tutorial ?? true,
        show_in_bank: questionForm.show_in_bank ?? true,
        answer: questionForm.answer || undefined,
        explanation: questionForm.explanation || undefined,
        common_mistakes: questionForm.common_mistakes || undefined,
        advanced_insights: questionForm.advanced_insights || undefined,
      };
      await adminUpsertQuestion(payload);
      setMessage("题目已保存。");
      setQuestionForm(defaultQuestionForm);
      setMemoryInMB(8);
      await refreshQuestions();
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err.message;
      setMessage(`保存题目失败：${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.is_admin) {
    return <p>抱歉，只有管理员可以访问该页面。</p>;
  }

  if (error) {
    return <p>后台数据加载失败：{error}</p>;
  }

  return (
    <section className="admin">
      <h2>后台总览</h2>
      {message && <p className="admin__message">{message}</p>}

      <div className="admin__grid">
        <div className="admin__card">
          <h3>用户设备概览</h3>
          <ul>
            {users.map((user) => (
              <li key={user.username}>
                <strong>{user.username}</strong>
                <span>设备数：{user.devices.length}</span>
                <span>完成题目：{user.progress.length}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin__card">
          <h3>题库总览</h3>
          <ul>
            {questions.map((question) => (
              <li key={question.slug}>
                <strong>{question.title ?? question.prompt.split("\n")[0]}</strong>
                <span>
                  {question.chapter} · {question.difficulty} · {question.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="admin__forms">
        <form className="admin__form" onSubmit={handleChapterSubmit}>
          <h3>新增 / 更新章节</h3>
          <label>
            章节标识（slug）
            <input
              value={chapterForm.slug}
              onChange={(event) => setChapterForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
            />
          </label>
          <label>
            章节标题
            <input
              value={chapterForm.title}
              onChange={(event) => setChapterForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>
          <label>
            排序（order）
            <input
              type="number"
              min={1}
              value={chapterForm.order}
              onChange={(event) =>
                setChapterForm((prev) => ({ ...prev, order: Number(event.target.value) }))
              }
              required
            />
          </label>
          <label>
            简介（可选）
            <input
              value={chapterForm.description ?? ""}
              onChange={(event) =>
                setChapterForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>
          <label>
            章节内容（Markdown）
            <textarea
              value={chapterForm.body}
              onChange={(event) => setChapterForm((prev) => ({ ...prev, body: event.target.value }))}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "保存中..." : "保存章节"}
          </button>
        </form>

        <form className="admin__form" onSubmit={handleQuestionSubmit}>
          <h3>新增 / 更新题目</h3>
          <label>
            题目标识（slug）
            <input
              value={questionForm.slug}
              onChange={(event) => setQuestionForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
            />
          </label>
          <label>
            所属章节
            <select
              value={questionForm.chapter}
              onChange={(event) => setQuestionForm((prev) => ({ ...prev, chapter: event.target.value }))}
              required
            >
              <option value="" disabled>
                请选择章节
              </option>
              {chapterSlugOptions.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </label>
          <label>
            难度
            <select
              value={questionForm.difficulty}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, difficulty: event.target.value }))
              }
            >
              <option value="基础">基础</option>
              <option value="进阶">进阶</option>
              <option value="挑战">挑战</option>
            </select>
          </label>
          <label>
            简称（可选）
            <input
              value={questionForm.title ?? ""}
              onChange={(event) => setQuestionForm((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label>
            题型
            <select
              value={questionForm.type}
              onChange={(event) => setQuestionForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="判断题">判断题</option>
              <option value="单选题">单选题</option>
              <option value="编程题">编程题</option>
            </select>
          </label>
          <label>
            内存限制（MB，可选）
            <input
              type="number"
              min={1}
              value={memoryInMB}
              onChange={(event) => setMemoryInMB(event.target.value ? Number(event.target.value) : "")}
            />
          </label>
          <label className="admin__checkbox">
            <input
              type="checkbox"
              checked={questionForm.show_in_tutorial}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, show_in_tutorial: event.target.checked }))
              }
            />
            教程模式显示
          </label>
          <label className="admin__checkbox">
            <input
              type="checkbox"
              checked={questionForm.show_in_bank}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, show_in_bank: event.target.checked }))
              }
            />
            题库模式显示
          </label>
          <label>
            题干（Markdown）
            <textarea
              value={questionForm.prompt}
              onChange={(event) => setQuestionForm((prev) => ({ ...prev, prompt: event.target.value }))}
              required
            />
          </label>
          <label>
            正确答案（可选）
            <textarea
              value={questionForm.answer ?? ""}
              onChange={(event) => setQuestionForm((prev) => ({ ...prev, answer: event.target.value }))}
            />
          </label>
          <label>
            解析（可选）
            <textarea
              value={questionForm.explanation ?? ""}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, explanation: event.target.value }))
              }
            />
          </label>
          <label>
            常见错误（可选）
            <textarea
              value={questionForm.common_mistakes ?? ""}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, common_mistakes: event.target.value }))
              }
            />
          </label>
          <label>
            进阶拓展（可选）
            <textarea
              value={questionForm.advanced_insights ?? ""}
              onChange={(event) =>
                setQuestionForm((prev) => ({ ...prev, advanced_insights: event.target.value }))
              }
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "保存中..." : "保存题目"}
          </button>
        </form>
      </div>

      <p className="admin__note">更多增删改操作将在后续后台模块中扩展。</p>
    </section>
  );
};

export default AdminDashboard;
