const steps = [
  {
    label: "1. 先发起对话",
    description: "用自然语言描述目标、问题或你希望完成的分析任务。",
  },
  {
    label: "2. 再补充资料",
    description: "上传 CSV、Excel、TXT 或 Markdown，让上下文更完整。",
  },
  {
    label: "3. 生成报表",
    description: "报表 Agent 会基于当前资料输出结构化中文结论。",
  },
];

export function StepCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((step) => (
        <div key={step.label} className="border border-border bg-background px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {step.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}
