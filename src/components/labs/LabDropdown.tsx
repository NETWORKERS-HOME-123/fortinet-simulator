import { useNavigate } from "react-router-dom";
import { scenarios } from "@/simulation/scenarios";
import { loadProgress } from "@/simulation/progressStore";
import { useActiveLab } from "./ActiveLabContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, Play, CheckCircle, Circle } from "lucide-react";

export function LabDropdown() {
  const navigate = useNavigate();
  const { activeLab, startLabSession, stopLab, completed } = useActiveLab();
  const progress = loadProgress();

  const diffColors: Record<string, string> = {
    beginner: "text-green-600",
    intermediate: "text-yellow-600",
    advanced: "text-red-600",
  };

  const handleStart = (labId: string) => {
    const navPath = startLabSession(labId);
    if (navPath) navigate(navPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 relative">
          <GraduationCap className="h-4 w-4" />
          <span className="hidden md:inline text-xs">Labs</span>
          {activeLab && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Training Labs</span>
          {activeLab && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive" onClick={stopLab}>
              Stop Lab
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {activeLab && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active Lab</p>
              <p className="text-sm font-medium mt-0.5">{activeLab.title}</p>
              <p className="text-xs text-muted-foreground">
                {completed.size}/{activeLab.objectives.length} objectives
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {scenarios.map(scenario => {
          const labProgress = progress.labs[scenario.id];
          const status = labProgress?.status || "not-started";
          const isActive = activeLab?.id === scenario.id;

          return (
            <DropdownMenuItem
              key={scenario.id}
              className="flex items-center gap-2 py-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                handleStart(scenario.id);
              }}
            >
              <div className="shrink-0">
                {status === "completed" ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : isActive ? (
                  <Play className="h-4 w-4 text-primary animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{scenario.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {scenario.objectives.length} steps · {scenario.estimatedMinutes}min
                </p>
              </div>
              <Badge variant="outline" className={`text-[9px] shrink-0 ${diffColors[scenario.difficulty]}`}>
                {scenario.difficulty.slice(0, 3)}
              </Badge>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/training/progress")} className="text-xs text-muted-foreground">
          View Progress & Scores
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
