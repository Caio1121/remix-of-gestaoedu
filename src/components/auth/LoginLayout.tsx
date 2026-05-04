import { GraduationCap } from "lucide-react";
import heroSchool from "@/assets/hero-school.jpg";

export const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroSchool} alt="EduManager" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">EduManager</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">Sistema de Gestão Escolar</p>
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1]">
              Transformando a <span className="text-accent-light">Educação</span> com Tecnologia
            </h1>
            <p className="text-primary-foreground/75 text-lg leading-relaxed">
              Plataforma completa para alunos, docentes e gestores. Acesse tudo em um só lugar, de qualquer dispositivo.
            </p>
          </div>
          <div className="text-primary-foreground/50 text-xs">
            © 2025 EduManager · Versão 2.0 · Todos os direitos reservados
          </div>
        </div>
      </div>
      
      {/* Right panel — children */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        {children}
      </div>
    </div>
  );
};
