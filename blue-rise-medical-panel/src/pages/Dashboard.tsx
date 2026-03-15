import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/services/api";
import { io } from "socket.io-client";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  FileDown,
  Activity,
  AlertCircle,
} from "lucide-react";

// mock
type Patient = {
  id: string;
  name: string;
  time: string;
  status: "Confirmado" | "Pendente" | "Cancelado";
};

// mock
const fetchPatients = async (): Promise<Patient[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // throw new Error("Falha ao conectar com o servidor da clínica.");

  return [
    {
      id: "1",
      name: "Ana Beatriz Machado",
      time: "09:00",
      status: "Confirmado",
    },
    {
      id: "2",
      name: "Carlos Eduardo Santos",
      time: "10:30",
      status: "Pendente",
    },
    { id: "3", name: "Roberto Alves", time: "11:00", status: "Cancelado" },
    { id: "4", name: "Mariana Costa", time: "14:00", status: "Confirmado" },
  ];
};

export function Dashboard() {
  const navigate = useNavigate();

  const {
    data: patients,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["patients-list"],
    queryFn: fetchPatients,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    socket.on("nova_consulta", (mensagem) => {
      toast.info(mensagem, {
        icon: <Calendar className="w-4 h-4" />,
      });
    });

    // mock a cada 15 seg (mantido)
    const interval = setInterval(() => {
      toast.info("Nova consulta agendada!", {
        icon: <Calendar className="w-4 h-4" />,
      });
    }, 15000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Erro no logout", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("Você saiu do sistema.");
      navigate("/login");
    }
  };

  const exportToPDF = () => {
    if (!patients || patients.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Agenda Médica", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

    const tableColumn = ["Paciente", "Horário", "Status"];
    const tableRows = patients.map((patient) => [
      patient.name,
      patient.time,
      patient.status,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save("lista_de_pacientes.pdf");
    toast.success("PDF gerado com sucesso!");
  };

  const renderStatus = (status: Patient["status"]) => {
    const statusConfig = {
      Confirmado: {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
      },
      Pendente: {
        color: "bg-amber-100 text-amber-700 border-amber-200",
        icon: <Clock className="w-3.5 h-3.5 mr-1" />,
      },
      Cancelado: {
        color: "bg-rose-100 text-rose-700 border-rose-200",
        icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Cabeçalho Moderno */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Painel de Consultas
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Gerencie sua agenda diária.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isLoading && !isError && patients && (
              <button
                onClick={exportToPDF}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
              </button>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <LogOut className="mr-2 h-4 w-4 text-slate-500" />
              Sair
            </button>
          </div>
        </div>

        {/* Estados */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600 mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">
              Carregando prontuários...
            </p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 py-16 text-center shadow-sm">
            <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
            <h3 className="font-bold text-lg text-rose-900">
              Falha na conexão
            </h3>
            <p className="text-rose-600 mt-1">
              {error instanceof Error ? error.message : "Erro desconhecido."}
            </p>
          </div>
        )}

        {/* Tabela Polida */}
        {!isLoading && !isError && patients && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-4 font-semibold tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-4 font-semibold tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {patient.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {patient.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-slate-400" />
                          {patient.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStatus(patient.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
