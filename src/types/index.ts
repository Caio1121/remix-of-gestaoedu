export type UserRole = "aluno" | "docente" | "gestor";
export const PASSING_GRADE = 7;

export interface Student {
  id: string;
  name: string;
  matricula: string;
  course: string;
  class: string;
  email: string;
  phone: string;
  avatarInitials: string;
  enrollmentDate: string;
}

export interface Grade {
  id: string;
  studentid: string;
  classid: string;
  gradevalue: number | null;
  feedback: string | null;
  updatedat: string;
  classes?: { name: string } | null;
  // Legacy fields for component compatibility
  subject?: string;
  teacher?: string;
  av1?: number | null;
  av2?: number | null;
  av3?: number | null;
  final?: number | null;
  status?: "aprovado" | "reprovado" | "cursando";
}

export interface Payment {
  id: string;
  studentid?: string;
  duedate: string;
  amount?: number;
  ispaid?: boolean;
  invoiceurl?: string | null;
  createdat?: string;
  // Legacy fields
  month?: string;
  dueDate?: string;
  value?: number;
  status?: "pago" | "pendente" | "atrasado";
  paidDate?: string;
}

export interface AttendanceRecord {
  id?: string;
  studentid?: string;
  classid?: string;
  date: string;
  ispresent?: boolean;
  status?: "presente" | "ausente" | "justificado";
  subject?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdat?: string;
  category?: string;
  priority?: string;
  targetrole?: string;
  authorid?: string;
  // Legacy
  date?: string;
}

export interface Material {
  id: string;
  title: string;
  classid?: string;
  description?: string;
  contenturl?: string;
  materialtype?: string;
  createdat?: string;
  // Legacy
  subject?: string;
  type?: "pdf" | "video" | "link" | "slide";
  uploadDate?: string;
  teacher?: string;
  size?: string;
}

export interface ClassStudent {
  id: string;
  name: string;
  matricula: string;
  av1: number | null;
  av2: number | null;
  av3: number | null;
  attendance: number;
}

export interface TeacherClass {
  id: string;
  name: string;
  period: string;
  teacherid?: string;
  createdat?: string;
  // Legacy optional fields
  subject?: string;
  schedule?: string;
  room?: string;
  students?: number;
}
