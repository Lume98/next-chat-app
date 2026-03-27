import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportArtifact } from "@/lib/domain/types";

export function ReportPanel({
  reports,
  onGenerate,
  isGenerating,
  canGenerate,
}: {
  reports: ReportArtifact[];
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
}) {
  const latestReport = reports[0];

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">报表 Agent</CardTitle>
          <CardDescription>
            基于当前上传文件生成结构化中文报告。
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{reports.length} 份报表</span>
          <Button onClick={onGenerate} disabled={!canGenerate || isGenerating}>
            {isGenerating ? "生成中…" : "生成报表"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canGenerate ? (
          <p className="text-sm leading-7 text-muted-foreground">
            至少上传一个文件后才能生成报表。
          </p>
        ) : null}

        {isGenerating ? (
          <Card>
            <CardContent className="space-y-3 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                正在生成最新报表
              </p>
              <div className="space-y-2">
                <div className="h-4 w-2/5 animate-pulse bg-muted" />
                <div className="h-3 w-full animate-pulse bg-muted" />
                <div className="h-3 w-5/6 animate-pulse bg-muted" />
                <div className="h-3 w-3/4 animate-pulse bg-muted" />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {latestReport ? (
          <Card>
            <CardContent className="space-y-4 py-4">
              <div className="space-y-2 border-b border-border pb-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  最新报表
                </p>
                <h3 className="text-lg font-semibold leading-8">{latestReport.title}</h3>
                <p className="text-base leading-8 text-muted-foreground">{latestReport.summary}</p>
              </div>
              <div className="space-y-4">
                {latestReport.sections.map((section) => (
                  <section key={section.id} className="space-y-2 border-l border-border pl-3">
                    <h4 className="text-base font-medium">{section.title}</h4>
                    <div className="whitespace-pre-wrap text-base leading-8 text-muted-foreground">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-6 text-sm text-muted-foreground">
              还没有报表。上传文件后点击&quot;生成报表&quot;即可查看最新结论。
            </CardContent>
          </Card>
        )}

        {reports.length > 1 ? (
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              历史报表
            </h3>
            <div className="space-y-2">
              {reports.slice(1).map((report) => (
                <Card key={report.id} size="sm">
                  <CardContent className="py-3">
                    <p className="text-base font-medium">{report.title}</p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">
                      {report.summary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
