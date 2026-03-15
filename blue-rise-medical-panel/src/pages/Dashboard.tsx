import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/services/api";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { Calendar, Clock, LogOut, Download, Activity, Loader2, Users, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// mock
type Consulta = {
  id: string;
  name: string;
  time: string;
  status: "Confirmado" | "Pendente" | "Cancelado";
};

type Paciente = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
};

// mock
const fetchConsultas = async (): Promise<Consulta[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    { id: "1", name: "Ana Beatriz Machado", time: "09:00", status: "Confirmado" },
    { id: "2", name: "Carlos Eduardo Santos", time: "10:30", status: "Pendente" },
    { id: "3", name: "Roberto Alves", time: "11:00", status: "Cancelado" },
    { id: "4", name: "Mariana Costa", time: "14:00", status: "Confirmado" },
  ];
};

const fetchPacientes = async (): Promise<Paciente[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    { id: "1", name: "Ana Beatriz Machado", email: "ana.beatriz@email.com", phone: "(11) 98765-4321", lastVisit: "10/03/2026" },
    { id: "2", name: "Carlos Eduardo Santos", email: "carlos.ed@email.com", phone: "(11) 91234-5678", lastVisit: "12/03/2026" },
    { id: "3", name: "Roberto Alves", email: "roberto.alves@email.com", phone: "(11) 99988-7766", lastVisit: "05/02/2026" },
    { id: "4", name: "Mariana Costa", email: "mari.costa@email.com", phone: "(11) 97766-5544", lastVisit: "15/03/2026" },
  ];
};

export function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Doutor(a)";

  const [activeTab, setActiveTab] = useState<"consultas" | "pacientes">("consultas");

  const { data: consultas, isLoading: loadingConsultas } = useQuery({
    queryKey: ["consultas-list"],
    queryFn: fetchConsultas,
    staleTime: 1000 * 60 * 5,
  });

  const { data: pacientes, isLoading: loadingPacientes } = useQuery({
    queryKey: ["pacientes-list"],
    queryFn: fetchPacientes,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem("accessToken") },
    });

    socket.on("nova_consulta", (mensagem) => {
      toast(mensagem, { icon: <Calendar className="w-4 h-4 text-blue-500" /> });
    });

    const interval = setInterval(() => {
      toast("Nova consulta agendada!", {
        description: "Um novo horário foi adicionado à sua agenda.",
        icon: <Calendar className="w-4 h-4 text-blue-500" />,
      });
    }, 20000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try { await api.post("/api/auth/logout"); } 
    catch (error) { console.error("Erro no logout", error); } 
    finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userName");
      navigate("/login");
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);

    if (activeTab === "consultas" && consultas) {
      doc.text("Agenda de Consultas", 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [["Paciente", "Horário", "Estado"]],
        body: consultas.map((c) => [c.name, c.time, c.status]),
        theme: "plain",
        headStyles: { textColor: [100, 116, 139], fontStyle: "bold" },
      });
      doc.save("consultas.pdf");
      toast.success("Lista de consultas exportada!");
    } else if (activeTab === "pacientes" && pacientes) {
      doc.text("Diretório de Pacientes", 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [["Nome", "E-mail", "Telefone", "Última Visita"]],
        body: pacientes.map((p) => [p.name, p.email, p.phone, p.lastVisit]),
        theme: "plain",
        headStyles: { textColor: [100, 116, 139], fontStyle: "bold" },
      });
      doc.save("pacientes.pdf");
      toast.success("Diretório de pacientes exportado!");
    }
  };

  const isLoading = activeTab === "consultas" ? loadingConsultas : loadingPacientes;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Olá, {userName}</h1>
              <p className="text-sm text-slate-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={exportToPDF} className="group flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.04)] transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 cursor-pointer">
              <Download className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              Exportar para PDF
            </button>
            <button onClick={handleLogout} className="group flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_14px_0_rgb(15,23,42,0.2)] transition-all hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] active:scale-95 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4 opacity-70" />
              Sair
            </button>
          </div>
        </header>

        <div className="mb-8 inline-flex rounded-2xl bg-white p-1.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100">
          <button
            onClick={() => setActiveTab("consultas")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all cursor-pointer",
              activeTab === "consultas" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Calendar className="h-4 w-4" />
            Consultas
          </button>
          <button
            onClick={() => setActiveTab("pacientes")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all cursor-pointer",
              activeTab === "pacientes" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Users className="h-4 w-4" />
            Pacientes
          </button>
        </div>

        <main>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-60">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="rounded-[2rem] bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="overflow-x-auto rounded-[1.5rem]">
                <table className="w-full text-left text-sm">

                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-5 font-medium text-slate-400">Paciente</th>
                      {activeTab === "consultas" ? (
                        <>
                          <th className="px-6 py-5 font-medium text-slate-400">Horário</th>
                          <th className="px-6 py-5 font-medium text-slate-400 text-right">Estado</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-5 font-medium text-slate-400">Contactos</th>
                          <th className="px-6 py-5 font-medium text-slate-400 text-right">Última Visita</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">

                    {activeTab === "consultas" && consultas?.map((consulta) => (
                      <tr key={consulta.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {consulta.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900">{consulta.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-slate-500">
                            <Clock className="mr-2 h-4 w-4 opacity-50" />
                            {consulta.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                            consulta.status === "Confirmado" && "bg-emerald-50 text-emerald-600",
                            consulta.status === "Pendente" && "bg-amber-50 text-amber-600",
                            consulta.status === "Cancelado" && "bg-slate-100 text-slate-500"
                          )}>
                            {consulta.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {activeTab === "pacientes" && pacientes?.map((paciente) => (
                      <tr key={paciente.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                              {paciente.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900">{paciente.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-slate-500">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 opacity-50" /> {paciente.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 opacity-50" /> {paciente.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-600">
                          {paciente.lastVisit}
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}