import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { removeDevice } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import "./UserMenu.css";

interface UserMenuProps {
  open: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ open, onClose }) => {
  const { user, setUser, logout } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open || !user) {
    return null;
  }

  const handleRemove = async (deviceName: string, browser: string) => {
    try {
      const res = await removeDevice(user.username, deviceName, browser);
      setUser(res.data.user);
      openModal({ title: "设备已移除", content: <p>已成功删除所选设备。</p> });
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message;
      openModal({ title: "操作失败", content: <p>{detail}</p> });
    }
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <header className="user-menu__header">
        <div>
          <h4>{user.username}</h4>
          <span>{user.is_admin ? "管理员" : "学习者"}</span>
        </div>
        <button type="button" onClick={() => { logout(); onClose(); }}>
          退出登录
        </button>
      </header>
      <section className="user-menu__section">
        <h5>快捷入口</h5>
        <div className="user-menu__links">
          <button type="button" onClick={() => { navigate("/progress"); onClose(); }}>
            学习记录
          </button>
          <button type="button" onClick={() => { navigate("/questions"); onClose(); }}>
            题库练习
          </button>
          <button type="button" onClick={() => { navigate("/tutorial"); onClose(); }}>
            返回教程
          </button>
        </div>
      </section>
      <section className="user-menu__section">
        <h5>设备管理</h5>
        <p className="user-menu__hint">最多登录 3 台设备</p>
        <ul>
          {user.devices.map((device, index) => {
            const key = `${device.name}-${device.browser}`;
            const isCurrent = typeof window !== "undefined" && navigator.userAgent === device.browser;
            return (
              <li key={key} className={isCurrent ? "user-menu__device user-menu__device--current" : "user-menu__device"}>
                <div>
                  <span className="user-menu__device-name">设备 {index + 1}{isCurrent ? " · 当前设备" : ""}</span>
                  <span className="user-menu__device-browser">{device.browser}</span>
                  <span className="user-menu__device-login">最近登录：{new Date(device.last_login).toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(device.name, device.browser)}
                  className={isCurrent ? "user-menu__device-remove user-menu__device-remove--disabled" : "user-menu__device-remove"}
                  disabled={isCurrent}
                >
                  删除
                </button>
              </li>
            );
          })}
          {user.devices.length === 0 && <li className="user-menu__empty">暂无设备记录</li>}
        </ul>
        <p className="user-menu__tip">最多可同时登录 3 台设备</p>
      </section>
    </div>
  );
};

export default UserMenu;
