import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    index: "01",
    title: "创建工作区",
    description: "先开一个会话，明确这次要解决的问题或分析目标。",
  },
  {
    index: "02",
    title: "补充资料",
    description: "上传 CSV、Excel、TXT 或 Markdown，让上下文更完整。",
  },
  {
    index: "03",
    title: "生成报表",
    description: "让报表 Agent 基于当前资料输出结构化中文结论。",
  },
];

export function StepCards() {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {steps.map((step) => (
        <Card key={step.index} size="sm" className="bg-background/90">
          <CardHeader className="gap-4 pb-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex min-w-10 items-center justify-center border border-border/80 bg-muted/30 px-2 py-1 text-xs font-medium tracking-[0.24em]">
                {step.index}
              </span>
              <CardDescription className="text-xs uppercase tracking-[0.22em]">
                Step
              </CardDescription>
            </div>
            <CardTitle className="tracking-tight">{step.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 text-sm leading-7 text-muted-foreground">
            <p>{step.description}</p>
            <div className="h-px bg-border/70" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
