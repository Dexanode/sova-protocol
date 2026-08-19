const DEFAULT_ATTESTATION = "0x5c295500023335e9e7998c0a0ef635cf5aedf80d381c331838fdf65d3dc4a148";
const EXPECTED_SCHEMA = "0xa4fd4d46f668808d9c08e88f8c48ae38525e9089c3623e3425ac895128ffb526";

const form = document.getElementById("lookup-form");
const kind = document.getElementById("lookup-kind");
const value = document.getElementById("lookup-value");
const error = document.getElementById("lookup-error");
const result = document.getElementById("result-section");
const evaluateButton = document.getElementById("evaluate-button");
let currentAttestation = null;

function shortTime(seconds) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })
    .format(new Date(Number(seconds) * 1000));
}

function setFact(id, text) {
  document.getElementById(id).textContent = text;
}

function showAttestation(attestation) {
  currentAttestation = attestation;
  setFact("fact-attestation", attestation.attestationId);
  setFact("fact-issuer", attestation.issuer);
  setFact("fact-schema", attestation.schemaId);
  setFact("fact-subject", attestation.subjectId);
  setFact("fact-issued", shortTime(attestation.issuedAt));
  setFact("fact-expires", shortTime(attestation.expiresAt));
  const badge = document.getElementById("status-badge");
  badge.textContent = attestation.status;
  badge.className = `status-badge ${attestation.status === "ACTIVE" ? "active" : "inactive"}`;
  const indicator = document.getElementById("usable-indicator");
  indicator.className = attestation.usable ? "usable" : "";
  document.getElementById("usable-copy").textContent = attestation.usable
    ? "Current registry state marks this claim usable."
    : "Current registry state marks this claim unusable.";
  document.getElementById("policy-issuer").value = attestation.issuer;
  document.getElementById("decision").hidden = true;
  result.hidden = false;
}

async function lookup() {
  error.hidden = true;
  result.hidden = true;
  const identifier = value.value.trim();
  const endpoint = kind.value === "subject"
    ? `/v1/subjects/${encodeURIComponent(identifier)}/attestations?limit=20`
    : `/v1/attestations/${encodeURIComponent(identifier)}`;
  const response = await fetch(endpoint, { headers: { accept: "application/json" } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  if (kind.value === "subject") {
    if (!body.attestations.length) throw new Error("No indexed attestations found for this subject.");
    showAttestation(body.attestations[0]);
  } else {
    showAttestation(body);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await lookup();
  } catch (caught) {
    error.textContent = caught instanceof Error ? caught.message : "Lookup failed";
    error.hidden = false;
  }
});

kind.addEventListener("change", () => {
  value.placeholder = kind.value === "subject" ? "0x… subject ID" : "0x… attestation ID";
});

evaluateButton.addEventListener("click", async () => {
  if (!currentAttestation) return;
  const response = await fetch("/v1/evaluate", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      attestationId: currentAttestation.attestationId,
      policy: {
        schemaId: EXPECTED_SCHEMA,
        acceptedIssuers: [document.getElementById("policy-issuer").value.trim()],
        maxAgeSeconds: document.getElementById("policy-age").value,
        requireDisclosure: document.getElementById("policy-disclosure").checked,
      },
    }),
  });
  const body = await response.json();
  const decision = document.getElementById("decision");
  const title = document.getElementById("decision-title");
  const reasons = document.getElementById("decision-reasons");
  decision.hidden = false;
  if (!response.ok) {
    decision.className = "decision fail";
    title.textContent = "Policy error";
    reasons.textContent = body.error || `Request failed (${response.status})`;
    return;
  }
  decision.className = `decision ${body.accepted ? "pass" : "fail"}`;
  title.textContent = body.accepted ? "Policy accepted" : "Policy rejected";
  reasons.textContent = body.accepted ? "All explicit checks passed." : body.reasons.join(" · ");
});

async function boot() {
  try {
    const response = await fetch("/health");
    const health = await response.json();
    const label = document.getElementById("index-health");
    label.textContent = response.ok
      ? `${health.eventCount} events · block ${health.indexedThrough}`
      : "Index unavailable";
    if (response.ok) label.classList.add("ready");
  } catch {
    document.getElementById("index-health").textContent = "Index unavailable";
  }
  value.value = DEFAULT_ATTESTATION;
  value.placeholder = "0x… attestation ID";
  try {
    await lookup();
  } catch (caught) {
    error.textContent = caught instanceof Error ? caught.message : "Lookup failed";
    error.hidden = false;
  }
}

boot();
