import React from "react";
import { X, Zap, Shield, Flame, CheckCircle2, Clock } from "lucide-react";

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div className="glass-panel" style={{
        maxWidth: "680px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "32px",
        position: "relative",
        border: "1px solid var(--border-highlight)"
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer"
          }}
        >
          <X size={22} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div className="badge badge-indigo">Official Tournament Rules</div>
          <span className="badge badge-emerald">Problem Statement #3</span>
        </div>

        <h2 style={{ fontSize: "1.75rem", marginBottom: "16px" }}>
          AptiQuiz Scoring & Fairness Architecture
        </h2>

        {/* Section 1: Speed + Accuracy Scoring */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Zap size={18} /> Speed + Accuracy Scoring Formula
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "10px" }}>
            Every correct answer yields up to <strong>1,000 base points</strong>:
          </p>
          <div style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.88rem",
            color: "#a5b4fc"
          }}>
            Score = (500 Base + (500 × Time_Remaining / Total_Time)) × Streak_Multiplier
          </div>
          <ul style={{ listStyle: "none", marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" /> 
              <span><strong>Base points:</strong> 500 for choosing the correct answer.</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} color="var(--secondary)" /> 
              <span><strong>Speed bonus:</strong> Up to 500 bonus points the faster you answer.</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Flame size={16} color="var(--accent-amber)" /> 
              <span><strong>Consecutive Streaks:</strong> Correct streaks give 1.1x, 1.2x up to 1.5x score multipliers.</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--accent-rose)", fontWeight: "bold" }}>✕</span> 
              <span><strong>Wrong Answers:</strong> 0 points (or -200 pts if host enabled negative marking). Resets streak.</span>
            </li>
          </ul>
        </div>

        {/* Section 2: Network Delay Fairness */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Shield size={18} /> Network Delay Fairness (Plain Words)
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: "1.6" }}>
            In live multiplayer tests, a student on a 20ms broadband connection shouldn't have an unfair advantage over a student on a 150ms 4G connection. 
          </p>
          <div style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            marginTop: "8px",
            fontSize: "0.88rem",
            color: "#e2e8f0"
          }}>
            <strong>How our Server Referee handles it:</strong><br/>
            The server measures each player's round-trip time (RTT) via periodic socket heartbeats. When calculating your answer speed, the server subtracts your estimated one-way network transit latency (<code style={{ color: "#a5b4fc" }}>RTT / 2</code>) from the arrival timestamp. Two students answering with identical cognitive reaction times on different internet speeds are rewarded with the exact same points.
          </div>
        </div>

        {/* Section 3: Anti-Cheat Protections */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            🛡️ Server-as-Referee Anti-Cheat
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            <li>• <strong>Option Shuffling:</strong> The arrangement of Options (A, B, C, D) is scrambled uniquely for every player socket. Looking at a neighbor's phone gives misleading keys.</li>
            <li>• <strong>Zero Early Leakage:</strong> The correct answer ID is held strictly in server memory and is never transmitted to the browser DOM before the countdown completes.</li>
            <li>• <strong>Late / Duplicate Lockout:</strong> Client device clocks are ignored. The authoritative server cutoff rejects duplicate submissions and late packets automatically.</li>
          </ul>
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={onClose}>
          Got it, Let's Play!
        </button>
      </div>
    </div>
  );
}
