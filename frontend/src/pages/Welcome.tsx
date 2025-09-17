import React from "react";

const Welcome: React.FC = () => (
  <section>
    <h2>欢迎来到 Python-101</h2>
    <p>
      这里提供零基础友好的 Python 教程、互动练习与智能判题。可以从教程开始逐章学习，也可以直接进入题库闯关。完成题目将记录在学习进度里，方便你随时回顾。
    </p>
    <ol>
      <li>先浏览教程理解概念；</li>
      <li>在题库中选择难度适合的题目练习；</li>
      <li>使用在线运行与判题获得即时反馈；</li>
      <li>在学习记录页追踪你的掌握程度；</li>
      <li>管理员可在后台维护章节和题库。</li>
    </ol>
  </section>
);

export default Welcome;
