import { useActiveLab } from "./ActiveLabContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle, Circle, Lightbulb, Timer, Trophy, X, ArrowRight,
  ChevronDown, ChevronUp, RotateCcw, Navigation,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export function ActiveLabPanel() {
  const {
    activeLab, completed, hintsShown, elapsed, isFinished,
    finishLab, showHint, stopLab, resetLab, navigateToObjective, currentObjectiveIndex,
  } = useActiveLab();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  if (!activeLab) return null;

  const allDone = completed.size === activeLab.objectives.length;
  const progressPct = (completed.size / activeLab.objectives.length) * 100;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card
          className="p-2.5 shadow-lg border-primary/30 cursor-pointer flex items-center gap-2 hover:shadow-xl transition-shadow"
          onClick={() => setCollapsed(false)}
        >
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{activeLab.title}</span>
          <Badge variant="outline" className="text-[10px]">
            {completed.size}/{activeLab.objectives.length}
          </Badge>
          <Badge variant="outline" className="text-[10px] flex items-center gap-0.5">
            <Timer className="h-2.5 w-2.5" />{formatTime(elapsed)}
          </Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] max-h-[75vh] overflow-hidden">
      <Card className="shadow-xl border-primary/30 flex flex-col max-h-[75vh]">
        {/* Header */}
        <div className="p-3 border-b bg-card shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold truncate flex-1">{activeLab.title}</h3>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetLab} title="Reset Lab">
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCollapsed(true)} title="Minimize">
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={stopLab} title="Close">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progressPct} className="h-1.5 flex-1" />
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="outline" className="text-[10px] flex items-center gap-0.5">
                <Timer className="h-2.5 w-2.5" />{formatTime(elapsed)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {completed.size}/{activeLab.objectives.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {isFinished ? (
            <div className="text-center py-6 space-y-3">
              <Trophy className="h-10 w-10 text-primary mx-auto" />
              <h4 className="font-semibold">Lab Complete!</h4>
              <p className="text-xs text-muted-foreground">
                Time: {formatTime(elapsed)} · Hints used: {Object.values(hintsShown).reduce((s, v) => s + v, 0)}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={resetLab}>Try Again</Button>
                <Button variant="outline" size="sm" onClick={stopLab}>Close</Button>
              </div>
            </div>
          ) : (
            activeLab.objectives.map((obj, idx) => {
              const isDone = completed.has(obj.id);
              const isCurrent = idx === currentObjectiveIndex;
              const isOnCorrectPage = obj.navPath === location.pathname;
              const hints = hintsShown[obj.id] || 0;

              return (
                <div
                  key={obj.id}
                  className={`rounded-lg border p-2.5 transition-all ${
                    isDone
                      ? "bg-primary/5 border-primary/30"
                      : isCurrent
                      ? "bg-accent/50 border-primary/50 ring-1 ring-primary/20"
                      : "opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Status icon */}
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : isCurrent ? (
                        <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        </div>
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
                          Step {idx + 1}: {obj.title}
                        </h4>
                        {!isDone && (
                          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] shrink-0" onClick={() => showHint(obj.id)}>
                            <Lightbulb className="h-2.5 w-2.5 mr-0.5" />Hint
                          </Button>
                        )}
                      </div>

                      {!isDone && (
                        <p className="text-[11px] text-muted-foreground leading-snug">{obj.description}</p>
                      )}

                      {/* Navigation button — show when current and not on correct page */}
                      {isCurrent && !isDone && !isOnCorrectPage && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] gap-1 mt-0.5 border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => navigateToObjective(obj.id)}
                        >
                          <Navigation className="h-2.5 w-2.5" />
                          Go to {obj.actionHint.split("→")[0].replace("Go to ", "").trim()}
                          <ArrowRight className="h-2.5 w-2.5" />
                        </Button>
                      )}

                      {/* On correct page indicator */}
                      {isCurrent && !isDone && isOnCorrectPage && (
                        <p className="text-[10px] text-primary flex items-center gap-0.5 font-medium">
                          <CheckCircle className="h-2.5 w-2.5" /> You're on the right page — {obj.actionHint}
                        </p>
                      )}

                      {/* Hints */}
                      {hints > 0 && !isDone && (
                        <div className="mt-1 space-y-0.5 bg-accent/30 rounded p-1.5">
                          {obj.hints.slice(0, hints).map((hint, i) => (
                            <p key={i} className="text-[10px] text-yellow-600 dark:text-yellow-400 flex items-start gap-1">
                              <Lightbulb className="h-2.5 w-2.5 shrink-0 mt-0.5" /> {hint}
                            </p>
                          ))}
                          {hints < obj.hints.length && (
                            <button onClick={() => showHint(obj.id)} className="text-[9px] text-muted-foreground hover:text-foreground underline">
                              More hints ({hints}/{obj.hints.length})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {!isFinished && (
          <div className="p-3 border-t shrink-0">
            <Button onClick={finishLab} disabled={!allDone} size="sm" className="w-full text-xs">
              {allDone ? "🏆 Complete Lab" : `${completed.size}/${activeLab.objectives.length} steps completed`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
