import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { login, register } from "../services/api";
import "../styles/login.css";

const getDeviceInfo = () => {
  const browser = navigator.userAgent;
  const deviceName = navigator.platform || "web";
  return { deviceName, browser };
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "register") {
        const res = await register(username, password);
        setUser(res.data.user);
        setMessage("注册成功，已自动登录！");
      } else {
        const { deviceName, browser } = getDeviceInfo();
        const res = await login(username, password, deviceName, browser);
        setUser(res.data.user);
        navigate("/tutorial");
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message;
      setMessage(`操作失败：${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login">
      <div className="login__card">
        <h2>{mode === "login" ? "登录" : "注册"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            用户名
            <input value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label>
            密码
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>
        </form>
        <button
          type="button"
          className="login__switch"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "还没有账号？立即注册" : "已有账号？前往登录"}
        </button>
        {message && <p className="login__message">{message}</p>}
      </div>
    </section>
  );
};

export default Login;
