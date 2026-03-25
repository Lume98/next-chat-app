# 技术实现拆解：AI Chat 多 Agent 分析工作台（MVP）

- **文档版本**：V1.0
- **日期**：2026-03-25
- **适用范围**：MVP

---

# 1. 目标

本文档用于将《AI Chat 多 Agent 分析工作台 PRD》拆解为可实施的技术方案，指导前后端研发按阶段落地。

MVP 技术目标：
- 基于现有仓库快速实现双 Agent 产品形态
- 复用已有 Session / Upload / Chat / Report 基础能力
- 保持架构简单、边界清晰、便于后续扩展

---

# 2. 技术原则

## 2.1 基本原则
- **优先复用现有实现**，不重做底层
- **先做显式双 Agent**，不做复杂自治编排
- **先做单用户本地工作区**，不做多租户与协作
- **先做手工上传闭环**，不接外部企业数据源
- **保持领域模型稳定**，为后续扩展更多 Agent 预留空间

## 2.2 MVP 范围内的技术边界
- 仅保留 `conversation` 与 `report` 两种 Agent
- 报表由用户显式触发
- 文件输入以 CSV / Excel / Text 为主
- 数据本地持久化即可
- 不引入数据库、对象存储、消息队列、向量库

---

# 3. 当前可复用基础

## 3.1 领域模型
- `lib/domain/types.ts`

已具备：
- `AgentName = "conversation" | "report"`
- `SessionRecord`
- `MessageRecord`
- `UploadRecord`
- `ReportArtifact`
- `SessionBundle`

说明：
当前领域模型已经能支撑 MVP 的双 Agent 工作区，不建议首版重构。

## 3.2 数据持久化
- `lib/storage/repository.ts`

已具备：
- Session 创建与读取
- Message 写入
- Upload 写入
- Report 写入
- `lastActiveAgent` 维护
- `latestReportId` 维护

说明：
当前 `.data/workspace.json` 本地持久化可满足 MVP 演示和验证。

## 3.3 Chat 接口
- `app/api/chat/route.ts`

已具备：
- 接收 `sessionId` 和 `content`
- 写入用户消息
- 调用 `generateConversationReply`
- 写入 assistant 消息

## 3.4 Report 接口
- `app/api/reports/route.ts`

已具备：
- 接收 `sessionId`
- 校验是否存在上传文件
- 调用 `generateReportContent`
- 写入 report artifact
- 写入 report agent 消息

## 3.5 Upload 解析
- `lib/uploads/parse-upload.ts`

已具备：
- CSV / Excel / Text 类型识别
- 文件大小限制
- 最大上传数限制
- 生成 `summary` / `schemaPreview` / `analysisText`

## 3.6 Workspace UI
- `components/workspace/workspace-shell.tsx`

已具备：
- Session 侧栏
- 聊天区域
- 上传区域
- 报表区域
- 聊天发送、上传、生成报表主流程

---

# 4. 总体架构

# 4.1 架构概览
MVP 采用单体 Web 应用架构：

- **前端 UI 层**
  - Session 工作区
  - 对话区
  - 上传区
  - 报表区
- **应用 API 层**
  - `/api/sessions`
  - `/api/chat`
  - `/api/uploads`
  - `/api/reports`
- **Agent 能力层**
  - Conversation Agent Prompt / Reply 生成
  - Report Agent Prompt / Report 生成
- **存储层**
  - 本地 JSON 持久化

# 4.2 多 Agent 实现方式
不是引入独立 Agent runtime，而是采用 **应用层双角色实现**：

- `conversation`：负责对话回复
- `report`：负责报表生成

二者共享：
- 同一个 Session
- 同一份 Upload 数据
- 同一份历史消息与报告上下文

---

# 5. 模块拆解

# 5.1 Session 模块
## 目标
管理工作区生命周期和上下文边界。

## 输入
- 创建 Session
- 打开已有 Session

## 输出
- Session 列表
- 当前 Session 上下文

## 关键字段
- `id`
- `title`
- `updatedAt`
- `lastActiveAgent`
- `latestReportId`

## 建议实施
- 保持当前 Session 模型不变
- 约定一个 Session 对应一个分析主题

---

# 5.2 Upload 模块
## 目标
将用户手工上传的数据转换成 Agent 可使用的轻量上下文。

## 输入
- 文件对象
- `sessionId`

## 输出
- `UploadRecord`
  - `summary`
  - `schemaPreview`
  - `analysisText`

## 关键逻辑
- 文件类型判断
- 文件大小校验
- 上传数量校验
- CSV / Excel / Text 解析

## 建议实施
- 首版继续使用现有解析逻辑
- UI 中把摘要和字段结构显示出来
- 作为 chat/report 统一输入来源

---

# 5.3 Conversation Agent 模块
## 目标
承接用户的分析性问答。

## 输入
- 当前 Session
- 历史消息
- 上传文件摘要
- 已有报告
- 当前用户问题

## 输出
- 一条 `assistant` 消息
- `agent = conversation`

## 主要职责
- 回答问题
- 解释数据
- 总结阶段结论
- 建议是否需要生成报表

## 不负责
- 真正生成结构化报表
- 自动发起复杂子任务

## 建议实施
- 保持 `app/api/chat/route.ts` 为统一入口
- 后续可以加轻量意图识别，但先不做复杂路由

---

# 5.4 Report Agent 模块
## 目标
把 Session 中的数据沉淀为结构化成果。

## 输入
- 当前 Session
- 当前 Upload 列表
- 历史报告

## 输出
- `ReportArtifact`
- 一条 `agent = report` 的消息

## 主要职责
- 汇总输入数据
- 提炼关键发现
- 生成固定结构报告

## 建议实施
- 保持 `app/api/reports/route.ts` 为独立接口
- 首版默认基于当前 Session 的全部上传文件生成

---

# 5.5 Report Artifact 模块
## 目标
让报表成为可留存、可追溯、可复用成果。

## 数据结构
- `id`
- `title`
- `sourceUploadIds`
- `summary`
- `sections`
- `createdAt`
- `updatedAt`

## 建议实施
- 保持报告与消息分离
- 消息中仅写报表摘要和引用信息
- 报表详情由 Report Panel 承载

---

# 6. API 设计

# 6.1 Sessions API
## 现状
- `app/api/sessions/route.ts`

## 作用
- 创建 Session
- 获取 Session 列表

## MVP 要求
- 保持现有行为
- 返回字段满足 Workspace 初始化需求

---

# 6.2 Chat API
## 路径
- `POST /api/chat`

## 请求体
```json
{
  "sessionId": "string",
  "content": "string"
}
```

## 返回
```json
{
  "session": {},
  "userMessage": {},
  "assistantMessage": {}
}
```

## MVP 处理流程
1. 校验请求参数
2. 获取 SessionBundle
3. 写入用户消息
4. 调用 Conversation Agent
5. 写入 assistant 消息
6. 返回最新消息与 Session

---

# 6.3 Uploads API
## 路径
- `POST /api/uploads`

## 输入
- `sessionId`
- `file`

## 输出
- `upload`

## MVP 处理流程
1. 校验 Session
2. 校验文件类型、大小、数量
3. 解析文件
4. 存储 UploadRecord
5. 返回上传结果

---

# 6.4 Reports API
## 路径
- `POST /api/reports`

## 请求体
```json
{
  "sessionId": "string"
}
```

## 返回
```json
{
  "report": {},
  "reportMessage": {}
}
```

## MVP 处理流程
1. 校验 Session
2. 获取 Uploads 和历史 Reports
3. 若无 Upload，则拒绝生成
4. 调用 Report Agent
5. 写入 ReportArtifact
6. 写入 report message
7. 更新 Session 的 `lastActiveAgent` / `latestReportId`

---

# 7. 前端页面拆解

# 7.1 Workspace Shell
核心文件：`components/workspace/workspace-shell.tsx`

## 状态管理
- `currentSession`
- `sessionList`
- `messages`
- `uploads`
- `reports`
- `draft`
- `isSending`
- `isUploading`
- `isGenerating`
- `error`

## 主要动作
- `sendMessage()`
- `uploadFile()`
- `generateReport()`

## 建议增强点
- 在 UI 中明确展示当前 Agent 身份
- 让报表区域更突出“结构化成果”定位
- 在无上传时对“生成报表”做禁用和提示

---

# 8. 数据模型建议

# 8.1 保持稳定的核心模型
优先保持以下结构不变：
- `SessionRecord`
- `MessageRecord`
- `UploadRecord`
- `ReportArtifact`

# 8.2 可选增强字段（非必须）
如后续需要，可逐步增加：
- `SessionRecord.description`
- `SessionRecord.topic`
- `ReportArtifact.templateType`
- `UploadRecord.tags`

首版不建议提前引入。

---

# 9. 实施顺序

# 9.1 Phase 1：双 Agent 产品化
目标：明确角色边界，打磨现有主流程。

建议改动点：
- `components/workspace/workspace-shell.tsx`
- `app/api/chat/route.ts`
- `app/api/reports/route.ts`
- `lib/domain/types.ts`

工作项：
- 强化双 Agent 呈现
- 明确 chat/report 的产品语义
- 强化 report 是 artifact 的认知

# 9.2 Phase 2：上传到分析闭环增强
目标：提升上传文件在分析中的参与度。

建议改动点：
- `lib/uploads/parse-upload.ts`
- `components/workspace/*`
- `lib/agents/anthropic.ts`

工作项：
- 更好展示文件摘要
- 更清晰展示报表基于哪些文件生成
- 提高对话与报告对上传数据的利用率

# 9.3 Phase 3：MVP 稳定化
目标：提升演示与试用稳定性。

建议改动点：
- `app/api/chat/route.ts`
- `app/api/reports/route.ts`
- `app/api/uploads/route.ts`
- `lib/storage/repository.ts`

工作项：
- 完善错误处理
- 完善空数据场景
- 校验持久化恢复流程

---

# 10. 测试与验证

# 10.1 端到端主链路
1. 创建 Session
2. 上传 CSV
3. 发起聊天问题
4. 获取 conversation 回复
5. 生成报告
6. 获取 report artifact
7. 基于报告继续追问
8. 刷新后恢复数据

# 10.2 边界验证
- 空文件
- 非支持文件类型
- 超大小文件
- 超上传数量
- 无上传直接生成报表
- AI 服务不可用

# 10.3 体验验证
- 用户能否分辨两个 Agent
- 用户能否理解报告与消息的区别
- 用户能否顺畅完成闭环操作

---

# 11. 后续扩展方向

不纳入本次开发，但架构上应允许后续扩展：
- 报表模板化
- 更多 Agent 类型
- Agent 路由与推荐
- 外部数据源接入
- 持久化升级到数据库
- 文件升级到对象存储
- 检索增强与知识库能力

---

# 12. 结论

MVP 技术实现建议为：
- 基于现有代码结构继续演进
- 不引入新的复杂基础设施
- 用应用层双 Agent 设计完成产品落地
- 用 Session + Upload + Message + Report 作为核心四元模型
- 先保证闭环可用，再考虑自治、模板、协作与扩展能力
