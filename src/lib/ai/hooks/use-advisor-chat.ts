// ═══════════════════════════════════════════════════════════════
// SITA OS — useAdvisorChat Hook
// Conversational AI surface hook for advisor chat
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { invokeAICapability } from "../ai-capability-client";
import type { AIResponseEnvelope, AIState } from "../ai-state-types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  envelope?: AIResponseEnvelope;
}

interface UseAdvisorChatOptions {
  capabilityKey?: string;
  systemPrompt?: string;
  onResponse?: (response: AIResponseEnvelope) => void;
}

export function useAdvisorChat(options: UseAdvisorChatOptions = {}) {
  const {
    capabilityKey = "advisor.chat.primary",
    systemPrompt = "You are a helpful business advisor for SITA OS.",
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<AIState>("idle");
  const [lastEnvelope, setLastEnvelope] = useState<AIResponseEnvelope | null>(null);

  const sendMessage = useCallback(async (content: string): Promise<AIResponseEnvelope> => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setState("loading");

    const allMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      { role: "user" as const, content },
    ];

    const result = await invokeAICapability({
      capabilityKey,
      messages: allMessages,
      taskClass: "balanced_assistant",
      surface: "web.advisor",
      intent: "chat",
    });

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.content,
      timestamp: result.timestamp,
      envelope: result,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setState(result.status);
    setLastEnvelope(result);
    options.onResponse?.(result);

    return result;
  }, [capabilityKey, systemPrompt, messages, options.onResponse]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setState("idle");
    setLastEnvelope(null);
  }, []);

  return {
    messages,
    state,
    lastEnvelope,
    sendMessage,
    clearChat,
    isLoading: state === "loading" || state === "streaming",
  };
}
