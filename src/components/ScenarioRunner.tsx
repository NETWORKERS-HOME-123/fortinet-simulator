import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { scenarios, LabObjective } from "@/simulation/scenarios";
import { useSimulation } from "@/simulation/simulationContext";
import { startLab, completeLab, completeObjective, loadProgress } from "@/simulation/progressStore";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle, Circle, Lightbulb, ChevronDown, Timer, Trophy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ScenarioRunner() {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { cliHistory } = useSimulation();

  const scenario = scenarios.find(s => s.id === labId);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Load existing progress
  useEffect(() => {
    if (!labId) return;
    const progress = loadProgress();
    const existing = progress.labs[labId];
    if (existing) {
      setCompleted(new Set(existing.objectivesCompleted));
      if (existing.status === "completed") setIsFinished(true);
    } else {
      startLab(labId);
    }
  }, [labId]);

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Auto-validate navigation objectives
  useEffect(() => {
    if (!scenario || isFinished) return;
    scenario.objectives.forEach(obj => {
      if (obj.validationType === "navigation" && obj.validationData?.path) {
        // We can't check current route from here directly, but we let the user manually check
      }
      if (obj.validationType === "cli" && obj.validationData?.command) {
        const cmd = obj.validationData.command as string;
        if (cliHistory.some(c => c.toLowerCase().includes(cmd.toLowerCase()))) {
          if (!completed.has(obj.id)) {
            markComplete(obj.id);
          }
        }
      }
    });
  }, [cliHistory, scenario, isFinished]);

  const markComplete = useCallback((objId: string) => {
    if (!labId) return;
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(objId);
      completeObjective(labId, objId);
      return next;
    });
    toast.success("Objective completed!");
  }, [labId]);

  const showHint = (objId: string) => {
    setHintsShown(prev => ({ ...prev, [objId]: (prev[objId] || 0) + 1 }));
  };

  const finishLab = () => {
    if (!labId || !scenario) return;
    const totalHints = Object.values(hintsShown).reduce((s, v) => s + v, 0);
    const completionPct = Math.round((completed.size / scenario.objectives.length) * 100);
    const hintPenalty = Math.min(totalHints * 5, 30);
    const score = Math.max(0, completionPct - hintPenalty);
    completeLab(labId, score, elapsed, totalHints);
    setIsFinished(true);
    toast.success(`Lab completed! Score: ${score}%`);
  };

  if (!scenario) return <DashboardLayout title="Lab Not Found"><p>Scenario not found.</p></DashboardLayout>;

  const allDone = completed.size === scenario.objectives.length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <DashboardLayout title={`Lab: ${scenario.title}`} subtitle={scenario.category}>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/training")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Labs
        </Button>

        {/* Status bar */}
        <div className="flex items-center gap-4 text-sm">
          <Badge variant="outline" className="flex items-center gap-1"><Timer className="h-3 w-3" />{formatTime(elapsed)}</Badge>
          <Badge variant="outline">{completed.size}/{scenario.objectives.length} completed</Badge>
          <Badge className={`text-[10px] ${scenario.difficulty === "beginner" ? "bg-green-500/10 text-green-600" : scenario.difficulty === "intermediate" ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-600"}`}>
            {scenario.difficulty}
          </Badge>
          {isFinished && <Badge className="bg-primary/10 text-primary flex items-center gap-1"><Trophy className="h-3 w-3" />Completed</Badge>}
        </div>

        {/* Description */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{scenario.description}</p>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Objectives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scenario.objectives.map((obj, idx) => (
              <ObjectiveItem
                key={obj.id}
                objective={obj}
                index={idx}
                isCompleted={completed.has(obj.id)}
                hintsRevealed={hintsShown[obj.id] || 0}
                onComplete={() => markComplete(obj.id)}
                onShowHint={() => showHint(obj.id)}
                isFinished={isFinished}
              />
            ))}
          </CardContent>
        </Card>

        {!isFinished && (
          <div className="flex gap-2">
            <Button onClick={finishLab} disabled={!allDone} className="flex-1">
              {allDone ? "Complete Lab" : `Complete ${completed.size}/${scenario.objectives.length} objectives first`}
            </Button>
          </div>
        )}

        {isFinished && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center space-y-2">
              <Trophy className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Lab Complete!</h3>
              <p className="text-sm text-muted-foreground">Time: {formatTime(elapsed)} • Hints used: {Object.values(hintsShown).reduce((s, v) => s + v, 0)}</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/training")}>Return to Lab Catalog</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function ObjectiveItem({ objective, index, isCompleted, hintsRevealed, onComplete, onShowHint, isFinished }: {
  objective: LabObjective; index: number; isCompleted: boolean; hintsRevealed: number;
  onComplete: () => void; onShowHint: () => void; isFinished: boolean;
}) {
  return (
    <div className={`border rounded-md p-3 ${isCompleted ? "bg-primary/5 border-primary/30" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isCompleted ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{index + 1}. {objective.title}</h4>
            {!isCompleted && !isFinished && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onShowHint}>
                  <Lightbulb className="h-3 w-3 mr-1" /> Hint
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onComplete}>
                  Mark Done
                </Button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{objective.description}</p>
          {hintsRevealed > 0 && (
            <div className="mt-2 space-y-1">
              {objective.hints.slice(0, hintsRevealed).map((hint, i) => (
                <p key={i} className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 shrink-0" /> {hint}
                </p>
              ))}
              {hintsRevealed < objective.hints.length && (
                <button onClick={onShowHint} className="text-[10px] text-muted-foreground hover:text-foreground underline">
                  Show next hint ({hintsRevealed}/{objective.hints.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
