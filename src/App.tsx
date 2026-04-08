import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import StatusDashboard from "./pages/StatusDashboard";
import NetworkDashboard from "./pages/NetworkDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import AssetsIdentitiesDashboard from "./pages/AssetsIdentitiesDashboard";
import WiFiDashboard from "./pages/WiFiDashboard";
import VpnDashboard from "./pages/VpnDashboard";
import SessionsMonitor from "./pages/monitors/SessionsMonitor";
import SourcesMonitor from "./pages/monitors/SourcesMonitor";
import DestinationsMonitor from "./pages/monitors/DestinationsMonitor";
import ApplicationsMonitor from "./pages/monitors/ApplicationsMonitor";
import ThreatsMonitor from "./pages/monitors/ThreatsMonitor";
import VpnMonitor from "./pages/monitors/VpnMonitor";
import SslVpnMonitor from "./pages/monitors/SslVpnMonitor";
import TopWebsitesMonitor from "./pages/monitors/TopWebsitesMonitor";
import CloudApplicationsMonitor from "./pages/monitors/CloudApplicationsMonitor";
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
          <Route path="/network/ssl-vpn" element={<SslVpnMonitor />} />
          <Route path="/security" element={<SecurityDashboard />} />
          <Route path="/assets-identities" element={<AssetsIdentitiesDashboard />} />
          <Route path="/wifi" element={<WiFiDashboard />} />
          <Route path="/vpn" element={<VpnDashboard />} />
          <Route path="/monitors/sessions" element={<SessionsMonitor />} />
          <Route path="/monitors/sources" element={<SourcesMonitor />} />
          <Route path="/monitors/destinations" element={<DestinationsMonitor />} />
          <Route path="/monitors/applications" element={<ApplicationsMonitor />} />
          <Route path="/monitors/threats" element={<ThreatsMonitor />} />
          <Route path="/monitors/vpn" element={<VpnMonitor />} />
          <Route path="/monitors/top-websites" element={<TopWebsitesMonitor />} />
          <Route path="/monitors/cloud-apps" element={<CloudApplicationsMonitor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
