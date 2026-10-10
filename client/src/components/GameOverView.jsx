import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Download, Award, Target, Flame, RotateCcw, BarChart3 } from "lucide-react";
import { sound } from "../utils/soundEngine";

export default function GameOverView({ gameOverData, room, player, onPlayAgain, onViewLeague }) {
  useEffect(() => {
    // Triumphant fanfare
    sound.playFanfare();

    // Fire fireworks confetti
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleDownloadCSV = () => {
    window.open(`/api/rooms/${room.code}/export`, "_blank");
  };

  const podium = gameOverData?.podium || [];
  const leaderboard = gameOverData?.leaderboard || [];
  const myEntry = leaderboard.find(p => p.id === player?.id);

  // Topic analysis
  const topicStats = myEntry?.topicStats || {};

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1020px", margin: "36px auto", padding: "0 20px" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div className="badge badge-amber" style={{ marginBottom: "12px" }}>
          Tournament Final Standings
        </div>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "8px" }}>
          Campus Arena Champions
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
          {room.title} • Hosted by {room.hostCollege}
        </p>
      </div>

      {/* Podium Celebration: 2nd, 1st, 3rd */}
      {podium.length > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: "18px",
          marginBottom: "48px",
          flexWrap: "wrap"
        }}>
          {/* 2nd Place */}
          {podium[1] && (
            <div className="glass-panel" style={{
              width: "220px",
              padding: "24px 16px",
              textAlign: "center",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              background: "rgba(15, 23, 42, 0.8)",
              transform: "translateY(16px)"
            }}>
              <span style={{ fontSize: "2.4rem", display: "block", marginBottom: "6px" }}>🥈</span>
              <span style={{ fontSize: "1.4rem" }}>{podium[1].avatar}</span>
              <h3 style={{ fontSize: "1.1rem", marginTop: "4px" }}>{podium[1].name}</h3>
              <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "block" }}>{podium[1].college}</span>
              <div style={{ marginTop: "12px", fontWeight: "800", color: "#cbd5e1", fontSize: "1.2rem" }}>
                {podium[1].score} pts
              </div>
            </div>
          )}

          {/* 1st Place Champion */}
          {podium[0] && (
            <div className="glass-panel" style={{
              width: "260px",
              padding: "36px 20px",
              textAlign: "center",
              border: "2px solid #f59e0b",
              background: "linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)",
              boxShadow: "0 0 40px rgba(245, 158, 11, 0.35)",
              zIndex: 2
            }}>
              <span style={{ fontSize: "3.2rem", display: "block", marginBottom: "6px" }}>👑</span>
              <span style={{ fontSize: "2rem" }}>{podium[0].avatar}</span>
              <h2 style={{ fontSize: "1.4rem", marginTop: "6px", color: "#fef08a" }}>{podium[0].name}</h2>
              <span style={{ fontSize: "0.85rem", color: "#fcd34d", display: "block" }}>{podium[0].college}</span>
              <div style={{ marginTop: "16px", fontWeight: "900", color: "#fef08a", fontSize: "1.6rem" }}>
                {podium[0].score} pts
              </div>
              <span className="badge badge-amber" style={{ marginTop: "8px" }}>
                Tournament Winner
              </span>
            </div>
          )}

          {/* 3rd Place */}
          {podium[2] && (
            <div className="glass-panel" style={{
              width: "220px",
              padding: "24px 16px",
              textAlign: "center",
              border: "1px solid rgba(217, 119, 6, 0.3)",
              background: "rgba(15, 23, 42, 0.8)",
              transform: "translateY(24px)"
            }}>
              <span style={{ fontSize: "2.4rem", display: "block", marginBottom: "6px" }}>🥉</span>
              <span style={{ fontSize: "1.4rem" }}>{podium[2].avatar}</span>
              <h3 style={{ fontSize: "1.1rem", marginTop: "4px" }}>{podium[2].name}</h3>
              <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "block" }}>{podium[2].college}</span>
              <div style={{ marginTop: "12px", fontWeight: "800", color: "#fdba74", fontSize: "1.2rem" }}>
                {podium[2].score} pts
              </div>
            </div>
          )}
        </div>
      )}

      {/* Candidate Personal Analytics Breakdown */}
      {myEntry && (
        <div className="glass-panel" style={{ padding: "32px", marginBottom: "36px" }}>
          <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <Award size={22} color="var(--primary)" /> Your Performance Analytics Card
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>FINAL RANK</span>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "var(--secondary)" }}>#{myEntry.rank}</div>
            </div>

            <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>TOTAL SCORE</span>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "#f8fafc" }}>{myEntry.score}</div>
            </div>

            <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>OVERALL ACCURACY</span>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "var(--accent-emerald)" }}>{myEntry.accuracy}%</div>
            </div>

            <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>BEST STREAK</span>
              <div style={{ fontSize: "2rem", fontWeight: "900", color: "var(--accent-amber)" }}>{myEntry.highestStreak}x 🔥</div>
            </div>
          </div>

          {/* Topic Strengths Breakdown */}
          {Object.keys(topicStats).length > 0 && (
            <div>
              <h3 style={{ fontSize: "1rem", color: "#cbd5e1", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Target size={16} /> Placement Topic Strengths & Weaknesses:
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                {Object.entries(topicStats).map(([topic, stat]) => {
                  const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                  return (
                    <div key={topic} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 16px", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                        <span>{topic}</span>
                        <span style={{ fontWeight: "700", color: pct >= 70 ? "var(--accent-emerald)" : pct >= 40 ? "var(--accent-amber)" : "var(--accent-rose)" }}>
                          {pct}% ({stat.correct}/{stat.total})
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.4)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: pct >= 70 ? "var(--accent-emerald)" : pct >= 40 ? "var(--accent-amber)" : "var(--accent-rose)"
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "40px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-primary" onClick={onPlayAgain}>
            <RotateCcw size={16} /> Join Another Room
          </button>
          <button className="btn btn-secondary" onClick={onViewLeague}>
            <Trophy size={16} /> College League Standings
          </button>
        </div>

        {/* Faculty CSV Export */}
        <button
          onClick={handleDownloadCSV}
          className="btn btn-secondary"
          style={{ borderColor: "var(--border-highlight)" }}
          title="Download complete placement room report as CSV"
        >
          <Download size={16} color="var(--secondary)" /> Export Faculty Analytics (CSV)
        </button>
      </div>
    </div>
  );
}
