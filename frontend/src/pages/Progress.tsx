import React from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/progress.css";

const Progress: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>请先登录以查看学习记录。</p>;
  }

  if (!user.progress.length) {
    return <p>还没有完成的题目，去题库练习一题试试吧！</p>;
  }

  return (
    <section className="progress">
      <h2>学习记录</h2>
      <table>
        <thead>
          <tr>
            <th>题目</th>
            <th>得分</th>
            <th>完成时间</th>
          </tr>
        </thead>
        <tbody>
          {user.progress.map((entry) => (
            <tr key={entry.question_slug}>
              <td>{entry.question_slug}</td>
              <td>{(entry.score * 100).toFixed(0)}%</td>
              <td>{new Date(entry.completed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default Progress;
