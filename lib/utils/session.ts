import type { AgentName } from "@/lib/domain/types";

export function formatTimestamp(value: string) {
  return value.slice(0, 16).replace("T", " ");
}

export function getAgentLabel(agent: AgentName) {
  if (agent === "report") {
    return "报表 Agent";
  }

  if (agent === "conversation") {
    return "对话 Agent";
  }

  return agent;
}
