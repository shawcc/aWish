# AI 需求收集工具

这是一个基于 AI 的需求收集平台，帮助用户通过自然语言对话描述需求，并自动生成结构化的需求文档。

## 技术栈

- **前端**: React, TypeScript, TailwindCSS, Vite
- **后端**: Express.js (作为 API 代理和业务逻辑层)
- **数据库**: Supabase (PostgreSQL)
- **AI**: DeepSeek API (OpenAI 兼容)

## 快速开始

### 1. 环境准备

确保您已安装 Node.js (推荐 v18+)。

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置：

```bash
cp .env.example .env
```

需要配置以下变量：
- `DEEPSEEK_API_KEY`: 您的 DeepSeek API 密钥
- `VITE_SUPABASE_URL`: Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key

### 4. 数据库设置

1. 登录 Supabase 控制台。
2. 进入 SQL Editor。
3. 复制 `migrations/20240101000000_initial_schema.sql` 的内容并执行。
   - 这将创建所有必要的表、索引、RLS 策略和触发器。

### 5. 启动开发服务器

```bash
npm run dev
```

这将同时启动前端 (Vite) 和后端 (Express) 服务器。
- 前端地址: http://localhost:5173
- 后端地址: http://localhost:3001

## 主要功能

- **AI 对话**: 与 AI 助手对话，智能梳理需求。
- **需求管理**: 查看、筛选和管理历史需求。
- **自动总结**: AI 自动生成需求文档摘要。
- **实时通知**: 需求状态变更时实时通知用户。
- **用户认证**: 完整的注册、登录和个人中心功能。

## 目录结构

- `api/`: 后端代码 (Express)
- `src/`: 前端代码 (React)
  - `components/`: 通用组件
  - `pages/`: 页面组件
  - `lib/`: 工具库 (Supabase 客户端等)
- `migrations/`: 数据库迁移文件
