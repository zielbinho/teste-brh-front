import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Activity, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  email: z.string().min(1, "O e-mail é obrigatório").regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Introduza um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/register", {
        nome: data.name,
        email: data.email,
        senha: data.password,
      });
      toast.success("Conta criada com sucesso! Inicie sessão para continuar.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans text-slate-900">
      <div className="hidden lg:relative lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-slate-900 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-slate-800 to-slate-900 opacity-90"></div>
        <div className="relative z-10 flex max-w-lg flex-col items-center text-center text-white">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-2xl">
            <Activity className="h-10 w-10" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Junte-se à equipe
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam molestie est in massa scelerisque, eu luctus urna tristique.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 text-left w-full">
            <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-sm">
              <Stethoscope className="h-8 w-8 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-white">Lorem ipsum</h3>
                <p className="text-xs text-slate-400">Lorem ipsum dolor sit amet.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-sm">
              <Users className="h-8 w-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Lorem ipsum</h3>
                <p className="text-xs text-slate-400">Lorem ipsum dolor sit amet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          
          <div className="mb-10 flex flex-col items-start lg:mb-12">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white lg:hidden">
              <Activity className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Criar Conta</h1>
            <p className="mt-2 text-base text-slate-500">
              Preencha os seus dados para obter acesso à plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
              <input
                type="text"
                placeholder="Dr. João Silva"
                className={cn(
                  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10",
                  errors.name && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10"
                )}
                {...register("name")}
              />
              {errors.name && <span className="pl-1 text-xs font-medium text-red-500">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">E-mail</label>
              <input
                type="email"
                placeholder="medico@bluerise.com"
                className={cn(
                  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10",
                  errors.email && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10"
                )}
                {...register("email")}
              />
              {errors.email && <span className="pl-1 text-xs font-medium text-red-500">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10",
                  errors.password && "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10"
                )}
                {...register("password")}
              />
              {errors.password && <span className="pl-1 text-xs font-medium text-red-500">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer shadow-[0_4px_14px_0_rgb(15,23,42,0.2)]"
            >
              {isLoading ? "A cadastrar..." : "Cadastrar"}
            </button>
          </form>

          <div className="mt-10 text-center text-sm text-slate-500">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-bold text-slate-900 transition-colors hover:text-blue-600">
              Iniciar sessão
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}