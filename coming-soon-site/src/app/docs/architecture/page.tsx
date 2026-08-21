"use client";

import Link from "next/link";

/* ── Design tokens ── */
const BLUE   = "#3D6FFF";
const TXT    = "#0A0A0A";
const TXT2   = "#475569";
const TXT3   = "#94A3B8";
const BORDER = "1px solid rgba(0,0,0,0.08)";
const CARD   = "#F8FAFC";

export default function ArchitectureDocsPage() {
  return (
    <div style={{ background: "#FFF", minHeight: "100vh", color: TXT, overflowX: "hidden" }}>
      
      {/* Header / Nav */}
      <header style={{ borderBottom: BORDER, background: "#FFF", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/assets/sova-gradient.png" alt="SOVA" style={{ height: 18, width: "auto" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: TXT3, textTransform: "uppercase", letterSpacing: "0.1em" }}>/ Docs / Architecture</span>
          </Link>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT2, textDecoration: "none", fontWeight: 500 }}>
              ← Back to Main Site
            </Link>
            <a href="https://github.com/Dexanode/sova-protocol" target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: BLUE, textDecoration: "none", background: "rgba(61,111,255,0.08)", padding: "6px 12px", borderRadius: 6, fontWeight: 700 }}>
              GitHub Repo ↗
            </a>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div style={{ borderBottom: BORDER, background: CARD, padding: "56px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            TECHNICAL SPECIFICATION & SYSTEM ARCHITECTURE
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
            SOVA Protocol Architecture
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: TXT2, lineHeight: 1.7, margin: 0, maxWidth: 680 }}>
            A comprehensive guide to SOVA Protocol&#39;s trust boundaries, smart contract registry, salted cryptographic attestations, SQLite event indexer, and Whitechain dApp integration paths.
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 80px", display: "flex", flexDirection: "column", gap: 56 }}>

        {/* 1. Overview */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: 0, borderBottom: BORDER, paddingBottom: 12 }}>
            1. Overview & Ecosystem Position
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
            SOVA Protocol operates as the **verifiable reputation layer** for Whitechain L2. While WhiteBIT and WB Soul provide the foundation for identity verification (Who is this user?), SOVA evaluates onchain behavior (How has this identity performed?) and publishes machine-readable scores directly onto Whitechain Sepolia.
          </p>
          <div style={{ borderRadius: 14, border: BORDER, background: CARD, padding: 24, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.8, color: "#334155" }}>
            <div style={{ color: BLUE, fontWeight: 700, marginBottom: 8, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>ECOSYSTEM STACK PIPELINE</div>
            WhiteBIT (5M+ Users) ➔ Whitechain (Distribution L2) ➔ WB Soul (Identity Anchor) ➔ <strong>SOVA Engine (Reputation Primitive)</strong> ➔ Whitechain dApps
          </div>
        </section>

        {/* 2. Trust Boundaries & Key Isolation */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: 0, borderBottom: BORDER, paddingBottom: 12 }}>
            2. Trust Boundaries & Isolated Signing (Phase 1.3)
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
            To protect attestation integrity, the pilot architecture strictly separates three processes so that private keys are never exposed to untrusted environments or request files:
          </p>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 8 }}>
            {[
              { step: "01. Preparer", title: "Unsigned Request", desc: "Creates synthetic disclosures, random salts, and commitment hashes without access to any private keys." },
              { step: "02. Issuer Signer", title: "EIP-712 Signer", desc: "Validates disclosures via encrypted keystore, refreshes timestamps, and signs exact EIP-712 requests." },
              { step: "03. Relayer", title: "Untrusted Submitter", desc: "Recovers signer from signature, checks skew (<240s), and submits `attestBySig` without ability to alter fields." },
            ].map(box => (
              <div key={box.step} style={{ padding: 20, borderRadius: 12, border: BORDER, background: CARD, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: BLUE, fontWeight: 700 }}>{box.step}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>{box.title}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT2, lineHeight: 1.5 }}>{box.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Smart Contracts */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: 0, borderBottom: BORDER, paddingBottom: 12 }}>
            3. Onchain Smart Contracts (Whitechain Sepolia)
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
            The protocol is governed by three primary smart contracts deployed and verified on Whitechain Sepolia (Chain ID 1875):
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "SovaAttestationRegistry.sol", addr: "0x3A6c...f8e2", role: "Authoritative storage for salted attestation hashes, score commitments, and getScore(soulId) query views." },
              { name: "SovaTimelockMultisig.sol",   addr: "0x9B1d...a341", role: "Timelocked multi-signature governance controlling registry parameters, issuer permissions, and emergency pauses." },
              { name: "SovaNetworkProof.sol",       addr: "0xC2f4...8b09", role: "Verifies EIP-712 ECDSA proofs and relay authorizations from trusted Pilot Issuers." },
            ].map(c => (
              <div key={c.name} style={{ padding: "18px 22px", borderRadius: 12, border: BORDER, background: CARD, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: TXT }}>{c.name}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT2 }}>{c.role}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: BLUE, background: "#FFF", padding: "6px 12px", borderRadius: 6, border: BORDER }}>
                  {c.addr}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Privacy & Salted Attestation */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: 0, borderBottom: BORDER, paddingBottom: 12 }}>
            4. Privacy & Salted Cryptographic Attestations
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
            Raw transaction logs, individual loan balances, and sensitive financial metrics remain <strong>100% offchain</strong> in local SQLite indexes. Only salted cryptographic commitment hashes are written onchain:
          </p>

          <div style={{ borderRadius: 14, border: "1px solid #1E293B", background: "#0F172A", padding: 24, color: "#E2E8F0" }}>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              <code>{`// Commitment Formula
bytes32 commitment = keccak256(
    abi.encodePacked(soulId, rawMetricsHash, salt, nonce)
);

// Onchain Verification
function verifyAttestation(
    uint256 soulId, 
    bytes32 rawMetricsHash, 
    bytes32 salt
) external view returns (bool) {
    return registry.commitments(soulId) == keccak256(abi.encodePacked(soulId, rawMetricsHash, salt));
}`}</code>
            </pre>
          </div>
        </section>

        {/* 5. Persistent Indexer & Query API */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: 0, borderBottom: BORDER, paddingBottom: 12 }}>
            5. Persistent Indexer & Query Service (Phase 1.2)
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
            The Node.js indexer syncs registry logs into a local SQLite database (`indexer-data/whitechain-sepolia.sqlite`). Each sync automatically rewinds 20 blocks to purge reorganized events, fetches in 5,000-block chunks, and transactionally rebuilds projections.
          </p>
          <div style={{ borderRadius: 12, border: BORDER, background: CARD, padding: 20, fontFamily: "var(--font-mono)", fontSize: 12, color: TXT2, lineHeight: 1.8 }}>
            <div>• <strong>Reorg Safety:</strong> 20-block automatic rewind window</div>
            <div>• <strong>Data Storage:</strong> Local Node.js experimental SQLite module</div>
            <div>• <strong>Authoritative Validation:</strong> Every query result is re-checked against SovaAttestationRegistry onchain state before returning.</div>
          </div>
        </section>

        {/* 6. Observability & Limits */}
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: 0, borderBottom: BORDER, paddingBottom: 12 }}>
            6. Observability & Rate Limiting Controls (Phase 1.5)
          </h2>
          <ul style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: TXT2, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
            <li><strong>X-Request-Id:</strong> Traced on every API request; request bodies & salts are never logged.</li>
            <li><strong>Health Endpoint (/health):</strong> Returns HTTP 503 if indexer lag exceeds `SOVA_MAX_INDEX_LAG_BLOCKS` or SQLite integrity check fails.</li>
            <li><strong>Rate Limiting (/v1/*):</strong> 60 requests per minute per socket connection, returning HTTP 429 Retry-After.</li>
            <li><strong>Metrics (/metrics):</strong> Exposes Prometheus-formatted counters for confirmed index lag without exposing subject addresses.</li>
          </ul>
        </section>

        {/* Footer Link Callout */}
        <div style={{ borderRadius: 16, border: "1px solid rgba(61,111,255,0.2)", background: "rgba(61,111,255,0.04)", padding: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 4 }}>Ready to integrate?</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: TXT2 }}>Explore the smart contract codebase on GitHub.</div>
          </div>
          <a href="https://github.com/Dexanode/sova-protocol" target="_blank" style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "#FFF", background: BLUE, padding: "10px 20px", borderRadius: 8, textDecoration: "none" }}>
            View GitHub Repository ↗
          </a>
        </div>

      </main>

    </div>
  );
}
