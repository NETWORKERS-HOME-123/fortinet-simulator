import {
  LayoutDashboard,
  Activity,
  Shield,
  Users,
  Lock,
  MonitorDot,
  Network,
  Globe,
  AppWindow,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const dashboardItems = [
  { title: "Status", url: "/", icon: LayoutDashboard },
  { title: "Network", url: "/network", icon: Activity },
  { title: "Security", url: "/security", icon: Shield },
  { title: "Users & Devices", url: "/users-devices", icon: Users },
  { title: "VPN", url: "/vpn", icon: Lock },
];

const monitorItems = [
  { title: "Sessions", url: "/monitors/sessions", icon: MonitorDot },
  { title: "Sources", url: "/monitors/sources", icon: Network },
  { title: "Destinations", url: "/monitors/destinations", icon: Globe },
  { title: "Applications", url: "/monitors/applications", icon: AppWindow },
  { title: "Threats", url: "/monitors/threats", icon: AlertTriangle },
  { title: "VPN Monitor", url: "/monitors/vpn", icon: Eye },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && (
            <span className="font-bold text-sm text-sidebar-primary-foreground tracking-wide">
              FortiGate
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>FortiView Monitors</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monitorItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
