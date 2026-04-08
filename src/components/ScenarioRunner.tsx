import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { scenarios } from "@/simulation/scenarios";
import { useSimulation } from "@/simulation/simulationContext";
import { startLab, completeLab, completeObjective, loadProgress } from "@/simulation/progressStore";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Lightbulb, Timer, Trophy, ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function ScenarioRunner() {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, cliHistory, ...ctx } = useSimulation();

  const scenario = scenarios.find(s => s.id === labId);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const startedRef = useRef(false);

  // Run onStart once when lab loads
  useEffect(() => {
    if (!scenario || !labId || startedRef.current) return;
    startedRef.current = true;
    const progress = loadProgress();
    const existing = progress.labs[labId];
    if (existing) {
      setCompleted(new Set(existing.objectivesCompleted));
      if (existing.status === "completed") setIsFinished(true);
    } else {
      startLab(labId);
      // Run scenario setup
      if (scenario.onStart) {
        scenario.onStart(ctx);
      }
    }
  }, [labId, scenario]);

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Auto-validation loop — checks all objectives against current state
  useEffect(() => {
    if (!scenario || isFinished) return;

    const validationState = {
      policies: state.policies,
      interfaces: state.interfaces,
      addressObjects: state.addressObjects,
      alertLogs: state.alertLogs,
      ipsecTunnels: state.ipsecTunnels,
      compromisedHosts: state.compromisedHosts,
    };

    let changed = false;
    const newCompleted = new Set(completed);

    scenario.objectives.forEach(obj => {
      if (newCompleted.has(obj.id)) return;
      try {
        if (obj.validate(validationState, cliHistory, location.pathname)) {
          newCompleted.add(obj.id);
          completeObjective(labId!, obj.id);
          changed = true;
        }
      } catch (e) {
        // validation error — skip
      }
    });

    if (changed) {
      setCompleted(newCompleted);
      const newCount = newCompleted.size - completed.size;
      if (newCount === 1) {
        toast.success("Objective completed!");
      } else if (newCount > 1) {
        toast.success(`${newCount} objectives completed!`);
      }
    }
  }, [state, cliHistory, location.pathname, scenario, isFinished, completed, labId]);

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

  if (!scenario) {
    return <DashboardLayout title="Lab Not Found"><p>Scenario not found.</p></DashboardLayout>;
  }

  const allDone = completed.size === scenario.objectives.length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <DashboardLayout title={`Lab: ${scenario.title}`} subtitle={scenario.category}>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/training")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Labs
        </Button>

        {/* Status bar */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <Badge variant="outline" className="flex items-center gap-1">
            <Timer className="h-3 w-3" />{formatTime(elapsed)}
          </Badge>
          <Badge variant="outline">{completed.size}/{scenario.objectives.length} completed</Badge>
          <Badge className={`text-[10px] ${
            scenario.difficulty === "beginner" ? "bg-green-500/10 text-green-600" :
            scenario.difficulty === "intermediate" ? "bg-yellow-500/10 text-yellow-600" :
            "bg-red-500/10 text-red-600"
          }`}>
            {scenario.difficulty}
          </Badge>
          {isFinished && (
            <Badge className="bg-primary/10 text-primary flex items-center gap-1">
              <Trophy className="h-3 w-3" />Completed
            </Badge>
          )}
        </div>

        {/* Description */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{scenario.description}</p>
            {scenario.onStart && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                This lab modifies the simulation state — a scenario has been set up for you to resolve.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Objectives — Auto-validated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scenario.objectives.map((obj, idx) => (
              <ObjectiveItem
                key={obj.id}
                objective={obj}
                index={idx}
                isCompleted={completed.has(obj.id)}
                hintsRevealed={hintsShown[obj.id] || 0}
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
              <p className="text-sm text-muted-foreground">
                Time: {formatTime(elapsed)} • Hints used: {Object.values(hintsShown).reduce((s, v) => s + v, 0)}
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/training")}>
                Return to Lab Catalog
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

interface ObjectiveItemProps {
  objective: { id: string; title: string; description: string; hints: string[]; actionHint: string };
  index: number;
  isCompleted: boolean;
  hintsRevealed: number;
  onShowHint: () => void;
  isFinished: boolean;
}

function ObjectiveItem({ objective, index, isCompleted, hintsRevealed, onShowHint, isFinished }: ObjectiveItemProps) {
  return (
    <div className={`border rounded-md p-3 transition-colors ${
      isCompleted ? "bg-primary/5 border-primary/30" : ""
    }`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground animate-pulse" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{index + 1}. {objective.title}</h4>
            {!isCompleted && !isFinished && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onShowHint}>
                <Lightbulb className="h-3 w-3 mr-1" /> Hint
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{objective.description}</p>

          {/* Action hint — always visible when not completed */}
          {!isCompleted && !isFinished && (
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 shrink-0" /> {objective.actionHint}
            </p>
          )}

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
