// ═══════════════════════════════════════════════════════════════
// SITA OS — useAdvisorChat Hook
// Conversational AI surface hook for advisor chat
// Now surfaces trust metadata (caveats, evidence, assumptions)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { invokeAICapability, type TrustEnrichedResponse } from "../ai-capability-client";
import type { AIState } from "../ai-state-types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  envelope?: TrustEnrichedResponse;
  /** Trust caveats surfaced from epistemic firewall */
  caveats?: string[];
  /** Whether the response was blocked by safety checks */
  blocked?: boolean;
  blockReason?: string;
}

interface UseAdvisorChatOptions {
  capabilityKey?: string;
  systemPrompt?: string;
  onResponse?: (response: TrustEnrichedResponse) => void;
}

export function useAdvisorChat(options: UseAdvisorChatOptions = {}) {
  const {
    capabilityKey = "advisor.chat.primary",
    systemPrompt = "You are a helpful business advisor for SITA OS.",
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [state, setState] = useState<AIState>("idle");
  const [lastEnvelope, setLastEnvelope] = useState<TrustEnrichedResponse | null>(null);

  const sendMessage = useCallback(async (content: string): Promise<TrustEnrichedResponse> => {
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

    // Surface trust metadata in the chat message
    const trustMeta = result.trustMetadata;
    const caveats = trustMeta?.caveats ?? [];
    const blocked = !!trustMeta?.negativeReceipt;
    const blockReason = trustMeta?.negativeReceipt?.blockedDescription;

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: blocked
        ? (result.userFacingMessage || blockReason || "This request was blocked by safety checks.")
        : result.content,
      timestamp: result.timestamp,
      envelope: result,
      caveats: caveats.length > 0 ? caveats : undefined,
      blocked,
      blockReason,
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
