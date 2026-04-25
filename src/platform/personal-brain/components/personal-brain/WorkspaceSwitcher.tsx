import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PbWorkspace } from "./hooks/usePbWorkspaces";

interface WorkspaceSwitcherProps {
  workspaces: PbWorkspace[];
  value: string | "none";
  onChange: (value: string | "none") => void;
  className?: string;
}

export function WorkspaceSwitcher({ workspaces, value, onChange, className }: WorkspaceSwitcherProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as string | "none")}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="No workspace" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No workspace</SelectItem>
        {workspaces.map((w) => (
          <SelectItem key={w.id} value={w.id}>
            {w.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}