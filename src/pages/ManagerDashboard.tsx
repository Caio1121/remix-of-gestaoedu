import { useState } from "react";
import { Layout } from "@/components/Layout";
import { LayoutDashboard, Users, BarChart2, DollarSign, GraduationCap, Megaphone, MessageCircle } from "lucide-react";
import { useProfile, useManagerData, useRevenueData, useCoursePerformance, useAnnouncements } from "@/hooks/useDashboardData";
import { ManagerHome } from "@/components/manager/ManagerHome";
import { ManagerFinancial } from "@/components/manager/ManagerFinancial";
import { ManagerAcademic } from "@/components/manager/ManagerAcademic";
import { ManagerUsers } from "@/components/manager/ManagerUsers";
import { ManagerReports } from "@/components/manager/ManagerReports";
import { ManagerAnnouncements } from "@/components/manager/ManagerAnnouncements";
import { AdminChat } from "@/components/chat/AdminChat";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { id: "home", label: "Painel Executivo", icon: LayoutDashboard },
  { id: "academic", label: "Desempenho Acadêmico", icon: GraduationCap },
  { id: "financial", label: "Financeiro", icon: DollarSign },
  { id: "users", label: "Usuários & Turmas", icon: Users },
  { id: "announcements", label: "Comunicados", icon: Megaphone },
  { id: "chat", label: "Mensagens", icon: MessageCircle },
  { id: "reports", label: "Relatórios BI", icon: BarChart2 },
];

export default function ManagerDashboard() {
  const [activeItem, setActiveItem] = useState("home");

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: kpis, isLoading: kpisLoading } = useManagerData();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData();
  const { data: coursesData, isLoading: coursesLoading } = useCoursePerformance();
  const { data: announcements } = useAnnouncements();

  if (profileLoading || kpisLoading || revenueLoading || coursesLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const managerData = {
    id: profile?.id || "",
    name: profile?.full_name || "Gestor",
    role: "Diretor Acadêmico",
    email: profile?.role || "Diretoria",
    avatarInitials: profile?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "GS",
  };

  const renderContent = () => {
    const currentKPIs = kpis || {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      attendanceRate: 0,
      approvalRate: 0,
      revenueMonth: 0,
      revenueDefault: 0,
      absenteeismRate: 0
    };

    const currentRevenue = revenueData || [];
    const currentCourses = coursesData || [];

    switch (activeItem) {
      case "home": return <ManagerHome manager={managerData} kpis={currentKPIs} revenue={currentRevenue} onNavigate={setActiveItem} />;
      case "financial": return <ManagerFinancial revenue={currentRevenue} kpis={currentKPIs} />;
      case "academic": return <ManagerAcademic courses={currentCourses} kpis={currentKPIs} />;
      case "users": return <ManagerUsers kpis={currentKPIs} />;
      case "announcements": return <ManagerAnnouncements />;
      case "chat": return <div className="p-4 max-w-2xl mx-auto"><AdminChat /></div>;
      case "reports": return <ManagerReports revenue={currentRevenue} courses={currentCourses} kpis={currentKPIs} />;
      default: return <ManagerHome manager={managerData} kpis={currentKPIs} revenue={currentRevenue} onNavigate={setActiveItem} />;
    }
  };

  return (
    <Layout
      navItems={navItems}
      activeItem={activeItem}
      onNavChange={setActiveItem}
      userName={managerData.name}
      userRole="Gestor"
      avatarInitials={managerData.avatarInitials}
      userEmail={profile?.id ? "Conectado" : "Desconectado"}
      notificationCount={announcements?.length || 0}
    >
      {renderContent()}
    </Layout>
  );
}
