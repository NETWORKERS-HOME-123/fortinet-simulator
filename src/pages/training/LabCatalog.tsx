import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { scenarios } from "@/simulation/scenarios";
import { loadProgress } from "@/simulation/progressStore";
import { useActiveLab } from "@/components/labs/ActiveLabContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Clock, Target, Play, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function LabCatalog() {
  const navigate = useNavigate();
  const progress = loadProgress();
  const { startLabSession, activeLab } = useActiveLab();
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? scenarios : scenarios.filter(s => s.difficulty === filter);
  const diffColors = { beginner: "bg-green-500/10 text-green-600", intermediate: "bg-yellow-500/10 text-yellow-600", advanced: "bg-red-500/10 text-red-600" };

  const handleStart = (labId: string) => {
    const navPath = startLabSession(labId);
    if (navPath) navigate(navPath);
  };

  return (
    <DashboardLayout title="Training Labs" subtitle="FortiGate Hands-On Training Scenarios">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-muted-foreground">{scenarios.length} labs available</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/training/progress")}>View Progress</Button>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({scenarios.length})</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(scenario => {
            const labProgress = progress.labs[scenario.id];
            const status = labProgress?.status || "not-started";
            const isActive = activeLab?.id === scenario.id;
            return (
              <Card key={scenario.id} className={`hover:border-primary/50 transition-colors cursor-pointer group ${isActive ? "border-primary/50 ring-1 ring-primary/20" : ""}`} onClick={() => handleStart(scenario.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{scenario.title}</CardTitle>
                    <Badge className={`text-[10px] ${diffColors[scenario.difficulty]}`}>{scenario.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{scenario.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{scenario.estimatedMinutes} min</span>
                    <span className="flex items-center gap-1"><Target className="h-3 w-3" />{scenario.objectives.length} objectives</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {scenario.tags.slice(0, 3).map(t => <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant={status === "completed" ? "default" : status === "in-progress" ? "secondary" : "outline"} className="text-[10px]">
                      {status === "not-started" ? "Not Started" : status === "in-progress" ? "In Progress" : `Completed${labProgress?.score ? ` — ${labProgress.score}%` : ""}`}
                    </Badge>
                    {isActive ? (
                      <Badge className="bg-primary/10 text-primary text-[10px] animate-pulse">Active</Badge>
                    ) : status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
