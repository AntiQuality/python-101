import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from "./UserMenu";
import "./Layout.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, user]);
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
        {user?.is_admin && <NavLink to="/admin">后台</NavLink>}
        {user ? (
          <div className="layout__user-menu">
            <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="layout__user-button">
              👋 {user.username}
            </button>
            <UserMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
          </div>
        ) : (
          <NavLink to="/login" className="layout__login-link">登录</NavLink>
        )}
      </nav>
      <main className="layout__content">{children}</main>
      <footer className="layout__footer">Python 3.8 · 标准库沙箱 · LLM 判题由豆包驱动</footer>
    </div>
  );
};

export default Layout;
