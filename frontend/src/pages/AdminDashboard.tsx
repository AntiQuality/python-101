import React, { useEffect, useState } from "react";
import { adminListQuestions, adminListUsers } from "../services/api";
import type { Question, User } from "../services/api";
import "../styles/admin.css";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminListUsers(), adminListQuestions()])
      .then(([usersRes, questionRes]) => {
        setUsers(usersRes.data);
        setQuestions(questionRes.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p>后台数据加载失败：{error}</p>;
  }

  return (
    <section className="admin">
      <h2>后台总览</h2>
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
                <strong>{question.prompt.split("\n")[0]}</strong>
                <span>
                  {question.chapter} · {question.difficulty} · {question.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="admin__note">更多增删改操作将在后续后台模块中扩展。</p>
    </section>
  );
};

export default AdminDashboard;
