import { useActiveLab } from "./ActiveLabContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle, Circle, Lightbulb, Timer, Trophy, X, MapPin,
  ChevronDown, ChevronUp, RotateCcw,
} from "lucide-react";
import { useState } from "react";

export function ActiveLabPanel() {
  const { activeLab, completed, hintsShown, elapsed, isFinished, finishLab, showHint, stopLab, resetLab } = useActiveLab();
  const [collapsed, setCollapsed] = useState(false);

  if (!activeLab) return null;

  const allDone = completed.size === activeLab.objectives.length;
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
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[70vh] overflow-hidden">
      <Card className="shadow-xl border-primary/30 flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="p-3 border-b bg-card flex items-center justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{activeLab.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] flex items-center gap-0.5">
                <Timer className="h-2.5 w-2.5" />{formatTime(elapsed)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {completed.size}/{activeLab.objectives.length}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetLab} title="Reset Lab">
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCollapsed(true)} title="Minimize">
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={stopLab} title="Close">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Objectives */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {isFinished ? (
            <div className="text-center py-4 space-y-2">
              <Trophy className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-semibold text-sm">Lab Complete!</h4>
              <p className="text-xs text-muted-foreground">
                Time: {formatTime(elapsed)} · Hints: {Object.values(hintsShown).reduce((s, v) => s + v, 0)}
              </p>
              <Button variant="outline" size="sm" onClick={stopLab}>Close</Button>
            </div>
          ) : (
            activeLab.objectives.map((obj, idx) => {
              const isDone = completed.has(obj.id);
              const hints = hintsShown[obj.id] || 0;
              return (
                <div key={obj.id} className={`rounded-md border p-2.5 transition-colors ${isDone ? "bg-primary/5 border-primary/30" : ""}`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-medium">{idx + 1}. {obj.title}</h4>
                        {!isDone && (
                          <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px]" onClick={() => showHint(obj.id)}>
                            <Lightbulb className="h-2.5 w-2.5 mr-0.5" />Hint
                          </Button>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">{obj.description}</p>
                      {!isDone && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 shrink-0" /> {obj.actionHint}
                        </p>
                      )}
                      {hints > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {obj.hints.slice(0, hints).map((hint, i) => (
                            <p key={i} className="text-[10px] text-yellow-600 dark:text-yellow-400 flex items-start gap-0.5">
                              <Lightbulb className="h-2.5 w-2.5 shrink-0 mt-0.5" /> {hint}
                            </p>
                          ))}
                          {hints < obj.hints.length && (
                            <button onClick={() => showHint(obj.id)} className="text-[9px] text-muted-foreground hover:text-foreground underline">
                              Next hint ({hints}/{obj.hints.length})
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
              {allDone ? "Complete Lab" : `${completed.size}/${activeLab.objectives.length} objectives done`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
