import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "@/services/api";
import { io } from "socket.io-client";

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
  const [notification, setNotification] = useState<string | null>(null);

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
      setNotification(mensagem);
      setTimeout(() => setNotification(null), 5000);
    });

    // mock a cada 15 seg
    const interval = setInterval(() => {
      setNotification("Nova consulta agendada!");
      setTimeout(() => setNotification(null), 5000);
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
      console.error("Erro ao deslogar na API", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  const exportToPDF = () => {
    if (!patients || patients.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Consultas - Blue Rise", 14, 22);

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
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save("lista_de_pacientes.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* notification mock real-time */}
      {notification && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-lg bg-slate-900 px-6 py-4 text-white shadow-xl animate-bounce">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <p className="font-medium">{notification}</p>
        </div>
      )}
      <div className="mx-auto max-w-4xl">
        {/* Cabeçalho Atualizado com o novo botão */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Painel de Consultas
            </h1>
            <p className="text-slate-500">
              Bem-vindo, Doutor(a). Aqui está sua agenda de hoje.
            </p>
          </div>
          <div className="flex gap-4">
            {!isLoading && !isError && patients && (
              <button
                onClick={exportToPDF}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                Exportar para PDF
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
            >
              Sair
            </button>
          </div>
        </div>

        {/*query states */}

        {/* loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mb-4"></div>
            <p className="text-slate-500 font-medium">Buscando pacientes...</p>
          </div>
        )}

        {/* error */}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 shadow-sm">
            <h3 className="font-bold text-lg mb-1">
              Ops! Ocorreu um problema.
            </h3>
            <p>
              {error instanceof Error ? error.message : "Erro desconhecido."}
            </p>
          </div>
        )}

        {/* sucess */}
        {!isLoading && !isError && patients && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 uppercase text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Paciente</th>
                  <th className="px-6 py-4 font-semibold">Horário</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4">{patient.time}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          patient.status === "Confirmado"
                            ? "bg-emerald-100 text-emerald-700"
                            : patient.status === "Pendente"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
