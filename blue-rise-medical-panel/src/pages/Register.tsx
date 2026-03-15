import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "O nome é obrigatório"),
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await api.post("/api/auth/register", {
        nome: data.name,
        email: data.email,
        senha: data.password,
      });

      alert("Conta criada com sucesso! Faça login para continuar.");
      navigate("/login");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      setErrorMessage(
        error.response?.data?.error ||
          "Erro ao criar conta. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Criar Conta</h1>
          <p className="text-slate-500 mt-2">
            Cadastre-se para acessar o painel
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Dr. João Silva"
              className={cn(
                "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400",
                errors.name && "border-red-500 focus:ring-red-500",
              )}
              {...register("name")}
            />
            {errors.name && (
              <span className="text-xs text-red-500">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              placeholder="medico@bluerise.com"
              className={cn(
                "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400",
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              placeholder="******"
              className={cn(
                "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400",
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
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white font-medium mt-6 hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Cadastrando..." : "Criar Conta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-medium text-slate-900 hover:underline"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
