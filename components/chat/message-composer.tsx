import type { FormEvent, KeyboardEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription as FormFieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSending,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSending: boolean;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSubmit();
    }
  }

  const trimmedValue = value.trim();

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              对话 Agent
            </CardTitle>
            <CardDescription>
              继续当前会话，结合已有消息和上传内容补充问题或追问。
            </CardDescription>
          </div>
          <Badge variant="outline">
            {isSending ? "正在生成回复…" : "支持多轮追问"}
          </Badge>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="message">消息内容</FieldLabel>
              <FieldContent>
                <Textarea
                  id="message"
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题、分析目标或后续追问…"
                  className="min-h-32 text-base leading-8"
                />
                <FormFieldDescription>
                  Enter 换行，Ctrl / Cmd + Enter 发送。建议直接描述目标、上下文和你希望的输出格式。
                </FormFieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {trimmedValue ? `已输入 ${trimmedValue.length} 个字符` : "等待输入"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange("")}
              disabled={isSending || !value}
            >
              清空
            </Button>
            <Button type="submit" disabled={isSending || !trimmedValue}>
              {isSending ? "发送中…" : "发送消息"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
