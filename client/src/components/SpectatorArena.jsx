import React, { useState, useEffect } from "react";
import { Users, Clock, Zap, Maximize, Trophy } from "lucide-react";
import { socket } from "../utils/socket";

export default function SpectatorArena({ room, onExit }) {
  const [activeQ, setActiveQ] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    const onHostQ = (data) => {
      setActiveQ(data);
      setTimeLeft(data.timeLimitSeconds || 25);
      setRoundResult(null);
    };

    const onAnswerUpdate = ({ totalAnswered, totalPlayers: total }) => {
      setAnsweredCount(totalAnswered);
      setTotalPlayers(total);
    };

    const onHostResolved = (data) => {
      setRoundResult(data);
    };

    socket.on("host_question_active", onHostQ);
    socket.on("answer_submitted_update", onAnswerUpdate);
    socket.on("host_round_resolved", onHostResolved);

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timer);
      socket.off("host_question_active", onHostQ);
      socket.off("answer_submitted_update", onAnswerUpdate);
      socket.off("host_round_resolved", onHostResolved);
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07090e",
      color: "#f8fafc",
      padding: "32px 48px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* Top Projector Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="badge badge-emerald" style={{ fontSize: "1rem", padding: "8px 16px" }}>
            📽️ AUDITORIUM PROJECTOR MODE
          </div>
          <span style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>
            Room: <strong style={{ color: "#ffffff", fontFamily: "var(--font-mono)" }}>{room?.code}</strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem" }}>
            <Users size={22} color="var(--secondary)" />
            <span><strong>{answeredCount}</strong> / {totalPlayers || 50} Locked In</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onExit}>
            Exit Projector
          </button>
        </div>
      </div>

      {/* Main Screen Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "40px 0" }}>
        {roundResult ? (
          // Round Review on Projector
          <div className="animate-fade-in" style={{ textAlign: "center" }}>
            <div className="badge badge-indigo" style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
              Round {roundResult.questionIndex + 1} Top Leaderboard
            </div>
            <h1 style={{ fontSize: "3.5rem", marginBottom: "32px" }}>
              Live Standings
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", maxWidth: "900px", margin: "0 auto" }}>
              {roundResult.leaderboard.slice(0, 5).map((p) => (
                <div key={p.id} className="card-glow" style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: "900", fontFamily: "var(--font-mono)", color: "var(--accent-amber)" }}>#{p.rank}</span>
                    <span style={{ fontSize: "1.6rem" }}>{p.avatar}</span>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: "700", display: "block" }}>{p.name}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>{p.college}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--secondary)", fontFamily: "var(--font-mono)" }}>
                    {p.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : activeQ ? (
          // Active Question on Projector
          <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span className="badge badge-cyan" style={{ fontSize: "1rem", padding: "6px 14px" }}>
                {activeQ.topic} • Question {activeQ.questionIndex + 1} of {activeQ.totalQuestions}
              </span>
              <div style={{
                background: timeLeft > 5 ? "var(--accent-emerald)" : "var(--accent-rose)",
                color: "#ffffff",
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                fontSize: "1.8rem",
                fontWeight: "900",
                fontFamily: "var(--font-mono)"
              }}>
                ⏱️ {timeLeft}s
              </div>
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 3.8vw, 3rem)", lineHeight: "1.3", marginBottom: "32px" }}>
              {activeQ.question}
            </h1>

            {/* Options Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {activeQ.options.map((opt, idx) => (
                <div key={opt.id} className="card-glow" style={{ padding: "24px 32px", display: "flex", alignItems: "center", gap: "18px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(99, 102, 241, 0.2)",
                    color: "var(--secondary)",
                    fontSize: "1.4rem",
                    fontWeight: "900",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ fontSize: "1.4rem", fontWeight: "600" }}>{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <h2 style={{ fontSize: "2.4rem", marginBottom: "16px" }}>Auditorium Arena Ready</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>
              Host will launch questions to all 50 candidates from the Host Control Studio.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.9rem" }}>
        AptiQuiz Live Arena • Server-Synchronized Millisecond Clock Referee
      </div>
    </div>
  );
}
