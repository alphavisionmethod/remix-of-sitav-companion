// ═══════════════════════════════════════════════════════════════
// SITA OS — Voice intent → host bridge (Phase B)
// ═══════════════════════════════════════════════════════════════
// Listens on the global "sita-voice-intent" bus and turns intents
// into concrete host actions (launch app, toggle focus, open
// command palette, …). Phase C: forwards Brain-bound utterances
// with the focused screen-context payload.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { toast } from "sonner";
import type { SitaIntent } from "./voice-intent-router";
import { formatScreenContextPrompt } from "@/lib/sita-context/sita-screen-context";

export interface SitaVoiceBridgeOptions {
  launchApp: (appId: string, originRect?: DOMRect) => void;
  focus: { active: boolean; start: (minutes?: number) => void; stop: () => void };
  setLauncherOpen: (open: boolean | ((p: boolean) => boolean)) => void;
  setCommandOpen: (open: boolean | ((p: boolean) => boolean)) => void;
  setControlCenterOpen: (open: boolean | ((p: boolean) => boolean)) => void;
  setNotifDropdownOpen: (open: boolean | ((p: boolean) => boolean)) => void;
}

export function useSitaVoiceBridge(opts: SitaVoiceBridgeOptions) {
  useEffect(() => {
    const handler = (event: Event) => {
      const intent = (event as CustomEvent<SitaIntent>).detail;
      if (!intent) return;

      switch (intent.kind) {
        case "launch_app":
          opts.launchApp(intent.appId);
          toast.success(`Opening ${intent.appId}`, { description: `"${intent.raw}"` });
          break;
        case "focus_start":
          opts.focus.start(intent.minutes);
          toast.success(`Focus mode ${intent.minutes} min`);
          break;
        case "focus_stop":
          opts.focus.stop();
          toast("Focus mode ended");
          break;
        case "open_command_palette":
          opts.setCommandOpen(true);
          break;
        case "open_launcher":
          opts.setLauncherOpen(true);
          break;
        case "open_control_center":
          opts.setControlCenterOpen(true);
          break;
        case "open_notifications":
          opts.setNotifDropdownOpen(true);
          break;
        case "summarize_screen": {
          // Phase C — push to Brain with explicit "summarize" instruction
          const ctxPrompt = formatScreenContextPrompt(intent.context);
          window.dispatchEvent(new CustomEvent("sita-voice-brain-request", {
            detail: {
              utterance: intent.raw,
              instruction: "Summarize what is currently on screen for the user.",
              screenContext: ctxPrompt,
            },
          }));
          if (!intent.context) {
            toast("Nothing focused to summarize", {
              description: "Open or focus a window first.",
            });
          }
          break;
        }
        case "act_on_screen": {
          const ctxPrompt = formatScreenContextPrompt(intent.context);
          window.dispatchEvent(new CustomEvent("sita-voice-brain-request", {
            detail: {
              utterance: intent.raw,
              instruction: `Help the user ${intent.verb} the focused item.`,
              screenContext: ctxPrompt,
            },
          }));
          break;
        }
        case "brain": {
          const ctxPrompt = formatScreenContextPrompt(intent.context);
          window.dispatchEvent(new CustomEvent("sita-voice-brain-request", {
            detail: {
              utterance: intent.utterance,
              screenContext: ctxPrompt,
            },
          }));
          break;
        }
      }
    };
    window.addEventListener("sita-voice-intent", handler);
    return () => window.removeEventListener("sita-voice-intent", handler);
  }, [opts]);
}