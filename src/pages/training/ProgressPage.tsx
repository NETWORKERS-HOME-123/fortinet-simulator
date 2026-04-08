import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { loadProgress, resetProgress, getLabStats, ProgressData } from "@/simulation/progressStore";
import { scenarios } from "@/simulation/scenarios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, Terminal, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress());
  const stats = getLabStats(progress);

  const handleReset = () => {
    const data = resetProgress();
    setProgress(data);
    toast.success("Progress reset");
  };

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  };

  return (
    <DashboardLayout title="Training Progress" subtitle="Your lab completion status">
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}/{scenarios.length}</p>
                <p className="text-xs text-muted-foreground">Labs Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avgScore)}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Terminal className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{progress.totalCliCommands}</p>
                <p className="text-xs text-muted-foreground">CLI Commands</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall progress bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round((stats.completed / scenarios.length) * 100)}%</span>
            </div>
            <Progress value={(stats.completed / scenarios.length) * 100} />
          </CardContent>
        </Card>

        {/* Lab details table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Lab Details</CardTitle>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset Progress
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lab</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Hints</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarios.map(s => {
                  const lab = progress.labs[s.id];
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-sm">{s.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">{s.difficulty}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lab?.status === "completed" ? "default" : lab?.status === "in-progress" ? "secondary" : "outline"} className="text-[10px]">
                          {lab?.status || "Not Started"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{lab?.score ? `${lab.score}%` : "—"}</TableCell>
                      <TableCell className="text-xs">{lab?.timeSpentSeconds ? formatTime(lab.timeSpentSeconds) : "—"}</TableCell>
                      <TableCell className="text-xs">{lab?.hintsUsed ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
