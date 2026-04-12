// ═══════════════════════════════════════════════════════════════
// SITA OS — Conversation Summarizer
// Compresses conversations into structured summaries & facts
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { advisorMemoryService } from "./index";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationSummary {
  summary: string;
  decisions: string[];
  facts: string[];
  actionItems: string[];
  unresolvedQuestions: string[];
}

export class ConversationSummarizer {
  /**
   * Summarizes a conversation by calling the AI gateway.
   * Falls back to a local extraction if the AI call fails.
   */
  async summarize(
    advisorId: string,
    userId: string,
    messages: ConversationMessage[]
  ): Promise<ConversationSummary> {
    if (messages.length < 4) {
      return this.localExtract(messages);
    }

    try {
      const transcript = messages
        .map(m => `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`)
        .join("\n");

      const { data, error } = await supabase.functions.invoke("chat-advisor", {
        body: {
          advisor: "general",
          messages: [
            {
              role: "user",
              content: `Analyze this conversation and return ONLY valid JSON with these keys:
- "summary": one-paragraph summary
- "decisions": array of decisions made
- "facts": array of facts learned about the user (e.g. "has 2 kids", "prefers conservative investments")
- "actionItems": array of action items
- "unresolvedQuestions": array of open questions

Conversation:
${transcript}`,
            },
          ],
        },
      });

      if (error) throw error;

      // Try to parse the streamed response
      const text = typeof data === "string" ? data : JSON.stringify(data);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as ConversationSummary;
        await this.persist(advisorId, userId, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn("AI summarization failed, using local extraction:", e);
    }

    const local = this.localExtract(messages);
    await this.persist(advisorId, userId, local);
    return local;
  }

  private localExtract(messages: ConversationMessage[]): ConversationSummary {
    const userMessages = messages.filter((m: any) => m.role === "user").map((m: any) => m.content);
    const assistantMessages = messages.filter((m: any) => m.role === "assistant").map((m: any) => m.content);

    // Extract potential facts (sentences with "I have", "I am", "my", numbers)
    const factPatterns = /\b(i have|i am|i'm|my |we have|our |i prefer|i like|i need|i want)\b/i;
    const facts = userMessages
      .flatMap(m => m.split(/[.!?]+/))
      .filter(s => factPatterns.test(s))
      .map((s: any) => s.trim())
      .filter((s: any) => s.length > 10 && s.length < 200)
      .slice(0, 5);

    // Extract action items (sentences with "should", "will", "need to", "let's")
    const actionPatterns = /\b(should|will|need to|let's|going to|plan to|i'll)\b/i;
    const actionItems = [...userMessages, ...assistantMessages]
      .flatMap(m => m.split(/[.!?]+/))
      .filter(s => actionPatterns.test(s))
      .map((s: any) => s.trim())
      .filter((s: any) => s.length > 10 && s.length < 200)
      .slice(0, 5);

    // Extract questions
    const questions = userMessages
      .flatMap(m => m.split(/[.!]+/))
      .filter((s: any) => s.includes("?"))
      .map((s: any) => s.trim())
      .filter((s: any) => s.length > 10)
      .slice(0, 3);

    return {
      summary: `Conversation with ${messages.length} messages covering: ${userMessages.slice(0, 2).map((m: any) => m.slice(0, 60)).join("; ")}`,
      decisions: [],
      facts,
      actionItems,
      unresolvedQuestions: questions,
    };
  }

  private async persist(advisorId: string, userId: string, summary: ConversationSummary): Promise<void> {
    // Save the summary
    await advisorMemoryService.saveConversationSummary(advisorId, userId, summary.summary, {
      decisions: summary.decisions,
      actionItems: summary.actionItems,
      unresolvedQuestions: summary.unresolvedQuestions,
    });

    // Save each extracted fact
    for (const fact of summary.facts) {
      await advisorMemoryService.saveUserFact(advisorId, userId, fact);
    }
  }
}

export const conversationSummarizer = new ConversationSummarizer();

