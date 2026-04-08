import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import StatusDashboard from "./pages/StatusDashboard";
import NetworkDashboard from "./pages/NetworkDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import UsersDevicesDashboard from "./pages/UsersDevicesDashboard";
import VpnDashboard from "./pages/VpnDashboard";
import SessionsMonitor from "./pages/monitors/SessionsMonitor";
import SourcesMonitor from "./pages/monitors/SourcesMonitor";
import DestinationsMonitor from "./pages/monitors/DestinationsMonitor";
import ApplicationsMonitor from "./pages/monitors/ApplicationsMonitor";
import ThreatsMonitor from "./pages/monitors/ThreatsMonitor";
import VpnMonitor from "./pages/monitors/VpnMonitor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StatusDashboard />} />
          <Route path="/network" element={<NetworkDashboard />} />
          <Route path="/security" element={<SecurityDashboard />} />
          <Route path="/users-devices" element={<UsersDevicesDashboard />} />
          <Route path="/vpn" element={<VpnDashboard />} />
          <Route path="/monitors/sessions" element={<SessionsMonitor />} />
          <Route path="/monitors/sources" element={<SourcesMonitor />} />
          <Route path="/monitors/destinations" element={<DestinationsMonitor />} />
          <Route path="/monitors/applications" element={<ApplicationsMonitor />} />
          <Route path="/monitors/threats" element={<ThreatsMonitor />} />
          <Route path="/monitors/vpn" element={<VpnMonitor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
