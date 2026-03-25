import type { ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
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
    <section className="space-y-4 border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">上传文件</h2>
          <p className="text-xs text-muted-foreground">
            支持 CSV、Excel、TXT 与 Markdown，单文件限制 10MB。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{uploads.length} 个文件</span>
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
      </div>

      {uploads.length === 0 ? (
        <div className="space-y-3 border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">先补充一份上下文资料</p>
          <p className="leading-6">
            上传数据、日志、说明文档或 Markdown 备注后，当前会话会立即获得更多分析依据。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <article key={upload.id} className="border border-border bg-background p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{upload.fileName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="border border-border px-2 py-1">{upload.kind}</span>
                    <span>{formatSize(upload.size)}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{upload.summary}</p>
              {upload.schemaPreview.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {upload.schemaPreview.map((field) => (
                    <span key={field} className="border border-border bg-card px-2 py-1">
                      {field}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {isUploading ? (
        <div className="border border-border bg-background p-3">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse bg-muted" />
            <div className="h-3 w-full animate-pulse bg-muted" />
            <div className="h-3 w-2/3 animate-pulse bg-muted" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
