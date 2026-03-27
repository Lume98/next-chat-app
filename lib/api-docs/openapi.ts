const errorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "string",
      description: "错误信息",
    },
  },
};

const sessionExample = {
  id: "sess_01hzc9x7g1w0example",
  title: "分析 2025 年销售表现",
  createdAt: "2026-03-27T09:30:00.000Z",
  updatedAt: "2026-03-27T09:45:00.000Z",
  lastActiveAgent: "conversation",
  latestReportId: "report_01hzc9x9g8example",
};

const sessionSchema = {
  type: "object",
  required: ["id", "title", "createdAt", "updatedAt", "lastActiveAgent"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    lastActiveAgent: {
      type: "string",
      enum: ["conversation", "report"],
    },
    latestReportId: { type: "string" },
  },
  example: sessionExample,
};

const messageExample = {
  id: "msg_01hzc9x8x2example",
  sessionId: "sess_01hzc9x7g1w0example",
  role: "assistant",
  agent: "conversation",
  content: "我已经整理了这批数据的关键趋势，可以继续生成分析结论。",
  attachmentIds: [],
  artifactIds: [],
  status: "complete",
  createdAt: "2026-03-27T09:46:00.000Z",
};

const messageSchema = {
  type: "object",
  required: [
    "id",
    "sessionId",
    "role",
    "agent",
    "content",
    "attachmentIds",
    "artifactIds",
    "status",
    "createdAt",
  ],
  properties: {
    id: { type: "string" },
    sessionId: { type: "string" },
    role: {
      type: "string",
      enum: ["user", "assistant", "system"],
    },
    agent: {
      type: "string",
      enum: ["conversation", "report"],
    },
    content: { type: "string" },
    attachmentIds: {
      type: "array",
      items: { type: "string" },
    },
    artifactIds: {
      type: "array",
      items: { type: "string" },
    },
    status: {
      type: "string",
      enum: ["pending", "complete", "error"],
    },
    createdAt: { type: "string", format: "date-time" },
  },
  example: messageExample,
};

const uploadExample = {
  id: "upload_01hzc9y0k3example",
  sessionId: "sess_01hzc9x7g1w0example",
  fileName: "sales-q1.csv",
  mimeType: "text/csv",
  size: 48213,
  kind: "csv",
  storageKey: "sess_01hzc9x7g1w0example/uuid-sales-q1.csv",
  parseStatus: "parsed",
  summary: "包含 2025 年第一季度订单、地区和销售额字段。",
  schemaPreview: ["date", "region", "sales", "orders"],
  analysisText: "数据包含 90 条记录，字段完整，可用于报表生成。",
  createdAt: "2026-03-27T09:50:00.000Z",
};

const uploadSchema = {
  type: "object",
  required: [
    "id",
    "sessionId",
    "fileName",
    "mimeType",
    "size",
    "kind",
    "storageKey",
    "parseStatus",
    "summary",
    "schemaPreview",
    "analysisText",
    "createdAt",
  ],
  properties: {
    id: { type: "string" },
    sessionId: { type: "string" },
    fileName: { type: "string" },
    mimeType: { type: "string" },
    size: { type: "number" },
    kind: {
      type: "string",
      enum: ["csv", "excel", "text"],
    },
    storageKey: { type: "string" },
    parseStatus: {
      type: "string",
      enum: ["parsed", "error"],
    },
    summary: { type: "string" },
    schemaPreview: {
      type: "array",
      items: { type: "string" },
    },
    analysisText: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
  example: uploadExample,
};

const reportSectionExample = {
  id: "section_01hzc9ya6mexample",
  title: "总体结论",
  content: "第一季度东部地区销售额最高，3 月出现明显增长。",
};

const reportSectionSchema = {
  type: "object",
  required: ["id", "title", "content"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    content: { type: "string" },
  },
  example: reportSectionExample,
};

const reportExample = {
  id: "report_01hzc9x9g8example",
  sessionId: "sess_01hzc9x7g1w0example",
  title: "2025 年第一季度销售分析",
  sourceUploadIds: ["upload_01hzc9y0k3example"],
  status: "complete",
  format: "markdown",
  summary: "销售额整体稳定增长，东部地区表现最强。",
  sections: [reportSectionExample],
  createdAt: "2026-03-27T10:05:00.000Z",
  updatedAt: "2026-03-27T10:05:00.000Z",
};

const reportSchema = {
  type: "object",
  required: [
    "id",
    "sessionId",
    "title",
    "sourceUploadIds",
    "status",
    "format",
    "summary",
    "sections",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    sessionId: { type: "string" },
    title: { type: "string" },
    sourceUploadIds: {
      type: "array",
      items: { type: "string" },
    },
    status: {
      type: "string",
      enum: ["pending", "complete", "error"],
    },
    format: {
      type: "string",
      enum: ["markdown"],
    },
    summary: { type: "string" },
    sections: {
      type: "array",
      items: reportSectionSchema,
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  example: reportExample,
};

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Next Chat Workspace API",
    version: "1.0.0",
    description:
      "当前工作台项目的会话、聊天、上传和报表接口文档。当前版本未启用鉴权，前端可在同源环境下直接调用这些接口。",
  },
  servers: [
    {
      url: "/",
      description: "当前部署环境",
    },
  ],
  tags: [
    { name: "Sessions", description: "会话管理" },
    { name: "Chat", description: "对话交互" },
    { name: "Uploads", description: "文件上传与解析" },
    { name: "Reports", description: "报表生成" },
  ],
  paths: {
    "/api/sessions": {
      get: {
        tags: ["Sessions"],
        summary: "获取会话列表",
        description: "返回当前所有会话，按存储层默认顺序输出。",
        responses: {
          200: {
            description: "会话列表",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["sessions"],
                  properties: {
                    sessions: {
                      type: "array",
                      items: sessionSchema,
                    },
                  },
                },
                example: {
                  sessions: [sessionExample],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Sessions"],
        summary: "创建会话",
        description: "创建一个新会话。`title` 可选，省略时由服务端生成默认标题。",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "可选，会话标题",
                  },
                },
              },
              examples: {
                withTitle: {
                  summary: "带标题创建",
                  value: {
                    title: "分析 2025 年销售表现",
                  },
                },
                emptyBody: {
                  summary: "空请求体创建",
                  value: {},
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "会话创建成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["session"],
                  properties: {
                    session: sessionSchema,
                  },
                },
                example: {
                  session: sessionExample,
                },
              },
            },
          },
        },
      },
    },
    "/api/chat": {
      post: {
        tags: ["Chat"],
        summary: "发送消息并获取助手回复",
        description:
          "向指定会话追加一条用户消息，并立即返回对应的助手回复。当前接口无需鉴权，但要求 `sessionId` 已存在。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId", "content"],
                properties: {
                  sessionId: {
                    type: "string",
                  },
                  content: {
                    type: "string",
                  },
                },
              },
              examples: {
                default: {
                  summary: "发送一条对话消息",
                  value: {
                    sessionId: "sess_01hzc9x7g1w0example",
                    content: "请总结这个季度的销售趋势。",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "消息发送成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["session", "userMessage", "assistantMessage"],
                  properties: {
                    session: sessionSchema,
                    userMessage: messageSchema,
                    assistantMessage: messageSchema,
                  },
                },
                example: {
                  session: {
                    ...sessionExample,
                    updatedAt: "2026-03-27T09:46:00.000Z",
                  },
                  userMessage: {
                    ...messageExample,
                    id: "msg_01hzc9x8u1example",
                    role: "user",
                    content: "请总结这个季度的销售趋势。",
                    agent: "conversation",
                  },
                  assistantMessage: messageExample,
                },
              },
            },
          },
          400: {
            description: "请求参数错误",
            content: {
              "application/json": {
                schema: errorSchema,
                examples: {
                  missingSessionId: {
                    summary: "缺少 sessionId",
                    value: { error: "缺少 sessionId" },
                  },
                  emptyContent: {
                    summary: "消息为空",
                    value: { error: "消息内容不能为空" },
                  },
                },
              },
            },
          },
          404: {
            description: "会话不存在",
            content: {
              "application/json": {
                schema: errorSchema,
                example: { error: "会话不存在" },
              },
            },
          },
        },
      },
    },
    "/api/uploads": {
      post: {
        tags: ["Uploads"],
        summary: "上传并解析文件",
        description:
          "以 `multipart/form-data` 上传文件并绑定到指定会话。支持 CSV、Excel、TXT 和 Markdown。",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["sessionId", "file"],
                properties: {
                  sessionId: {
                    type: "string",
                  },
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
              encoding: {
                file: {
                  contentType:
                    "text/csv, application/vnd.ms-excel, text/plain, text/markdown",
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "上传成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["upload"],
                  properties: {
                    upload: uploadSchema,
                  },
                },
                example: {
                  upload: uploadExample,
                },
              },
            },
          },
          400: {
            description: "请求参数错误或文件不合法",
            content: {
              "application/json": {
                schema: errorSchema,
                examples: {
                  missingSessionId: {
                    summary: "缺少 sessionId",
                    value: { error: "缺少 sessionId" },
                  },
                  unsupportedType: {
                    summary: "文件类型不支持",
                    value: { error: "仅支持 CSV、Excel、TXT 或 Markdown 文件" },
                  },
                },
              },
            },
          },
          404: {
            description: "会话不存在",
            content: {
              "application/json": {
                schema: errorSchema,
                example: { error: "会话不存在" },
              },
            },
          },
          500: {
            description: "文件解析失败",
            content: {
              "application/json": {
                schema: errorSchema,
                example: { error: "上传解析失败" },
              },
            },
          },
        },
      },
    },
    "/api/reports": {
      post: {
        tags: ["Reports"],
        summary: "基于已上传文件生成报表",
        description:
          "读取指定会话下已解析的上传文件，生成 markdown 报表，并同步写入一条报表消息。",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sessionId"],
                properties: {
                  sessionId: {
                    type: "string",
                  },
                },
              },
              examples: {
                default: {
                  summary: "为会话生成报表",
                  value: {
                    sessionId: "sess_01hzc9x7g1w0example",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "报表生成成功",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["report", "reportMessage"],
                  properties: {
                    report: reportSchema,
                    reportMessage: messageSchema,
                  },
                },
                example: {
                  report: reportExample,
                  reportMessage: {
                    ...messageExample,
                    id: "msg_01hzc9yb7aexample",
                    agent: "report",
                    content: "2025 年第一季度销售分析\n\n销售额整体稳定增长，东部地区表现最强。",
                    artifactIds: ["report_01hzc9x9g8example"],
                    createdAt: "2026-03-27T10:05:01.000Z",
                  },
                },
              },
            },
          },
          400: {
            description: "请求参数错误",
            content: {
              "application/json": {
                schema: errorSchema,
                examples: {
                  missingSessionId: {
                    summary: "缺少 sessionId",
                    value: { error: "缺少 sessionId" },
                  },
                  noUploads: {
                    summary: "没有可用上传文件",
                    value: { error: "请先上传至少一个文件，再生成报表" },
                  },
                },
              },
            },
          },
          404: {
            description: "会话不存在",
            content: {
              "application/json": {
                schema: errorSchema,
                example: { error: "会话不存在" },
              },
            },
          },
        },
      },
    },
  },
} as const;
