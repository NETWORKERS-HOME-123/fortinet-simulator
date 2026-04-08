import { useState, useEffect } from "react";
import { useSimulation } from "@/simulation/simulationContext";
import { eventTemplates, generateEventActions } from "@/simulation/eventEngine";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, RotateCcw, X, Eye } from "lucide-react";
import { toast } from "sonner";

export function InstructorToolbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const { addAlert, updateCpu, updateMemory, setInterfaceStatus, setTunnelStatus, addCompromisedHost, resetState } = useSimulation();

  // Toggle with Ctrl+Shift+I
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        setIsVisible(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fireEvent = () => {
    if (!selectedEvent) return;
    const actions = generateEventActions(selectedEvent);
    const now = new Date();
    const nextId = Date.now();

    actions.forEach(action => {
      // Add alert
      addAlert({
        id: nextId,
        time: now.toLocaleTimeString("en-US", { hour12: false }),
        severity: action.alertSeverity,
        message: action.alertMessage,
        source: action.alertSource,
      });

      // Apply mutations
      switch (action.type) {
        case "set-cpu":
          updateCpu(action.data.value as number);
          break;
        case "set-memory":
          updateMemory(action.data.value as number);
          break;
        case "set-interface-status":
          setInterfaceStatus(action.data.name as string, action.data.status as "up" | "down");
          break;
        case "set-tunnel-status":
          setTunnelStatus(action.data.name as string, action.data.phase2 as "up" | "down");
          break;
        case "add-compromised-host":
          addCompromisedHost(action.data as any);
          break;
      }
    });

    const template = eventTemplates.find(t => t.id === selectedEvent);
    toast.warning(`Event injected: ${template?.name}`, { description: template?.description });
  };

  const handleReset = () => {
    resetState();
    toast.success("Simulation state reset to defaults");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 right-4 z-50 bg-card border rounded-lg shadow-lg p-3 w-80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Instructor Mode</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsVisible(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-2">
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select event to inject..." />
          </SelectTrigger>
          <SelectContent>
            {eventTemplates.map(t => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2">
                  <Badge variant={t.severity === "critical" ? "destructive" : "secondary"} className="text-[9px] px-1">{t.severity}</Badge>
                  <span className="text-xs">{t.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-8 text-xs" onClick={fireEvent} disabled={!selectedEvent}>
            <Zap className="h-3 w-3 mr-1" /> Fire Event
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">Press Ctrl+Shift+I to toggle • Events update dashboards in real-time</p>
    </div>
  );
}
