import { expect } from "chai";
import { summarizePilotFeedback, validatePilotFeedback } from "../src/pilot/Feedback.js";
import { assessPilotProgress, createPilotRun } from "../src/pilot/Run.js";

describe("PilotRun", function () {
  it("opens an immutable bounded 14-day testnet window", function () {
    const run = createPilotRun(new Date("2026-08-23T00:00:00.000Z"), "pilot_2026_01");
    expect(run.closesAt).to.equal("2026-09-06T00:00:00.000Z");
    expect(run.maxParticipants).to.equal(12);
    expect(run.syntheticDataOnly).to.equal(true);
    expect(run.realFinancialDecisionsAllowed).to.equal(false);
  });

  it("stays in progress without real sessions and stops on any reported incident", function () {
    const run = createPilotRun(new Date("2026-08-23T00:00:00.000Z"), "pilot_2026_01");
    expect(assessPilotProgress(run, undefined, new Date("2026-08-24T00:00:00.000Z")).status)
      .to.equal("IN_PROGRESS");
    const record = validatePilotFeedback({
      version: "1.0",
      sessionId: "session_incident",
      submittedAt: "2026-08-24T00:00:00.000Z",
      role: "observer",
      taskResults: [{ task: "inspect_attestation", completed: true, seconds: 30 }],
      clarityRating: 5,
      trustRating: 5,
      incidentObserved: true,
      rejectionReasonUnderstood: true,
    });
    expect(assessPilotProgress(
      run,
      summarizePilotFeedback([record]),
      new Date("2026-08-24T00:00:00.000Z"),
    ).status).to.equal("STOP_REQUIRED");
  });
});
