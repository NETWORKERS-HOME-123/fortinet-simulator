import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scenarios, LabScenario, ValidationState } from "@/simulation/scenarios";
import { useSimulation } from "@/simulation/simulationContext";
import { startLab, completeLab, completeObjective, loadProgress } from "@/simulation/progressStore";
import { toast } from "sonner";

interface ActiveLabState {
  activeLab: LabScenario | null;
  completed: Set<string>;
  hintsShown: Record<string, number>;
  elapsed: number;
  isFinished: boolean;
}

interface ActiveLabContextType extends ActiveLabState {
  startLabSession: (labId: string) => string | null;
  stopLab: () => void;
  finishLab: () => void;
  showHint: (objId: string) => void;
  resetLab: () => void;
  navigateToObjective: (objId: string) => void;
  currentObjectiveIndex: number;
}

const ActiveLabContext = createContext<ActiveLabContextType | null>(null);

export function ActiveLabProvider({ children }: { children: React.ReactNode }) {
  const { state, cliHistory, ...ctx } = useSimulation();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeLab, setActiveLab] = useState<LabScenario | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Compute the index of the first incomplete objective
  const currentObjectiveIndex = activeLab
    ? activeLab.objectives.findIndex(obj => !completed.has(obj.id))
    : -1;

  // Timer
  useEffect(() => {
    if (!activeLab || isFinished) return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [activeLab, isFinished]);

  // Auto-validation loop
  useEffect(() => {
    if (!activeLab || isFinished) return;

    const validationState: ValidationState = {
      policies: state.policies,
      interfaces: state.interfaces,
      addressObjects: state.addressObjects,
      alertLogs: state.alertLogs,
      ipsecTunnels: state.ipsecTunnels,
      compromisedHosts: state.compromisedHosts,
    };

    let changed = false;
    const newCompleted = new Set(completed);

    activeLab.objectives.forEach(obj => {
      if (newCompleted.has(obj.id)) return;
      try {
        if (obj.validate(validationState, cliHistory, location.pathname)) {
          newCompleted.add(obj.id);
          completeObjective(activeLab.id, obj.id);
          changed = true;
        }
      } catch {}
    });

    if (changed) {
      setCompleted(newCompleted);
      const justCompleted = newCompleted.size - completed.size;
      if (justCompleted === 1) toast.success("✅ Objective completed!");
      else if (justCompleted > 1) toast.success(`✅ ${justCompleted} objectives completed!`);

      // Auto-navigate to next incomplete objective's page
      if (activeLab) {
        const nextObj = activeLab.objectives.find(obj => !newCompleted.has(obj.id));
        if (nextObj && nextObj.navPath && nextObj.navPath !== location.pathname) {
          // Small delay so user sees the completion toast first
          setTimeout(() => navigate(nextObj.navPath), 800);
        }
      }
    }
  }, [state, cliHistory, location.pathname, activeLab, isFinished, completed, navigate]);

  const startLabSession = useCallback((labId: string): string | null => {
    const scenario = scenarios.find(s => s.id === labId);
    if (!scenario) return null;

    setCompleted(new Set());
    setHintsShown({});
    setElapsed(0);
    setIsFinished(false);

    const progress = loadProgress();
    const existing = progress.labs[labId];
    if (existing && existing.status === "completed") {
      startLab(labId);
    } else if (existing) {
      setCompleted(new Set(existing.objectivesCompleted));
    } else {
      startLab(labId);
    }

    if (scenario.onStart) {
      scenario.onStart(ctx);
    }

    setActiveLab(scenario);

    // Return the explicit startPath
    return scenario.startPath;
  }, [ctx]);

  const navigateToObjective = useCallback((objId: string) => {
    if (!activeLab) return;
    const obj = activeLab.objectives.find(o => o.id === objId);
    if (obj?.navPath) {
      navigate(obj.navPath);
    }
  }, [activeLab, navigate]);

  const stopLab = useCallback(() => {
    setActiveLab(null);
    setCompleted(new Set());
    setHintsShown({});
    setElapsed(0);
    setIsFinished(false);
  }, []);

  const finishLab = useCallback(() => {
    if (!activeLab) return;
    const totalHints = Object.values(hintsShown).reduce((s, v) => s + v, 0);
    const completionPct = Math.round((completed.size / activeLab.objectives.length) * 100);
    const hintPenalty = Math.min(totalHints * 5, 30);
    const score = Math.max(0, completionPct - hintPenalty);
    completeLab(activeLab.id, score, elapsed, totalHints);
    setIsFinished(true);
    toast.success(`🏆 Lab completed! Score: ${score}%`);
  }, [activeLab, hintsShown, completed, elapsed]);

  const showHint = useCallback((objId: string) => {
    setHintsShown(prev => ({ ...prev, [objId]: (prev[objId] || 0) + 1 }));
  }, []);

  const resetLab = useCallback(() => {
    if (!activeLab) return;
    const labId = activeLab.id;
    stopLab();
    setTimeout(() => {
      const path = startLabSession(labId);
      if (path) navigate(path);
    }, 50);
  }, [activeLab, stopLab, startLabSession, navigate]);

  return (
    <ActiveLabContext.Provider value={{
      activeLab, completed, hintsShown, elapsed, isFinished,
      startLabSession, stopLab, finishLab, showHint, resetLab,
      navigateToObjective, currentObjectiveIndex,
    }}>
      {children}
    </ActiveLabContext.Provider>
  );
}

const defaultContext: ActiveLabContextType = {
  activeLab: null,
  completed: new Set(),
  hintsShown: {},
  elapsed: 0,
  isFinished: false,
  startLabSession: () => null,
  stopLab: () => {},
  finishLab: () => {},
  showHint: () => {},
  resetLab: () => {},
  navigateToObjective: () => {},
  currentObjectiveIndex: -1,
};

export function useActiveLab() {
  const ctx = useContext(ActiveLabContext);
  return ctx ?? defaultContext;
}
