import { expect } from "chai";
import { summarizePilotFeedback, validatePilotFeedback } from "../src/pilot/Feedback.js";

const VALID = {
  version: "1.0",
  sessionId: "session_0001",
  submittedAt: "2026-08-23T00:00:00.000Z",
  role: "consumer",
  taskResults: [
    { task: "inspect_attestation", completed: true, seconds: 45 },
    { task: "evaluate_policy", completed: false, seconds: 120 },
  ],
  clarityRating: 4,
  trustRating: 3,
  incidentObserved: false,
  rejectionReasonUnderstood: true,
};

describe("PilotFeedback", function () {
  it("validates a bounded pseudonymous feedback record", function () {
    expect(validatePilotFeedback(VALID)).to.deep.equal(VALID);
  });

  it("rejects unknown fields, duplicate tasks, and unbounded comments", function () {
    expect(() => validatePilotFeedback({ ...VALID, email: "pilot@example.com" })).to.throw(
      "Unknown feedback field",
    );
    expect(() => validatePilotFeedback({
      ...VALID,
      taskResults: [VALID.taskResults[0], VALID.taskResults[0]],
    })).to.throw("Invalid or duplicate task");
    expect(() => validatePilotFeedback({
      ...VALID,
      taskResults: [{ ...VALID.taskResults[0], wallet: "secret" }],
    })).to.throw("Unknown task field");
    expect(() => validatePilotFeedback({ ...VALID, comments: "x".repeat(2_001) })).to.throw(
      "Invalid comments",
    );
  });

  it("aggregates feedback without retaining identifiers or comments", function () {
    const first = validatePilotFeedback({ ...VALID, comments: "private note" });
    const second = validatePilotFeedback({
      ...VALID,
      sessionId: "session_0002",
      role: "issuer",
      clarityRating: 2,
      incidentObserved: true,
      rejectionReasonUnderstood: false,
    });
    const summary = summarizePilotFeedback([first, second], "2026-08-23T01:00:00.000Z");
    expect(summary.sessions).to.equal(2);
    expect(summary.averageClarityRating).to.equal(3);
    expect(summary.tasks.inspect_attestation.completionRate).to.equal(1);
    expect(summary.tasks.evaluate_policy.completionRate).to.equal(0);
    expect(summary.incidentCount).to.equal(1);
    expect(JSON.stringify(summary)).not.to.include("session_0001");
    expect(JSON.stringify(summary)).not.to.include("private note");
  });
});
