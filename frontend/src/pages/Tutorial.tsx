import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../styles/tutorial.css";
import type { Chapter } from "../services/api";
import { listChapters } from "../services/api";

const Tutorial: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listChapters()
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => a.order - b.order);
        setChapters(sorted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!chapters.length || loading) {
      return;
    }
    if (slug) {
      const exists = chapters.some((chapter) => chapter.slug === slug);
      if (exists) {
        setActiveSlug(slug);
      } else {
        navigate(`/tutorial/${chapters[0].slug}`, { replace: true });
      }
    } else {
      setActiveSlug(chapters[0].slug);
      navigate(`/tutorial/${chapters[0].slug}`, { replace: true });
    }
  }, [chapters, slug, loading, navigate]);

  const activeChapter = useMemo(
    () => chapters.find((item) => item.slug === activeSlug) ?? null,
    [chapters, activeSlug],
  );

  const activeIndex = activeChapter ? chapters.findIndex((item) => item.slug === activeChapter.slug) : -1;
  const hasPrev = activeIndex > 0;
  const hasNextChapter = activeIndex > -1 && activeIndex < chapters.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      navigate(`/tutorial/${chapters[activeIndex - 1].slug}`);
    }
  };

  const handleNext = () => {
    if (!activeChapter) return;
    if (hasNextChapter) {
      navigate(`/tutorial/${chapters[activeIndex + 1].slug}`);
      return;
    }
    navigate(`/questions?chapter=${activeChapter.slug}`);
  };

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
              <Link
                to={`/tutorial/${chapter.slug}`}
                className={chapter.slug === activeSlug ? "is-active" : ""}
              >
                <span className="tutorial__order">#{chapter.order}</span>
                <span>{chapter.title}</span>
              </Link>
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
            <div className="tutorial__pager">
              <button type="button" onClick={handlePrev} disabled={!hasPrev}>
                上一页
              </button>
              <button type="button" onClick={handleNext}>
                {hasNextChapter ? "下一页" : "进入本章练习"}
              </button>
            </div>
          </article>
        ) : (
          <p>请选择章节以阅读内容。</p>
        )}
      </section>
    </div>
  );
};

export default Tutorial;
