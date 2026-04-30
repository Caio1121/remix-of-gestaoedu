import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ManagerKPI {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    attendanceRate: number;
    approvalRate: number;
    revenueMonth: number;
    revenueDefault: number;
    absenteeismRate: number;
}

// 1. Perfil e Usuarios
export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) throw error;
            return data;
        },
    });
};

export const useAllStudents = () => {
    return useQuery({
        queryKey: ["all-students"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "aluno")
                .order("full_name");
            if (error) throw error;
            return data;
        },
    });
};

export const useAllTeachers = () => {
    return useQuery({
        queryKey: ["all-teachers"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "docente")
                .order("full_name");
            if (error) throw error;
            return data;
        },
    });
};

// 2. Dashboard do Gestor (Real Data)
export const useManagerData = () => {
    return useQuery<ManagerKPI>({
        queryKey: ["manager-data"],
        queryFn: async () => {
            const { count: studentsCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("role", "aluno");
            const { count: teachersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true }).eq("role", "docente");
            const { count: classesCount } = await supabase.from("classes").select("*", { count: 'exact', head: true });

            const { data: attData } = await supabase.from("attendance").select("is_present");
            const attRate = attData && attData.length > 0
                ? (attData.filter(a => a.is_present).length / attData.length) * 100
                : 0;

            const { data: gradeData } = await supabase.from("grades").select("grade_value");
            const appRate = gradeData && gradeData.length > 0
                ? (gradeData.filter(g => Number(g.grade_value || 0) >= 7).length / gradeData.length) * 100
                : 0;

            let revMonth = 0;
            let revDefault = 0;

            try {
                const { data: finData } = await supabase.from("financial_records").select("amount, is_paid");
                if (finData && finData.length > 0) {
                    revMonth = finData.filter(f => f.is_paid).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
                    revDefault = (finData.filter(f => !f.is_paid).length / finData.length) * 100;
                }
            } catch (e) {
                console.warn("Erro ao buscar dados financeiros reais:", e);
            }

            return {
                totalStudents: studentsCount || 0,
                totalTeachers: teachersCount || 0,
                totalClasses: classesCount || 0,
                attendanceRate: Math.round(attRate),
                approvalRate: Math.round(appRate),
                revenueMonth: revMonth,
                revenueDefault: Number(revDefault.toFixed(1)),
                absenteeismRate: Math.round(100 - attRate)
            };
        },
    });
};

export const useRevenueData = () => {
    return useQuery({
        queryKey: ["revenue-chart"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("financial_records")
                .select("amount, is_paid, due_date");

            if (error) return [];

            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

            // Group by year-month dynamically
            const grouped: Record<string, { receita: number; inadimplencia: number; sortKey: string }> = {};
            (data || []).forEach(f => {
                const d = new Date(f.due_date);
                const monthIdx = d.getMonth();
                const year = d.getFullYear();
                const key = `${year}-${String(monthIdx).padStart(2, '0')}`;
                const label = `${monthNames[monthIdx]}/${year}`;
                if (!grouped[key]) {
                    grouped[key] = { receita: 0, inadimplencia: 0, sortKey: key };
                }
                if (f.is_paid) {
                    grouped[key].receita += Number(f.amount || 0);
                } else {
                    grouped[key].inadimplencia += Number(f.amount || 0);
                }
            });

            return Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, val]) => {
                    const [year, month] = key.split('-');
                    return {
                        month: `${monthNames[Number(month)]}`,
                        receita: val.receita,
                        inadimplencia: val.inadimplencia
                    };
                });
        }
    });
};

export const useCoursePerformance = () => {
    return useQuery({
        queryKey: ["course-performance"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("grades")
                .select(`
                    grade_value, av1, av2, av3,
                    student_id,
                    classes ( name )
                `);

            if (error) return [];

            const groupedByClass: Record<string, { sum: number, count: number, students: Set<string> }> = {};

            (data as any[])?.forEach(g => {
                const className = g.classes?.name || "Geral";
                if (!groupedByClass[className]) {
                    groupedByClass[className] = { sum: 0, count: 0, students: new Set() };
                }
                const avgs = [g.av1, g.av2, g.av3].filter(v => v != null);
                const gradeVal = Number(g.grade_value) || (avgs.length > 0 ? avgs.reduce((s: number, v: any) => s + Number(v), 0) / avgs.length : 0);
                groupedByClass[className].sum += gradeVal;
                groupedByClass[className].count += 1;
                groupedByClass[className].students.add(g.student_id);
            });

            return Object.entries(groupedByClass).map(([name, data]) => ({
                course: name,
                avg: Number((data.sum / data.count).toFixed(1)),
                students: data.students.size
            }));
        }
    });
};

// 3. Turmas e Alunos (Professor)
export const useTeacherClasses = (teacherId?: string) => {
    return useQuery({
        queryKey: ["teacher-classes", teacherId],
        queryFn: async () => {
            if (!teacherId) return [];
            const { data, error } = await supabase
                .from("classes")
                .select("*")
                .eq("teacher_id", teacherId);
            if (error) throw error;
            return data;
        },
        enabled: !!teacherId
    });
};

export const useClassStudents = (classId?: string) => {
    return useQuery({
        queryKey: ["class-students", classId],
        queryFn: async () => {
            if (!classId) return [];

            const { data: enrolls, error: enrollError } = await supabase
                .from("enrollments")
                .select(`
                    student_id,
                    profiles (
                        id,
                        full_name,
                        student_card_id
                    )
                `)
                .eq("class_id", classId);

            if (enrollError) throw enrollError;

            const { data: grades, error: gradesError } = await supabase
                .from("grades")
                .select("*")
                .eq("class_id", classId);

            if (gradesError) throw gradesError;

            const { data: attendance, error: attError } = await supabase
                .from("attendance")
                .select("*")
                .eq("class_id", classId);

            if (attError) throw attError;

            return enrolls.map((d: any) => {
                const studentId = d.profiles.id;
                const studentGrades = grades.filter(g => g.student_id === studentId);
                const sg = studentGrades[0];
                const mainGrade = sg?.grade_value != null ? Number(sg.grade_value) : null;
                const av2Val: number | null = null;
                const av3Val: number | null = null;

                const studentAtts = attendance.filter(a => a.student_id === studentId);
                const presencePct = studentAtts.length > 0
                    ? (studentAtts.filter(a => a.is_present).length / studentAtts.length) * 100
                    : 100;

                return {
                    id: studentId,
                    name: d.profiles.full_name,
                    matricula: d.profiles.student_card_id || "S/M",
                    av1: mainGrade,
                    av2: av2Val,
                    av3: av3Val,
                    attendance: Math.round(presencePct)
                };
            });
        },
        enabled: !!classId
    });
};

// 4. Academico e Financeiro (Estudante)
export const useGrades = (studentId?: string) => {
    return useQuery({
        queryKey: ["student-grades", studentId],
        queryFn: async () => {
            if (!studentId) return [];
            const { data, error } = await supabase
                .from("grades")
                .select(`
                    *,
                    classes ( name )
                `)
                .eq("student_id", studentId);
            if (error) throw error;
            return data;
        },
        enabled: !!studentId
    });
};

export const useFinancial = (studentId?: string) => {
    return useQuery({
        queryKey: ["student-financial", studentId],
        queryFn: async () => {
            if (!studentId) return [];
            const { data, error } = await supabase
                .from("financial_records")
                .select("*")
                .eq("student_id", studentId)
                .order("due_date", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!studentId
    });
};

export const useAttendance = (studentId?: string) => {
    return useQuery({
        queryKey: ["student-attendance", studentId],
        queryFn: async () => {
            if (!studentId) return [];
            const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .eq("student_id", studentId)
                .order("date", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!studentId
    });
};

export const useMaterials = (classId?: string) => {
    return useQuery({
        queryKey: ["materials", classId],
        queryFn: async () => {
            if (!classId) return [];
            const { data, error } = await supabase
                .from("materials")
                .select("*")
                .eq("class_id", classId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!classId
    });
};

// 5. Chat e Comunicacao (Realtime)
export const useChatMessages = (receiverId: string) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!receiverId) return;

        const channel = supabase
            .channel(`chat-${receiverId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
            }, (payload: any) => {
                const msg = payload.new;
                // Only invalidate if this message is part of our conversation
                if (msg.sender_id === receiverId || msg.receiver_id === receiverId) {
                    queryClient.invalidateQueries({ queryKey: ["chat", receiverId] });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [receiverId, queryClient]);

    return useQuery({
        queryKey: ["chat", receiverId],
        queryFn: async () => {
            if (!receiverId) return [];
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from("chat_messages")
                .select("*")
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!receiverId,
        refetchInterval: 5000, // Polling fallback every 5s
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (message: { receiver_id: string, content: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { data, error } = await supabase
                .from("chat_messages")
                .insert([{
                    sender_id: user.id,
                    receiver_id: message.receiver_id,
                    content: message.content
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["chat", variables.receiver_id] });
        }
    });
};

export const useAnnouncements = (role?: string) => {
    return useQuery({
        queryKey: ["announcements", role],
        queryFn: async () => {
            let query = supabase
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false });

            if (role) {
                query = query.or(`target_role.eq.${role},target_role.eq.todos`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
};

export const useCreateAnnouncement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (announcement: {
            title: string;
            content: string;
            category: string;
            priority: string;
            target_role: string;
        }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Nao autenticado");

            const { data, error } = await supabase
                .from("announcements")
                .insert([{ ...announcement, author_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["announcements"] });
        },
    });
};

// 6. Criacao e Gestao
export const useCreateClass = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newClass: { name: string; period: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Não autenticado");

            const { data, error } = await supabase
                .from("classes")
                .insert([{
                    name: newClass.name,
                    period: newClass.period,
                    teacher_id: user.id
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacher-classes"] });
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: { email: string; full_name: string; role: string }) => {
            const { data, error } = await supabase.auth.signUp({
                email: user.email,
                password: 'EduFlowTemp123!',
                options: {
                    data: {
                        full_name: user.full_name,
                        role: user.role
                    }
                }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manager-data"] });
            queryClient.invalidateQueries({ queryKey: ["all-students"] });
            queryClient.invalidateQueries({ queryKey: ["all-teachers"] });
        },
    });
};

export const useUploadMaterial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (material: {
            class_id: string;
            title: string;
            description: string;
            material_type: string;
            content_url: string;
        }) => {
            const { data, error } = await supabase
                .from("materials")
                .insert([material])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["materials", variables.class_id] });
        }
    });
};

export const useGeneratePayment = () => {
    return useMutation({
        mutationFn: async (data: { amount: number; description: string; studentProfile: any }) => {
            const { data: { session } } = await supabase.auth.getSession();
            const { data: result, error } = await supabase.functions.invoke('create-asaas-charge', {
                body: {
                    amount: data.amount,
                    description: data.description,
                    studentId: data.studentProfile.id,
                    studentEmail: session?.user?.email,
                    studentName: data.studentProfile.full_name,
                    studentCpf: '000.000.000-00'
                }
            });

            if (error) throw error;
            if (result.error) throw new Error(result.error);

            return {
                pixCode: result.invoiceUrl,
                pix_qr_code: result.pixCode || '',
                pix_image_url: result.pixImage || '',
                billingType: result.billingType,
                invoiceUrl: result.invoiceUrl,
                boleto_url: result.bankSlipUrl || result.invoiceUrl
            };
        },
    });
};
