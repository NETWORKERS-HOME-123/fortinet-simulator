import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { StatusBadge } from "@/components/widgets/StatusBadge";
import { alertLogs } from "@/data/mockData";

export function NotificationPopover() {
  const recentAlerts = alertLogs.slice(0, 10);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
            {recentAlerts.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <p className="text-xs text-muted-foreground">{recentAlerts.length} recent alerts</p>
        </div>
        <div className="max-h-80 overflow-auto">
          {recentAlerts.map((log) => (
            <div key={log.id} className="flex items-start gap-2 p-3 border-b last:border-0 hover:bg-muted/50 text-xs">
              <StatusBadge status={log.severity} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{log.message}</div>
                <div className="text-muted-foreground mt-0.5">{log.time} • {log.source}</div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
