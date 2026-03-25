# Docs Index

本目录用于集中管理 **AI Chat 多 Agent 分析工作台（MVP）** 相关产品与设计文档。

## 文档列表

### 1. PRD
- [2026-03-25-ai-chat-multi-agent-prd.md](./2026-03-25-ai-chat-multi-agent-prd.md)
- 内容：产品背景、目标用户、产品范围、功能需求、非功能需求、验证方案。
- 适合阅读人群：产品、设计、研发、项目负责人。

### 2. 技术实现拆解
- [2026-03-25-ai-chat-multi-agent-technical-design.md](./2026-03-25-ai-chat-multi-agent-technical-design.md)
- 内容：系统架构、模块拆解、API 设计、数据模型、实施顺序、测试验证。
- 适合阅读人群：前端、后端、技术负责人。

### 3. 页面与交互原型说明
- [2026-03-25-ai-chat-multi-agent-ux-prototype.md](./2026-03-25-ai-chat-multi-agent-ux-prototype.md)
- 内容：页面结构、模块定义、核心用户流、关键状态、交互原则、文案建议。
- 适合阅读人群：产品、设计、前端。

### 4. V1 功能列表 / Roadmap
- [2026-03-25-ai-chat-multi-agent-v1-roadmap.md](./2026-03-25-ai-chat-multi-agent-v1-roadmap.md)
- 内容：MVP 范围、V1 增强方向、优先级、分期路线图、建议里程碑。
- 适合阅读人群：产品、研发、项目负责人。

### 5. MVP 开发任务清单
- [2026-03-25-ai-chat-multi-agent-mvp-task-list.md](./2026-03-25-ai-chat-multi-agent-mvp-task-list.md)
- 内容：MVP 里程碑、模块任务拆分、优先级、验收标准、实施顺序、角色分工、Sprint 建议。
- 适合阅读人群：产品、研发、测试、项目负责人。

## 推荐阅读顺序

1. 先看 **PRD**，统一产品目标和范围
2. 再看 **页面与交互原型说明**，理解用户路径和页面结构
3. 再看 **技术实现拆解**，对应研发落地方案
4. 再看 **MVP 开发任务清单**，用于研发拆解和执行
5. 最后看 **V1 功能列表 / Roadmap**，用于排期和版本推进

## 当前文档主题

当前文档围绕同一个 MVP 目标展开：

> 构建一个面向单用户场景的双 Agent AI 分析工作台，支持手工上传 CSV / Excel / 文本文件，在同一 Session 中完成问答分析与结构化报表生成。

## 当前范围说明

当前文档体系默认遵循以下边界：
- 以单用户为主
- 以手工上传为主要数据入口
- 仅保留两个核心 Agent：通用对话 Agent、报表 Agent
- 暂不包含权限、协作、企业系统接入、复杂 Agent 编排、RAG 等能力
