import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import PacientesPage from "@/pages/pacientes/index";
import NuevoPacientePage from "@/pages/pacientes/nuevo";
import PacienteDetailPage from "@/pages/pacientes/[id]";
import CitasPage from "@/pages/citas/index";
import NuevaCitaPage from "@/pages/citas/nueva";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
      staleTime: 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/pacientes" component={PacientesPage} />
      <Route path="/pacientes/nuevo" component={NuevoPacientePage} />
      <Route path="/pacientes/:id" component={PacienteDetailPage} />
      <Route path="/citas" component={CitasPage} />
      <Route path="/citas/nueva" component={NuevaCitaPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
