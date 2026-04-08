// localStorage-based student progress tracking

export interface LabProgress {
  labId: string;
  status: "not-started" | "in-progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  timeSpentSeconds: number;
  hintsUsed: number;
  score: number; // 0-100
  objectivesCompleted: string[];
}

export interface ProgressData {
  labs: Record<string, LabProgress>;
  totalCliCommands: number;
  lastActiveAt: string;
}

const STORAGE_KEY = "fg-sim-progress";

function getDefault(): ProgressData {
  return { labs: {}, totalCliCommands: 0, lastActiveAt: new Date().toISOString() };
}

export function loadProgress(): ProgressData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : getDefault();
  } catch {
    return getDefault();
  }
}

export function saveProgress(data: ProgressData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastActiveAt: new Date().toISOString() }));
}

export function startLab(labId: string): ProgressData {
  const data = loadProgress();
  data.labs[labId] = {
    labId,
    status: "in-progress",
    startedAt: new Date().toISOString(),
    timeSpentSeconds: 0,
    hintsUsed: 0,
    score: 0,
    objectivesCompleted: [],
  };
  saveProgress(data);
  return data;
}

export function completeLab(labId: string, score: number, timeSpent: number, hintsUsed: number): ProgressData {
  const data = loadProgress();
  const lab = data.labs[labId];
  if (lab) {
    lab.status = "completed";
    lab.completedAt = new Date().toISOString();
    lab.score = score;
    lab.timeSpentSeconds = timeSpent;
    lab.hintsUsed = hintsUsed;
  }
  saveProgress(data);
  return data;
}

export function completeObjective(labId: string, objectiveId: string): ProgressData {
  const data = loadProgress();
  const lab = data.labs[labId];
  if (lab && !lab.objectivesCompleted.includes(objectiveId)) {
    lab.objectivesCompleted.push(objectiveId);
  }
  saveProgress(data);
  return data;
}

export function incrementCliCommands(): ProgressData {
  const data = loadProgress();
  data.totalCliCommands++;
  saveProgress(data);
  return data;
}

export function resetProgress(): ProgressData {
  const data = getDefault();
  saveProgress(data);
  return data;
}

export function getLabStats(data: ProgressData) {
  const labs = Object.values(data.labs);
  return {
    total: labs.length,
    completed: labs.filter(l => l.status === "completed").length,
    inProgress: labs.filter(l => l.status === "in-progress").length,
    avgScore: labs.filter(l => l.status === "completed").reduce((s, l) => s + l.score, 0) / Math.max(1, labs.filter(l => l.status === "completed").length),
    totalTime: labs.reduce((s, l) => s + l.timeSpentSeconds, 0),
  };
}
