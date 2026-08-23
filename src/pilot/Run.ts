import type { FeedbackSummary } from "./Feedback.js";

export type PilotRun = {
  version: "1.0";
  pilotId: string;
  openedAt: string;
  closesAt: string;
  maxParticipants: number;
  maxDurationDays: number;
  environment: "whitechain-sepolia";
  syntheticDataOnly: true;
  realFinancialDecisionsAllowed: false;
};

export type PilotProgress = {
  status: "IN_PROGRESS" | "READY_FOR_EXIT_REVIEW" | "STOP_REQUIRED" | "WINDOW_CLOSED";
  sessions: number;
  sessionsRequired: number;
  remainingCapacity: number;
  windowOpen: boolean;
  measurableGates: {
    minimumSessions: boolean;
    noReportedIncidents: boolean;
    taskCompletion: boolean;
    clarity: boolean;
    rejectionUnderstanding: boolean;
  };
};

export function createPilotRun(openedAt: Date, pilotId: string): PilotRun {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(pilotId)) throw new Error("Invalid pilotId");
  const closesAt = new Date(openedAt.getTime() + 14 * 24 * 60 * 60 * 1_000);
  return {
    version: "1.0",
    pilotId,
    openedAt: openedAt.toISOString(),
    closesAt: closesAt.toISOString(),
    maxParticipants: 12,
    maxDurationDays: 14,
    environment: "whitechain-sepolia",
    syntheticDataOnly: true,
    realFinancialDecisionsAllowed: false,
  };
}

export function assessPilotProgress(
  run: PilotRun,
  summary: FeedbackSummary | undefined,
  now: Date,
): PilotProgress {
  const sessions = summary?.sessions ?? 0;
  const windowOpen = now.getTime() <= Date.parse(run.closesAt);
  const attemptedTasks = summary === undefined
    ? []
    : Object.values(summary.tasks).filter((task) => task.attempted > 0);
  const measurableGates = {
    minimumSessions: sessions >= 8,
    noReportedIncidents: (summary?.incidentCount ?? 0) === 0,
    taskCompletion: attemptedTasks.length > 0
      && attemptedTasks.every((task) => task.completionRate >= 0.8),
    clarity: (summary?.averageClarityRating ?? 0) >= 4,
    rejectionUnderstanding: (summary?.rejectionReasonUnderstandingRate ?? 0) >= 0.8,
  };
  const status = !measurableGates.noReportedIncidents
    ? "STOP_REQUIRED"
    : !windowOpen
      ? "WINDOW_CLOSED"
      : Object.values(measurableGates).every(Boolean)
        ? "READY_FOR_EXIT_REVIEW"
        : "IN_PROGRESS";
  return {
    status,
    sessions,
    sessionsRequired: 8,
    remainingCapacity: Math.max(run.maxParticipants - sessions, 0),
    windowOpen,
    measurableGates,
  };
}
