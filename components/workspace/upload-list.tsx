import type { ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UploadRecord } from "@/lib/domain/types";

function formatSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadList({
  uploads,
  onUpload,
  isUploading,
}: {
  uploads: UploadRecord[];
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}) {
  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onUpload(file);
  }

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">上传文件</CardTitle>
          <CardDescription>
            支持 CSV、Excel、TXT 与 Markdown，单文件限制 10MB。
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{uploads.length} 个文件</span>
          <Button asChild variant="outline" disabled={isUploading}>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.txt,.md,.markdown,text/csv,text/plain,text/markdown,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleChange}
                disabled={isUploading}
              />
              {isUploading ? "上传中…" : "选择文件"}
            </label>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {uploads.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="space-y-3 py-6">
              <p className="font-medium text-foreground">先补充一份上下文资料</p>
              <p className="leading-6 text-muted-foreground">
                上传数据、日志、说明文档或 Markdown 备注后，当前会话会立即获得更多分析依据。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <Card key={upload.id} size="sm">
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium">{upload.fileName}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs uppercase tracking-[0.18em]">
                          {upload.kind}
                        </Badge>
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {formatSize(upload.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{upload.summary}</p>
                  {upload.schemaPreview.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {upload.schemaPreview.map((field) => (
                        <Badge key={field} variant="outline" className="text-sm">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isUploading ? (
          <Card className="mt-3">
            <CardContent className="space-y-2 py-3">
              <div className="h-3 w-24 animate-pulse bg-muted" />
              <div className="h-3 w-full animate-pulse bg-muted" />
              <div className="h-3 w-2/3 animate-pulse bg-muted" />
            </CardContent>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  );
}
