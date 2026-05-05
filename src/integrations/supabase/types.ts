export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          authorid: string | null
          category: string | null
          content: string
          createdat: string
          id: string
          priority: string | null
          targetrole: string
          title: string
        }
        Insert: {
          authorid?: string | null
          category?: string | null
          content: string
          createdat?: string
          id?: string
          priority?: string | null
          targetrole: string
          title: string
        }
        Update: {
          authorid?: string | null
          category?: string | null
          content?: string
          createdat?: string
          id?: string
          priority?: string | null
          targetrole?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_authorid_fkey"
            columns: ["authorid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          classid: string | null
          date: string | null
          id: string
          ispresent: boolean | null
          justificationdescription: string | null
          justificationfileurl: string | null
          status: string | null
          studentid: string | null
        }
        Insert: {
          classid?: string | null
          date?: string | null
          id?: string
          ispresent?: boolean | null
          justificationdescription?: string | null
          justificationfileurl?: string | null
          status?: string | null
          studentid?: string | null
        }
        Update: {
          classid?: string | null
          date?: string | null
          id?: string
          ispresent?: boolean | null
          justificationdescription?: string | null
          justificationfileurl?: string | null
          status?: string | null
          studentid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_classid_fkey"
            columns: ["classid"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_studentid_fkey"
            columns: ["studentid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          createdat: string
          id: string
          receiverid: string | null
          senderid: string | null
        }
        Insert: {
          content: string
          createdat?: string
          id?: string
          receiverid?: string | null
          senderid?: string | null
        }
        Update: {
          content?: string
          createdat?: string
          id?: string
          receiverid?: string | null
          senderid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiverid_fkey"
            columns: ["receiverid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_senderid_fkey"
            columns: ["senderid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          createdat: string | null
          id: string
          name: string
          period: string
          teacherid: string | null
        }
        Insert: {
          createdat?: string | null
          id?: string
          name: string
          period: string
          teacherid?: string | null
        }
        Update: {
          createdat?: string | null
          id?: string
          name?: string
          period?: string
          teacherid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacherid_fkey"
            columns: ["teacherid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          classid: string | null
          enrolledat: string | null
          id: string
          studentid: string | null
        }
        Insert: {
          classid?: string | null
          enrolledat?: string | null
          id?: string
          studentid?: string | null
        }
        Update: {
          classid?: string | null
          enrolledat?: string | null
          id?: string
          studentid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_classid_fkey"
            columns: ["classid"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_studentid_fkey"
            columns: ["studentid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financialrecords: {
        Row: {
          amount: number | null
          createdat: string | null
          duedate: string
          id: string
          invoiceurl: string | null
          ispaid: boolean | null
          studentid: string | null
        }
        Insert: {
          amount?: number | null
          createdat?: string | null
          duedate: string
          id?: string
          invoiceurl?: string | null
          ispaid?: boolean | null
          studentid?: string | null
        }
        Update: {
          amount?: number | null
          createdat?: string | null
          duedate?: string
          id?: string
          invoiceurl?: string | null
          ispaid?: boolean | null
          studentid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financialrecords_studentid_fkey"
            columns: ["studentid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          classid: string | null
          feedback: string | null
          gradevalue: number | null
          id: string
          studentid: string | null
          updatedat: string | null
        }
        Insert: {
          classid?: string | null
          feedback?: string | null
          gradevalue?: number | null
          id?: string
          studentid?: string | null
          updatedat?: string | null
        }
        Update: {
          classid?: string | null
          feedback?: string | null
          gradevalue?: number | null
          id?: string
          studentid?: string | null
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_classid_fkey"
            columns: ["classid"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_studentid_fkey"
            columns: ["studentid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          classid: string | null
          contenturl: string | null
          createdat: string | null
          description: string | null
          id: string
          materialtype: string | null
          title: string
        }
        Insert: {
          classid?: string | null
          contenturl?: string | null
          createdat?: string | null
          description?: string | null
          id?: string
          materialtype?: string | null
          title: string
        }
        Update: {
          classid?: string | null
          contenturl?: string | null
          createdat?: string | null
          description?: string | null
          id?: string
          materialtype?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_classid_fkey"
            columns: ["classid"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          createdat: string
          fullname: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          studentcardid: string | null
        }
        Insert: {
          createdat?: string
          fullname?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          studentcardid?: string | null
        }
        Update: {
          createdat?: string
          fullname?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          studentcardid?: string | null
        }
        Relationships: []
      }
      student_documents: {
        Row: {
          createdat: string
          doctype: string
          filesize: string | null
          fileurl: string | null
          id: string
          name: string
          status: string
          studentid: string
        }
        Insert: {
          createdat?: string
          doctype?: string
          filesize?: string | null
          fileurl?: string | null
          id?: string
          name: string
          status?: string
          studentid: string
        }
        Update: {
          createdat?: string
          doctype?: string
          filesize?: string | null
          fileurl?: string | null
          id?: string
          name?: string
          status?: string
          studentid?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_studentid_fkey"
            columns: ["studentid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "aluno" | "docente" | "gestor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["aluno", "docente", "gestor"],
    },
  },
} as const
