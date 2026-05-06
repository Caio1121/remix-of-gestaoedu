import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  LayoutDashboard, BookOpen, DollarSign, CalendarCheck, Calendar,
  FileText, Upload, CreditCard, Bell, MessageCircle
} from "lucide-react";
import { useFinancial, useMaterials, useAttendance, useGrades, useStudentEnrollments } from "@/hooks/useStudentData";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { StudentHome } from "@/components/student/StudentHome";
import { StudentGrades } from "@/components/student/StudentGrades";
import { StudentFinancial } from "@/components/student/StudentFinancial";
import { StudentAttendance } from "@/components/student/StudentAttendance";
import { StudentMaterials } from "@/components/student/StudentMaterials";
import { StudentDocuments } from "@/components/student/StudentDocuments";
import { StudentIDCard } from "@/components/student/StudentIDCard";
import { StudentNotices } from "@/components/student/StudentNotices";
import { StudentCalendar } from "@/components/student/StudentCalendar";
import { AdminChat } from "../components/chat/AdminChat";
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
  { id: "chat", label: "Mensagens", icon: MessageCircle },
];

export default function StudentDashboard() {
  const [activeItem, setActiveItem] = useState("home");

  const { profile, loading: profileLoading } = useAuth();
  const { data: grades } = useGrades(profile?.id);
  const { data: payments } = useFinancial(profile?.id);
  const { data: notices } = useAnnouncements();
  const { data: attendanceRecords } = useAttendance(profile?.id);

  // Busca turmas do aluno para os materiais
  const { data: enrollments } = useStudentEnrollments(profile?.id);
  const studentClassId = enrollments?.[0]?.classid;
  const { data: materials, isLoading: materialsLoading } = useMaterials(studentClassId as string);

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
  const enrollmentDate = firstEnrollment?.enrolledat
    ? new Date(firstEnrollment.enrolledat).toLocaleDateString("pt-BR")
    : "";

  const studentData = {
    id: profile?.id || "",
    name: profile?.fullname || "Estudante",
    matricula: profile?.studentcardid || "Não informada",
    email: profile?.role || "Aluno",
    avatarInitials: profile?.fullname?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "AL",
    course: classPeriod || "Período não definido",
    class: className,
    phone: "",
    enrollmentDate: enrollmentDate
  };

  const attRecords = (attendanceRecords || []).map((r: any) => ({
    subject: r.classid || "Aula",
    date: r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '',
    status: r.status ?? "presente",
  }));

  const attTotal = attRecords.length;
  const attPresent = attRecords.filter((r: any) => r.status === "presente").length;
  const studentAttendanceRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  const renderContent = () => {
    switch (activeItem) {
      case "home": return <StudentHome student={studentData} grades={(grades || []) as any} payments={(payments || []) as any} notices={(notices || []) as any} attendanceRate={studentAttendanceRate} onNavigate={setActiveItem} />;
      case "grades": return <StudentGrades grades={(grades || []) as any} />;
      case "financial": return <StudentFinancial payments={(payments || []) as any} />;
      case "attendance": return <StudentAttendance records={attRecords} />;
      case "materials": return <StudentMaterials materials={(materials || []) as any} />;
      case "documents": return <StudentDocuments />;
      case "notices": return <StudentNotices notices={(notices || []) as any} />;
      case "calendar": return <StudentCalendar financial={(payments || []) as any} attendance={(attendanceRecords || []) as any} />;
      case "idcard": return <StudentIDCard student={studentData} />;
      case "chat": return <div className="p-4 max-w-2xl mx-auto"><AdminChat /></div>;
      default: return <StudentHome student={studentData} grades={(grades || []) as any} payments={(payments || []) as any} notices={(notices || []) as any} attendanceRate={studentAttendanceRate} onNavigate={setActiveItem} />;

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
