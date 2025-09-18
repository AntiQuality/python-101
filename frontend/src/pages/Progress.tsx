import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { removeDevice } from "../services/api";
import "../styles/progress.css";

const Progress: React.FC = () => {
  const { user, setUser } = useAuth();
  const { openModal } = useModal();
  const [loadingDevice, setLoadingDevice] = useState<string | null>(null);

  if (!user) {
    return <p>请先登录以查看学习记录。</p>;
  }

  const handleRemoveDevice = async (deviceName: string, browser: string) => {
    if (!window.confirm(`确定要移除设备 ${deviceName} (${browser}) 吗？`)) {
      return;
    }
    setLoadingDevice(`${deviceName}-${browser}`);
    try {
      const response = await removeDevice(user.username, deviceName, browser);
      setUser(response.data.user);
      openModal({ title: "设备已移除", content: <p>所选设备已成功删除。</p> });
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error.message;
      openModal({ title: "操作失败", content: <p>{detail}</p> });
    } finally {
      setLoadingDevice(null);
    }
  };

  return (
    <section className="progress">
      <h2>学习记录</h2>
      <div className="progress__grid">
        <div className="progress__card">
          <h3>做题进度</h3>
          {user.progress.length === 0 ? (
            <p>还没有完成的题目，去题库练习一题试试吧！</p>
          ) : (
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
          )}
        </div>

        <div className="progress__card">
          <h3>已登录的设备</h3>
          {user.devices.length === 0 ? (
            <p>暂无设备记录。</p>
          ) : (
            <ul className="progress__devices">
              {user.devices.map((device) => {
                const key = `${device.name}-${device.browser}`;
                return (
                  <li key={key}>
                    <div>
                      <strong>{device.name}</strong>
                      <span>{device.browser}</span>
                      <span>最近登录：{new Date(device.last_login).toLocaleString()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDevice(device.name, device.browser)}
                      disabled={loadingDevice === key}
                    >
                      {loadingDevice === key ? "处理中..." : "移除设备"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="progress__tip">最多可同时登录 3 台设备，如有异常请及时处理。</p>
        </div>
      </div>
    </section>
  );
};

export default Progress;
