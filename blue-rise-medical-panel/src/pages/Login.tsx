import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: data.email,
        senha: data.password,
      });

      const { accessToken, refreshToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(
        error.response?.data?.error ||
          "Erro ao fazer login. Verifique suas credenciais.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Blue Rise</h1>
          <p className="text-slate-500 mt-2">
            Faça login para acessar o painel
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              placeholder="medico@bluerise.com"
              className={cn(
                "w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400",
                errors.email && "border-red-500 focus:ring-red-500",
              )}
              {...register("email")}
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              placeholder="******"
              className={cn(
                "w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400",
                errors.password && "border-red-500 focus:ring-red-500",
              )}
              {...register("password")}
            />
            {errors.password && (
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          Não tem uma conta?{" "}
          <Link to="/cadastro" className="font-medium text-slate-900 hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
