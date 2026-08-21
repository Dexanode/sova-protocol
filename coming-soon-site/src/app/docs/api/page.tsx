"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Design tokens ── */
const BLUE   = "#3D6FFF";
const TXT    = "#0A0A0A";
const TXT2   = "#475569";
const TXT3   = "#94A3B8";
const BORDER = "1px solid rgba(0,0,0,0.08)";
const CARD   = "#F8FAFC";

export default function ApiDocsPage() {
  const [tab, setTab] = useState<"solidity" | "rest" | "sdk">("solidity");

  return (
    <div style={{ background: "#FFF", minHeight: "100vh", color: TXT, overflowX: "hidden" }}>
      
      {/* Header / Nav */}
      <header style={{ borderBottom: BORDER, background: "#FFF", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/assets/sova-gradient.png" alt="SOVA" style={{ height: 18, width: "auto" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: TXT3, textTransform: "uppercase", letterSpacing: "0.1em" }}>/ Docs / Query API</span>
          </Link>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/docs/architecture" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: TXT2, textDecoration: "none", fontWeight: 500 }}>
              Architecture Specs →
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
            DEVELOPER INTEGRATION & API SPECIFICATION
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
            Solidity & REST Query API
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: TXT2, lineHeight: 1.7, margin: 0, maxWidth: 680 }}>
            Integrate SOVA Protocol reputation queries directly into your Whitechain smart contracts via Solidity view calls or fetch registry-backed attestations via REST endpoints.
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 80px", display: "flex", flexDirection: "column", gap: 56 }}>

        {/* Mode Selector Tabs */}
        <div style={{ display: "flex", gap: 10, borderBottom: BORDER, paddingBottom: 16 }}>
          {[
            { id: "solidity", label: "Solidity Smart Contract (Onchain)" },
            { id: "rest",     label: "REST & OpenAPI 3.1 (Offchain)" },
            { id: "sdk",      label: "TypeScript SovaReadClient" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                padding: "8px 16px", borderRadius: 8, border: tab === t.id ? "1px solid rgba(61,111,255,0.3)" : BORDER,
                background: tab === t.id ? "rgba(61,111,255,0.08)" : "#FFF",
                color: tab === t.id ? BLUE : TXT2,
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Solidity Integration */}
        {tab === "solidity" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: "0 0 8px" }}>
                Solidity Onchain Query Interface
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
                Query attestation state directly inside your Whitechain smart contracts. The `SovaAttestationRegistry` provides gas-efficient view methods to verify subject scores, status enums, and expiration timestamps.
              </p>
            </div>

            {/* Solidity Interface snippet */}
            <div style={{ borderRadius: 16, border: "1px solid #1E293B", background: "#0F172A", padding: 24, color: "#E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: "var(--font-mono)", fontSize: 10, color: "#94A3B8" }}>
                <span>ISOVARegistry.sol</span>
                <span>Solidity v0.8.20</span>
              </div>
              <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, margin: 0, overflowX: "auto" }}>
                <code>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISOVARegistry {
    enum AttestationStatus {
        NONE,
        ACTIVE,
        EXPIRED,
        REVOKED,
        ISSUER_SUSPENDED,
        ISSUER_INACTIVE,
        ISSUER_REVOKED,
        SCHEMA_INACTIVE
    }

    struct AttestationView {
        bytes32 attestationId;
        bytes32 subjectId;
        bytes32 schemaId;
        bytes32 dataHash;
        address issuer;
        uint64 issuedAt;
        uint64 expiresAt;
        uint64 issuerEpoch;
        uint64 revokedAt;
        bytes32 revocationReason;
        AttestationStatus status;
        bool usable;
    }

    function getAttestationView(bytes32 attestationId) external view returns (AttestationView memory);
    function isUsable(bytes32 attestationId) external view returns (bool);
}`}</code>
              </pre>
            </div>

            {/* Example Usage Contract */}
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: "0 0 12px" }}>
                Example: Reputation-Aware Lending Pool
              </h3>
              <div style={{ borderRadius: 16, border: "1px solid #1E293B", background: "#0F172A", padding: 24, color: "#E2E8F0" }}>
                <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, margin: 0, overflowX: "auto" }}>
                  <code>{`contract WhitechainLendingPool {
    ISOVARegistry public immutable registry;

    constructor(address _registry) {
        registry = ISOVARegistry(_registry);
    }

    function getBorrowCollateralRatio(bytes32 attestationId) external view returns (uint256 ratioBps) {
        // 1. Authoritative check onchain
        require(registry.isUsable(attestationId), "SOVA: Attestation unusable or revoked");

        ISOVARegistry.AttestationView memory viewData = registry.getAttestationView(attestationId);
        
        // 2. Active status & expiration validation
        require(viewData.status == ISOVARegistry.AttestationStatus.ACTIVE, "SOVA: Not active");
        require(block.timestamp <= viewData.expiresAt, "SOVA: Attestation expired");

        // 3. Dynamic collateral ratio optimization (e.g. 110% vs 150%)
        return 11000; // 110% collateral for verified high-reputation souls
    }
}`}</code>
                </pre>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: REST & OpenAPI 3.1 */}
        {tab === "rest" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: "0 0 8px" }}>
                SOVA Read API (OpenAPI 3.1)
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
                The reference HTTP Query API provides high-speed indexed lookups backed by Node.js SQLite (`indexer-sync`), while automatically refreshing attestation status against the authoritative registry contract on every response.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  method: "GET", path: "/v1/subjects/{subjectId}/attestations",
                  desc: "Discover all attestations associated with a subject (WB Soul ID / wallet hash). Results are fetched from SQLite and refreshed through authoritative RPC.",
                  params: "subjectId (bytes32 hex), limit (default 50, max 100)",
                },
                {
                  method: "GET", path: "/v1/attestations/{attestationId}",
                  desc: "Read a single attestation view, including status enum (ACTIVE, EXPIRED, REVOKED, etc.) and boolean usable flag.",
                  params: "attestationId (bytes32 hex)",
                },
                {
                  method: "POST", path: "/v1/verify-disclosure",
                  desc: "Verify disclosed payload data and salt against an attestation commitment hash without leaking data onchain.",
                  params: "Body: { attestationId, encodedPayload, salt }",
                },
                {
                  method: "POST", path: "/v1/evaluate",
                  desc: "Evaluate current registry state against an explicit consumer policy (acceptedIssuers, maxAgeSeconds, requireDisclosure).",
                  params: "Body: { attestationId, policy: { acceptedIssuers, maxAgeSeconds, requireDisclosure } }",
                },
              ].map(ep => (
                <div key={ep.path} style={{ borderRadius: 14, border: BORDER, background: CARD, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, background: ep.method === "GET" ? "rgba(16,185,129,0.1)" : "rgba(61,111,255,0.1)", color: ep.method === "GET" ? "#10b981" : BLUE, padding: "4px 8px", borderRadius: 4 }}>
                      {ep.method}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: TXT }}>
                      {ep.path}
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: TXT2, margin: 0, lineHeight: 1.6 }}>{ep.desc}</p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: TXT3 }}>Parameters / Payload: {ep.params}</span>
                </div>
              ))}
            </div>

            {/* Example cURL */}
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: "0 0 10px" }}>Example cURL Query</h3>
              <div style={{ borderRadius: 14, border: "1px solid #1E293B", background: "#0F172A", padding: 20, color: "#38BDF8", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                curl -X GET &quot;https://api.sovaprotocol.xyz/v1/attestations/0x3a6c...f8e2&quot; -H &quot;Accept: application/json&quot;
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: TypeScript SDK */}
        {tab === "sdk" && (
          <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, margin: "0 0 8px" }}>
                TypeScript `SovaReadClient`
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: TXT2, lineHeight: 1.7, margin: 0 }}>
                The `@sova-protocol/sdk` package provides a type-safe client that performs direct contract reads via Ethers/Viem and locally verifies salted payload disclosures.
              </p>
            </div>

            <div style={{ borderRadius: 16, border: "1px solid #1E293B", background: "#0F172A", padding: 24, color: "#E2E8F0" }}>
              <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7, margin: 0, overflowX: "auto" }}>
                <code>{`import { SovaReadClient } from "@sova-protocol/sdk";
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc-testnet.whitechain.io");
const client = new SovaReadClient({
  registryAddress: "0x3A6c...f8e2",
  provider,
});

// Direct contract read with salted disclosure verification
const isVerified = await client.verifyDisclosure({
  attestationId: "0x...",
  encodedPayload: "0x...",
  salt: "0x...",
});

console.log("Disclosure Verified Onchain:", isVerified);`}</code>
              </pre>
            </div>
          </section>
        )}

        {/* Deployed Endpoints Table */}
        <section style={{ borderRadius: 18, border: BORDER, background: CARD, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, margin: 0 }}>Whitechain Sepolia Active Addresses</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "SovaAttestationRegistry", value: "0x3A6c...f8e2", link: "https://testnet.whitechain.io" },
              { label: "SovaTimelockMultisig",   value: "0x9B1d...a341", link: "https://testnet.whitechain.io" },
              { label: "SOVA Read API (Health)",  value: "http://127.0.0.1:3000/health", link: null },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#FFF", borderRadius: 8, border: BORDER }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600 }}>{row.label}</span>
                {row.link ? (
                  <a href={row.link} target="_blank" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: BLUE, textDecoration: "none" }}>{row.value} ↗</a>
                ) : (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: TXT2 }}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

    </div>
  );
}
