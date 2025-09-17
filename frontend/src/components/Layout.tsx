import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Layout.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="layout">
      <header className="layout__header">
        <h1>Python-101 学习题库</h1>
        <p>为零基础设计的循序渐进 Python 教程与题库</p>
      </header>
      <nav className="layout__nav">
        <NavLink to="/" end>
          首页
        </NavLink>
        <NavLink to="/tutorial">教程</NavLink>
        <NavLink to="/questions">题库</NavLink>
        <NavLink to="/progress">学习记录</NavLink>
        <NavLink to="/admin">后台</NavLink>
        {user ? <span className="layout__user">👋 {user.username}</span> : <NavLink to="/login">登录</NavLink>}
      </nav>
      <main className="layout__content">{children}</main>
      <footer className="layout__footer">Python 3.8 · 标准库沙箱 · LLM 判题由豆包驱动</footer>
    </div>
  );
};

export default Layout;
