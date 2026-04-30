export type UserRole = "aluno" | "docente" | "gestor";

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
  student_id: string;
  class_id: string;
  grade_value: number | null;
  feedback: string | null;
  updated_at: string;
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
  student_id?: string;
  due_date: string;
  amount?: number;
  is_paid?: boolean;
  invoice_url?: string | null;
  created_at?: string;
  // Legacy fields
  month?: string;
  dueDate?: string;
  value?: number;
  status?: "pago" | "pendente" | "atrasado";
  paidDate?: string;
}

export interface AttendanceRecord {
  id?: string;
  student_id?: string;
  class_id?: string;
  date: string;
  is_present?: boolean;
  status?: "presente" | "ausente" | "justificado";
  subject?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  category?: string;
  priority?: string;
  target_role?: string;
  author_id?: string;
  // Legacy
  date?: string;
}

export interface Material {
  id: string;
  title: string;
  class_id?: string;
  description?: string;
  content_url?: string;
  material_type?: string;
  created_at?: string;
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
  teacher_id?: string;
  created_at?: string;
  // Legacy optional fields
  subject?: string;
  schedule?: string;
  room?: string;
  students?: number;
}
