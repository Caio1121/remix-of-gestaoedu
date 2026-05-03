import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ykxoaczhixngtoopzsuo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlreG9hY3poaXhuZ3Rvb3B6c3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc2OTYsImV4cCI6MjA4ODI5MzY5Nn0.9VndFM05bCe-K1ZkuBT2Qfv1ENGHgF8SiSPTm0Ju9ys";

console.log("Supabase Client: Conectando a", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});