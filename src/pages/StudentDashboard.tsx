import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  LayoutDashboard, BookOpen, DollarSign, CalendarCheck, Calendar,
  FileText, Upload, CreditCard, Bell
} from "lucide-react";
import { useProfile, useGrades, useFinancial, useAnnouncements, useMaterials, useAttendance } from "@/hooks/useDashboardData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StudentHome } from "@/components/student/StudentHome";
import { StudentGrades } from "@/components/student/StudentGrades";
import { StudentFinancial } from "@/components/student/StudentFinancial";
import { StudentAttendance } from "@/components/student/StudentAttendance";
import { StudentMaterials } from "@/components/student/StudentMaterials";
import { StudentDocuments } from "@/components/student/StudentDocuments";
import { StudentIDCard } from "@/components/student/StudentIDCard";
import { StudentNotices } from "@/components/student/StudentNotices";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { id: "home", label: "Painel Principal", icon: LayoutDashboard },
  { id: "grades", label: "Minhas Notas", icon: BookOpen },
  { id: "financial", label: "Financeiro", icon: DollarSign },
  { id: "attendance", label: "Frequência", icon: CalendarCheck },
  { id: "calendar", label: "Calendário", icon: Calendar },
  { id: "materials", label: "Materiais", icon: FileText },
  { id: "documents", label: "Documentos", icon: Upload },
  { id: "notices", label: "Avisos", icon: Bell },
  { id: "idcard", label: "Carteirinha Digital", icon: CreditCard },
];

export default function StudentDashboard() {
  const [activeItem, setActiveItem] = useState("home");

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: grades, isLoading: gradesLoading } = useGrades(profile?.id);
  const { data: payments, isLoading: financialLoading } = useFinancial(profile?.id);
  const { data: notices, isLoading: noticesLoading } = useAnnouncements();
  const { data: attendanceRecords } = useAttendance(profile?.id);

  // Busca turmas do aluno para os materiais
  const { data: enrollments } = useQuery({
    queryKey: ["student-enrollments", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("class_id, enrolled_at, classes(name, period)")
        .eq("student_id", profile.id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  const studentClassId = enrollments?.[0]?.class_id;
  const { data: materials, isLoading: materialsLoading } = useMaterials(studentClassId);

  if (profileLoading || materialsLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const firstEnrollment = enrollments?.[0] as any;
  const className = firstEnrollment?.classes?.name || "Sem turma";
  const classPeriod = firstEnrollment?.classes?.period || "";
  const enrollmentDate = firstEnrollment?.enrolled_at
    ? new Date(firstEnrollment.enrolled_at).toLocaleDateString("pt-BR")
    : "";

  const studentData = {
    id: profile?.id || "",
    name: profile?.full_name || "Estudante",
    matricula: profile?.student_card_id || "Não informada",
    email: profile?.role || "Aluno",
    avatarInitials: profile?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "AL",
    course: classPeriod || "Período não definido",
    class: className,
    phone: "",
    enrollmentDate: enrollmentDate
  };

  const attRecords = (attendanceRecords || []).map((r: any) => ({
    subject: r.class_id || "Aula",
    date: r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '',
    status: r.status || (r.is_present ? "presente" : "ausente"),
  }));

  const attTotal = attRecords.length;
  const attPresent = attRecords.filter((r: any) => r.status === "presente").length;
  const studentAttendanceRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  const renderContent = () => {
    switch (activeItem) {
      case "home": return <StudentHome student={studentData} grades={grades || []} payments={payments || []} notices={notices || []} attendanceRate={studentAttendanceRate} onNavigate={setActiveItem} />;
      case "grades": return <StudentGrades grades={grades || []} />;
      case "financial": return <StudentFinancial payments={payments || []} />;
      case "attendance": return <StudentAttendance records={attRecords} />;
      case "materials": return <StudentMaterials materials={materials || []} />;
      case "documents": return <StudentDocuments />;
      case "notices": return <StudentNotices notices={notices || []} />;
      case "idcard": return <StudentIDCard student={studentData} />;
      default: return <StudentHome student={studentData} grades={grades || []} payments={payments || []} notices={notices || []} attendanceRate={studentAttendanceRate} onNavigate={setActiveItem} />;
    }
  };

  return (
    <Layout
      navItems={navItems}
      activeItem={activeItem}
      onNavChange={setActiveItem}
      userName={studentData.name}
      userRole="Aluno"
      avatarInitials={studentData.avatarInitials}
      userEmail={profile?.id ? "Conectado" : "Desconectado"}
      notificationCount={notices?.length || 0}
    >
      {renderContent()}
    </Layout>
  );
}
