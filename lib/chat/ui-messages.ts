import type { UIMessage } from "ai";

import type { MessageRecord } from "@/lib/domain/types";

export function extractTextFromUIMessage(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is Extract<UIMessage["parts"][number], { type: "text" }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export function messageRecordToUIMessage(message: MessageRecord): UIMessage {
  return {
    id: message.id,
    role: message.role,
    parts: [
      {
        type: "text",
        text: message.content,
      },
    ],
  };
}

export function messageRecordsToUIMessages(messages: MessageRecord[]) {
  return messages.map(messageRecordToUIMessage);
}
