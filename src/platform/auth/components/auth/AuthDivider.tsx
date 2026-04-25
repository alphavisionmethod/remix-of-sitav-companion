export const AuthDivider = ({ text = "or" }: { text?: string }) => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border/50" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-background px-3 text-[10px] text-muted-foreground uppercase tracking-wider">
        {text}
      </span>
    </div>
  </div>
);
