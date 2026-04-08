import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimulationProvider } from "@/simulation/simulationContext";
import { InstructorToolbar } from "@/components/InstructorToolbar";
import StatusDashboard from "./pages/StatusDashboard";
import NetworkDashboard from "./pages/NetworkDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import AssetsIdentitiesDashboard from "./pages/AssetsIdentitiesDashboard";
import WiFiDashboard from "./pages/WiFiDashboard";
import VpnDashboard from "./pages/VpnDashboard";
import RoutingMonitor from "./pages/network/RoutingMonitor";
import DhcpMonitor from "./pages/network/DhcpMonitor";
import IpsecMonitor from "./pages/network/IpsecMonitor";
import SessionsMonitor from "./pages/monitors/SessionsMonitor";
import SourcesMonitor from "./pages/monitors/SourcesMonitor";
import DestinationsMonitor from "./pages/monitors/DestinationsMonitor";
import ApplicationsMonitor from "./pages/monitors/ApplicationsMonitor";
import ThreatsMonitor from "./pages/monitors/ThreatsMonitor";
import VpnMonitor from "./pages/monitors/VpnMonitor";
import SslVpnMonitor from "./pages/monitors/SslVpnMonitor";
import TopWebsitesMonitor from "./pages/monitors/TopWebsitesMonitor";
import CloudApplicationsMonitor from "./pages/monitors/CloudApplicationsMonitor";
import FirewallObjectsMonitor from "./pages/monitors/FirewallObjectsMonitor";
import PolicyEditor from "./pages/config/PolicyEditor";
import InterfacesPage from "./pages/config/Interfaces";
import AddressesPage from "./pages/config/Addresses";
import LabCatalog from "./pages/training/LabCatalog";
import ProgressPage from "./pages/training/ProgressPage";
import ScenarioRunner from "./components/ScenarioRunner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SimulationProvider>
        <Toaster />
        <Sonner />
        <InstructorToolbar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StatusDashboard />} />
            <Route path="/network" element={<NetworkDashboard />} />
            <Route path="/network/routing" element={<RoutingMonitor />} />
            <Route path="/network/dhcp" element={<DhcpMonitor />} />
            <Route path="/network/ipsec" element={<IpsecMonitor />} />
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
            <Route path="/monitors/firewall-objects" element={<FirewallObjectsMonitor />} />
            <Route path="/monitors/top-websites" element={<TopWebsitesMonitor />} />
            <Route path="/monitors/cloud-apps" element={<CloudApplicationsMonitor />} />
            <Route path="/config/policies" element={<PolicyEditor />} />
            <Route path="/config/interfaces" element={<InterfacesPage />} />
            <Route path="/config/addresses" element={<AddressesPage />} />
            <Route path="/training" element={<LabCatalog />} />
            <Route path="/training/progress" element={<ProgressPage />} />
            <Route path="/training/lab/:labId" element={<ScenarioRunner />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
