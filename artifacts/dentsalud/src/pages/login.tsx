import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Stethoscope, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthLoading, isAuthenticated, setLocation]);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("dentsalud_token", data.token);
        setLocation("/dashboard");
      },
      onError: (err: unknown) => {
        const msg = (err as { data?: { error?: string } })?.data?.error ?? "Credenciales incorrectas";
        toast({ title: "Error al iniciar sesión", description: msg, variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-accent via-background to-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
          <div className="h-1.5 bg-gradient-to-r from-brand to-primary" aria-hidden="true" />
          <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/25 to-brand/10 mb-4" aria-hidden="true">
              <Stethoscope className="h-8 w-8 text-primary" aria-hidden="true" focusable="false" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              <span className="text-brand">Dent</span><span className="text-primary">Salud</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Tu Centro de Armonía Dentofacial</p>
            <p className="text-xs text-gray-400 mt-2">Sistema de Gestión Odontológica</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="Correo"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Iniciando sesión...
                </span>
              ) : "Iniciar Sesión"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Centro DentSalud — Trujillo, Perú
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
