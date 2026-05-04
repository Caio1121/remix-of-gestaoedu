import { LucideIcon } from "lucide-react";
import { UserRole } from "@/types";

interface RoleCardProps {
  id: UserRole;
  label: string;
  icon: LucideIcon;
  color: string;
  isSelected: boolean;
  onSelect: (id: UserRole) => void;
}

export const RoleCard = ({ id, label, icon: Icon, color, isSelected, onSelect }: RoleCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
        ? "border-primary bg-primary/5 shadow-primary-glow"
        : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
        }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${color} ${isSelected ? "shadow-md" : "opacity-70 group-hover:opacity-90"}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
        {label}
      </span>
    </button>
  );
};
