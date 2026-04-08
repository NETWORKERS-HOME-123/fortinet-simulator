import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, User, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationPopover } from "@/components/widgets/NotificationPopover";
import { DarkModeToggle } from "@/components/widgets/DarkModeToggle";
import { CLITerminal } from "@/components/CLITerminal";
import { useSimulation } from "@/simulation/simulationContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [cliOpen, setCliOpen] = useState(false);
  const { state } = useSimulation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-base font-semibold text-foreground">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden lg:flex text-[10px] font-mono gap-1">
                {state.systemInfo.hostname} <span className="text-muted-foreground">v7.6.0</span>
              </Badge>
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 w-56 h-9 text-sm" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCliOpen(!cliOpen)} title="CLI Console">
                <Terminal className="h-4 w-4" />
              </Button>
              <NotificationPopover />
              <DarkModeToggle />
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <CLITerminal isOpen={cliOpen} onClose={() => setCliOpen(false)} />
    </SidebarProvider>
  );
}
