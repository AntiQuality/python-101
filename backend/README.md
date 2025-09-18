# Backend 服务

基于 FastAPI 的 API 服务，提供章节内容、题库、用户管理与判题接口。

## 准备环境
```bash
cd backend
python3.8 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 启动
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

启动后可访问 `http://127.0.0.1:8000/docs` 查看自动生成的接口文档。

## 环境变量
- `ARK_API_KEY`：豆包 API Key，存放于项目根目录 `.env` 并通过 `python-dotenv` 加载。

## 数据存储
- 用户与进度保存在项目根目录 `data/users.json`（默认已被 `.gitignore` 忽略）。

## 关键接口
- `POST /execute/run`：在沙箱中执行用户代码，支持传入标准输入、时间与内存限制。
- `POST /judge/evaluate`：调用豆包模型进行判题（未配置 API Key 时返回模拟反馈）。
- `POST /admin/chapters`：写入或更新章节 Markdown。
- `POST /admin/questions`：写入或更新题目 Markdown。
