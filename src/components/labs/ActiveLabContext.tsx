import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  startLabSession: (labId: string) => string | null; // returns first nav path
  stopLab: () => void;
  finishLab: () => void;
  showHint: (objId: string) => void;
  resetLab: () => void;
}

const ActiveLabContext = createContext<ActiveLabContextType | null>(null);

export function ActiveLabProvider({ children }: { children: React.ReactNode }) {
  const { state, cliHistory, ...ctx } = useSimulation();
  const location = useLocation();

  const [activeLab, setActiveLab] = useState<LabScenario | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hintsShown, setHintsShown] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const startedRef = useRef(false);

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
      const newCount = newCompleted.size - completed.size;
      if (newCount === 1) toast.success("✅ Objective completed!");
      else if (newCount > 1) toast.success(`✅ ${newCount} objectives completed!`);
    }
  }, [state, cliHistory, location.pathname, activeLab, isFinished, completed]);

  const startLabSession = useCallback((labId: string): string | null => {
    const scenario = scenarios.find(s => s.id === labId);
    if (!scenario) return null;

    // Reset state
    setCompleted(new Set());
    setHintsShown({});
    setElapsed(0);
    setIsFinished(false);
    startedRef.current = true;

    // Load existing progress or start fresh
    const progress = loadProgress();
    const existing = progress.labs[labId];
    if (existing && existing.status === "completed") {
      // Re-start completed lab
      startLab(labId);
    } else if (existing) {
      setCompleted(new Set(existing.objectivesCompleted));
    } else {
      startLab(labId);
    }

    // Run onStart hook
    if (scenario.onStart) {
      scenario.onStart(ctx);
    }

    setActiveLab(scenario);

    // Return the path for the first objective's actionHint
    const firstObj = scenario.objectives[0];
    if (firstObj) {
      // Try to extract a navigation path from the validate function by testing known paths
      const knownPaths = [
        "/config/interfaces", "/config/policies", "/config/addresses",
        "/security", "/network", "/network/ipsec", "/network/routing",
        "/network/dhcp", "/monitors/ssl-vpn", "/", "/vpn", "/wifi",
        "/monitors/sessions", "/monitors/applications",
      ];
      const emptyState: ValidationState = {
        policies: [], interfaces: [], addressObjects: [],
        alertLogs: [], ipsecTunnels: [], compromisedHosts: [],
      };
      for (const path of knownPaths) {
        try {
          if (firstObj.validate(emptyState, [], path)) return path;
        } catch {}
      }
    }
    return null;
  }, [ctx]);

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
    // Re-start after a tick
    setTimeout(() => startLabSession(labId), 50);
  }, [activeLab, stopLab, startLabSession]);

  return (
    <ActiveLabContext.Provider value={{
      activeLab, completed, hintsShown, elapsed, isFinished,
      startLabSession, stopLab, finishLab, showHint, resetLab,
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
};

export function useActiveLab() {
  const ctx = useContext(ActiveLabContext);
  return ctx ?? defaultContext;
}
