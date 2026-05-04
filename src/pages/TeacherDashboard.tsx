import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { LayoutDashboard, Users, BookOpen, CalendarCheck, Upload, BarChart2, MessageCircle } from "lucide-react";
import { useTeacherClasses, useClassStudents } from "@/hooks/useDashboardData";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeacherHome } from "@/components/teacher/TeacherHome";
import { TeacherClasses } from "@/components/teacher/TeacherClasses";
import { TeacherGrades } from "@/components/teacher/TeacherGrades";
import { TeacherAttendance } from "@/components/teacher/TeacherAttendance";
import { TeacherContent } from "@/components/teacher/TeacherContent";
import { AdminChat } from "@/components/chat/AdminChat";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { id: "home", label: "Painel Principal", icon: LayoutDashboard },
  { id: "classes", label: "Minhas Turmas", icon: Users },
  { id: "grades", label: "Lançar Notas", icon: BookOpen },
  { id: "attendance", label: "Frequência", icon: CalendarCheck },
  { id: "content", label: "Conteúdo / Aulas", icon: Upload },
  { id: "chat", label: "Mensagens", icon: MessageCircle },
  { id: "reports", label: "Relatórios", icon: BarChart2 },
];

export default function TeacherDashboard() {
  const [activeItem, setActiveItem] = useState("home");

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: classes, isLoading: classesLoading } = useTeacherClasses(profile?.id);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);

  const { data: students } = useClassStudents(selectedClassId);

  const classIds = classes?.map(c => c.id) || [];

  const { data: teacherStats } = useQuery({
    queryKey: ["teacher-stats", classIds],
    queryFn: async () => {
      if (classIds.length === 0) return { avgGrade: null, avgAttendance: null };

      const { data: grades } = await supabase
        .from("grades")
        .select("grade_value")
        .in("class_id", classIds);

      const { data: attendance } = await supabase
        .from('attendance')
        .select('status')
        .in('class_id', classIds)

      const validGrades = (grades || []).filter(g => g.grade_value != null);
      const avgGrade = validGrades.length > 0
        ? validGrades.reduce((s, g) => s + Number(g.grade_value), 0) / validGrades.length
        : null;

      const avgAttendance = attendance && attendance.length > 0
        ? Math.round(
            attendance.filter((a: any) => a.status === 'presente').length /
            attendance.length * 100
          )
        : null;


      return { avgGrade, avgAttendance };
    },
    enabled: classIds.length > 0,
  });

  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  if (profileLoading || classesLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const teacherData = {
    id: profile?.id || "",
    name: profile?.fullname || "Docente",
    email: profile?.role || "Professor",
    avatarInitials: profile?.fullname?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "DC",
    speciality: "Especialista"
  };

  const renderContent = () => {
    const classList = classes || [];
    const studentList = students || [];

    switch (activeItem) {
      case "home": return <TeacherHome teacher={teacherData} classes={classList as any} onNavigate={setActiveItem} avgGrade={teacherStats?.avgGrade} avgAttendance={teacherStats?.avgAttendance} />;
      case "classes": return <TeacherClasses classes={classList as any} onSelectClass={(id) => { setSelectedClassId(id); setActiveItem("grades"); }} />;
      case "grades": return <TeacherGrades students={studentList as any} classes={classList as any} selectedClass={selectedClassId || ""} onClassChange={setSelectedClassId} />;
      case "attendance": return <TeacherAttendance students={studentList as any} classes={classList as any} selectedClass={selectedClassId || ""} />;
      case "content": return <TeacherContent />;
      case "chat": return <div className="p-4 max-w-2xl mx-auto"><AdminChat /></div>;
      default: return <TeacherHome teacher={teacherData} classes={classList as any} onNavigate={setActiveItem} />;
    }

  };

  return (
    <Layout
      navItems={navItems}
      activeItem={activeItem}
      onNavChange={setActiveItem}
      userName={teacherData.name}
      userRole="Docente"
      avatarInitials={teacherData.avatarInitials}
      userEmail={profile?.id ? "Conectado" : "Desconectado"}
      notificationCount={0}
    >
      {renderContent()}
    </Layout>
  );
}
