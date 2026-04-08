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
  Wifi,
  ChevronDown,
  Cloud,
  Target,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const dashboardItems = [
  { title: "Status", url: "/", icon: LayoutDashboard },
  { title: "Security", url: "/security", icon: Shield },
  {
    title: "Network",
    url: "/network",
    icon: Activity,
    children: [
      { title: "Overview", url: "/network" },
      { title: "Routing Monitor", url: "/network/routing" },
      { title: "DHCP Monitor", url: "/network/dhcp" },
      { title: "IPsec Monitor", url: "/network/ipsec" },
    ],
  },
  { title: "Assets & Identities", url: "/assets-identities", icon: Users },
  { title: "WiFi", url: "/wifi", icon: Wifi },
  { title: "VPN", url: "/vpn", icon: Lock },
];

const monitorItems = [
  { title: "Sessions", url: "/monitors/sessions", icon: MonitorDot },
  { title: "Sources", url: "/monitors/sources", icon: Network },
  { title: "Destinations", url: "/monitors/destinations", icon: Globe },
  { title: "Applications", url: "/monitors/applications", icon: AppWindow },
  { title: "Threats", url: "/monitors/threats", icon: AlertTriangle },
  { title: "VPN Monitor", url: "/monitors/vpn", icon: Eye },
  { title: "Firewall Objects", url: "/monitors/firewall-objects", icon: Target },
  { title: "Top Websites", url: "/monitors/top-websites", icon: Globe },
  { title: "Cloud Apps", url: "/monitors/cloud-apps", icon: Cloud },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname === path;

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
              {dashboardItems.map((item) =>
                item.children ? (
                  <Collapsible key={item.title} defaultOpen={location.pathname.startsWith(item.url)}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={location.pathname.startsWith(item.url)}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span className="flex-1">{item.title}</span>}
                          {!collapsed && <ChevronDown className="h-3 w-3 transition-transform" />}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.url}>
                              <SidebarMenuSubButton asChild isActive={isActive(child.url)}>
                                <NavLink to={child.url}>{child.title}</NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end={item.url === "/"}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
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
