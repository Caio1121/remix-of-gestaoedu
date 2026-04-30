import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import MfaSetup from "./pages/MfaSetup";
import MfaChallenge from "./pages/MfaChallenge";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/aluno/*" element={<StudentDashboard />} />
          <Route path="/docente/*" element={<TeacherDashboard />} />
          <Route path="/gestor/*" element={<ManagerDashboard />} />
          <Route path="/mfa-setup" element={<MfaSetup />} />
          <Route path="/mfa-challenge" element={<MfaChallenge />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
