import { useState } from "react";
import { motion } from "framer-motion";
import { X, CalendarPlus, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineBookingFlowProps {
  onClose: () => void;
}

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

export const InlineBookingFlow = ({ onClose }: InlineBookingFlowProps) => {
  const [step, setStep] = useState<"details" | "time" | "confirm">("details");
  const [title, setTitle] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed inset-x-0 bottom-12 z-50 mx-auto max-w-sm px-4"
    >
      <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-sita-gold" />
            <span className="text-sm font-semibold text-foreground">Quick Book</span>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          {confirmed ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center py-4"
            >
              <Check className="w-8 h-8 mx-auto text-trust-safe mb-2" />
              <p className="text-sm font-medium text-foreground">Booked!</p>
              <p className="text-xs text-muted-foreground">{title} at {selectedTime}</p>
            </motion.div>
          ) : step === "details" ? (
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's this for?"
                className="h-9 text-sm bg-secondary/50 border-border/30"
                autoFocus
              />
              <Button
                size="sm"
                className="w-full h-8 text-xs bg-sita-purple hover:bg-sita-purple-light text-primary-foreground"
                onClick={() => setStep("time")}
                disabled={!title.trim()}
              >
                Pick a time →
              </Button>
            </div>
          ) : step === "time" ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Select a time slot
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => { setSelectedTime(time); setStep("confirm"); }}
                    className={cn(
                      "px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                      "bg-secondary/50 hover:bg-sita-purple/20 hover:text-sita-purple text-muted-foreground"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setStep("details")}>
                ← Back
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs font-medium text-foreground">{title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tomorrow at {selectedTime}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs" onClick={() => setStep("time")}>
                  Change
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs bg-trust-safe hover:bg-trust-safe/80 text-primary-foreground"
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
