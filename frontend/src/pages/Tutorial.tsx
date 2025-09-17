import React, { useEffect, useState } from "react";
import "../styles/tutorial.css";
import ReactMarkdown from "react-markdown";
import type { Chapter } from "../services/api";
import { listChapters } from "../services/api";

const Tutorial: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listChapters()
      .then((res) => {
        setChapters(res.data);
        if (res.data.length > 0) {
          setActiveSlug(res.data[0].slug);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeChapter = chapters.find((item) => item.slug === activeSlug) || null;

  if (loading) {
    return <p>加载章节中...</p>;
  }

  if (error) {
    return <p>加载失败：{error}</p>;
  }

  if (!chapters.length) {
    return <p>暂时没有章节内容，请稍后再试。</p>;
  }

  return (
    <div className="tutorial">
      <aside className="tutorial__sidebar">
        <h3>章节目录</h3>
        <ul>
          {chapters.map((chapter) => (
            <li key={chapter.slug}>
              <button
                type="button"
                className={chapter.slug === activeSlug ? "is-active" : ""}
                onClick={() => setActiveSlug(chapter.slug)}
              >
                <span className="tutorial__order">#{chapter.order}</span>
                <span>{chapter.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="tutorial__content">
        {activeChapter ? (
          <article>
            <h2>{activeChapter.title}</h2>
            {activeChapter.description && <p className="tutorial__description">{activeChapter.description}</p>}
            <ReactMarkdown>{activeChapter.body}</ReactMarkdown>
          </article>
        ) : (
          <p>请选择章节以阅读内容。</p>
        )}
      </section>
    </div>
  );
};

export default Tutorial;
