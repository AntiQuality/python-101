# Frontend 前端

使用 Vite + React + TypeScript 构建的单页应用，负责展示教程、题库、学习记录与后台总览。

## 开发环境
```bash
cd frontend
npm install
npm run dev
```

默认通过 `http://127.0.0.1:5173` 访问，已在后端开启 CORS 支持本地调试。

## 环境变量
- `VITE_API_BASE_URL`（可选）：后端 API 地址，默认 `http://127.0.0.1:8000`。

## 目录说明
- `src/pages/`：页面级组件（教程、题库、登录等）。
- `src/components/`：布局等共享组件。
- `src/services/api.ts`：封装所有 API 调用。
- `src/contexts/AuthContext.tsx`：管理登录用户状态。
