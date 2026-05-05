import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap, LogOut, Bell, ChevronDown, ChevronRight, X, Menu, MessageSquare
} from "lucide-react";
import { AdminChat } from "./chat/AdminChat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface LayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeItem: string;
  onNavChange: (id: string) => void;
  userName: string;
  userRole: string;
  avatarInitials: string;
  userEmail: string;
  notificationCount?: number;
}

export function Layout({
  children,
  navItems,
  activeItem,
  onNavChange,
  userName,
  userRole,
  avatarInitials,
  userEmail,
  notificationCount = 0,
}: LayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sidebar-primary/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <div className="font-bold text-sidebar-foreground text-base leading-tight">EduManager</div>
            <div className="text-xs text-sidebar-foreground/50">{userRole}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavChange(item.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-accent-glow"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive ? "" : "opacity-70")} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  isActive ? "bg-white/20" : "bg-sidebar-accent text-sidebar-accent-foreground"
                )}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </button>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-3 pb-4">
        <div className="bg-sidebar-accent rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0 text-sidebar-primary-foreground font-bold text-sm">
            {avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sidebar-foreground text-sm font-semibold truncate">{userName.split(" ")[0]} {userName.split(" ")[1]}</div>
            <div className="text-sidebar-foreground/50 text-xs truncate">{userEmail}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-border/50"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-sidebar h-full z-50">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-sidebar-foreground/50 hover:text-sidebar-foreground">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-60 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 bg-card border-b border-border flex items-center px-4 gap-4 shadow-sm">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">
              {navItems.find(n => n.id === activeItem)?.label || "Dashboard"}
            </h1>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="w-4.5 h-4.5 text-muted-foreground" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-primary-foreground font-bold text-xs">
                  {avatarInitials}
                </div>
                <span className="text-sm font-medium hidden sm:block">{userName.split(" ")[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold">{userName}</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={async () => {
                await supabase.auth.signOut();
                navigate("/");
              }} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in relative">
          {children}

          {/* Floating Chat Button */}
          {(userRole === "docente" || userRole === "gestor" || userRole === "aluno") && (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
              {isChatOpen && (
                <div className="animate-in slide-in-from-bottom-5 duration-300">
                  <AdminChat onClose={() => setIsChatOpen(false)} />
                </div>
              )}
              <Button
                onClick={() => setIsChatOpen(!isChatOpen)}
                size="icon"
                className={cn(
                  "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 gradient-brand text-white",
                  isChatOpen && "rotate-90 bg-destructive"
                )}
              >
                {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
