export const PILOT_ROLES = ["issuer", "consumer", "subject", "observer"] as const;
export const PILOT_TASKS = [
  "inspect_attestation",
  "evaluate_policy",
  "explain_rejection",
  "verify_disclosure",
] as const;

export type PilotRole = typeof PILOT_ROLES[number];
export type PilotTask = typeof PILOT_TASKS[number];

export type PilotFeedback = {
  version: "1.0";
  sessionId: string;
  submittedAt: string;
  role: PilotRole;
  taskResults: Array<{ task: PilotTask; completed: boolean; seconds: number }>;
  clarityRating: number;
  trustRating: number;
  incidentObserved: boolean;
  rejectionReasonUnderstood: boolean;
  comments?: string;
};

export type FeedbackSummary = {
  version: "1.0";
  generatedAt: string;
  sessions: number;
  roles: Record<PilotRole, number>;
  tasks: Record<PilotTask, { attempted: number; completed: number; completionRate: number }>;
  averageClarityRating: number | null;
  averageTrustRating: number | null;
  rejectionReasonUnderstandingRate: number | null;
  incidentCount: number;
};

function isIntegerInRange(value: unknown, minimum: number, maximum: number): value is number {
  return Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum;
}

export function validatePilotFeedback(value: unknown): PilotFeedback {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Feedback must be an object");
  }
  const input = value as Record<string, unknown>;
  const allowed = new Set([
    "version", "sessionId", "submittedAt", "role", "taskResults", "clarityRating",
    "trustRating", "incidentObserved", "rejectionReasonUnderstood", "comments",
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key))) throw new Error("Unknown feedback field");
  if (input.version !== "1.0") throw new Error("Unsupported feedback version");
  if (typeof input.sessionId !== "string" || !/^[A-Za-z0-9_-]{8,64}$/.test(input.sessionId)) {
    throw new Error("Invalid pseudonymous sessionId");
  }
  if (typeof input.submittedAt !== "string" || Number.isNaN(Date.parse(input.submittedAt))) {
    throw new Error("Invalid submittedAt");
  }
  if (!PILOT_ROLES.includes(input.role as PilotRole)) throw new Error("Invalid role");
  if (!Array.isArray(input.taskResults) || input.taskResults.length === 0) {
    throw new Error("At least one task result is required");
  }
  const seen = new Set<string>();
  const taskResults = input.taskResults.map((value) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("Invalid task result");
    }
    const task = value as Record<string, unknown>;
    if (Object.keys(task).some((key) => !["task", "completed", "seconds"].includes(key))) {
      throw new Error("Unknown task field");
    }
    if (!PILOT_TASKS.includes(task.task as PilotTask) || seen.has(task.task as string)) {
      throw new Error("Invalid or duplicate task");
    }
    if (typeof task.completed !== "boolean" || !isIntegerInRange(task.seconds, 0, 7_200)) {
      throw new Error("Invalid task outcome");
    }
    seen.add(task.task as string);
    return { task: task.task as PilotTask, completed: task.completed, seconds: task.seconds };
  });
  if (!isIntegerInRange(input.clarityRating, 1, 5)) throw new Error("Invalid clarityRating");
  if (!isIntegerInRange(input.trustRating, 1, 5)) throw new Error("Invalid trustRating");
  if (typeof input.incidentObserved !== "boolean") throw new Error("Invalid incidentObserved");
  if (typeof input.rejectionReasonUnderstood !== "boolean") {
    throw new Error("Invalid rejectionReasonUnderstood");
  }
  if (input.comments !== undefined && (
    typeof input.comments !== "string" || input.comments.length > 2_000
  )) throw new Error("Invalid comments");

  return {
    version: "1.0",
    sessionId: input.sessionId,
    submittedAt: input.submittedAt,
    role: input.role as PilotRole,
    taskResults,
    clarityRating: input.clarityRating,
    trustRating: input.trustRating,
    incidentObserved: input.incidentObserved,
    rejectionReasonUnderstood: input.rejectionReasonUnderstood,
    ...(input.comments === undefined ? {} : { comments: input.comments }),
  };
}

export function summarizePilotFeedback(
  feedback: readonly PilotFeedback[],
  generatedAt = new Date().toISOString(),
): FeedbackSummary {
  const roles = Object.fromEntries(PILOT_ROLES.map((role) => [role, 0])) as Record<PilotRole, number>;
  const tasks = Object.fromEntries(PILOT_TASKS.map((task) => [task, {
    attempted: 0, completed: 0, completionRate: 0,
  }])) as FeedbackSummary["tasks"];
  for (const record of feedback) {
    roles[record.role] += 1;
    for (const result of record.taskResults) {
      tasks[result.task].attempted += 1;
      if (result.completed) tasks[result.task].completed += 1;
    }
  }
  for (const task of PILOT_TASKS) {
    const result = tasks[task];
    result.completionRate = result.attempted === 0 ? 0 : result.completed / result.attempted;
  }
  const average = (values: number[]) => values.length === 0
    ? null
    : values.reduce((total, value) => total + value, 0) / values.length;
  return {
    version: "1.0",
    generatedAt,
    sessions: feedback.length,
    roles,
    tasks,
    averageClarityRating: average(feedback.map((record) => record.clarityRating)),
    averageTrustRating: average(feedback.map((record) => record.trustRating)),
    rejectionReasonUnderstandingRate: feedback.length === 0
      ? null
      : feedback.filter((record) => record.rejectionReasonUnderstood).length / feedback.length,
    incidentCount: feedback.filter((record) => record.incidentObserved).length,
  };
}
