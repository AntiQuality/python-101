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
