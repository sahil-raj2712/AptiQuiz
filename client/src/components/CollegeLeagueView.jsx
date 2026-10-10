import React, { useState, useEffect } from "react";
import { Trophy, Medal, Building2, User, Zap, Sparkles, TrendingUp } from "lucide-react";

export default function CollegeLeagueView() {
  const [leagueData, setLeagueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeague();
  }, []);

  const fetchLeague = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/league");
      const data = await res.json();
      if (data?.league) {
        setLeagueData(data.league);
      }
    } catch (err) {
      console.error("Failed to load college league:", err);
    } finally {
      setLoading(false);
    }
  };

  const collegesList = leagueData?.colleges
    ? Object.entries(leagueData.colleges)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
    : [];

  const topPlayers = leagueData?.topPlayers || [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1080px", margin: "40px auto", padding: "0 20px" }}>
      {/* League Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="badge badge-amber" style={{ marginBottom: "12px" }}>
          <Trophy size={14} /> National Placement Circuit
        </div>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "10px" }}>
          Inter-College Aptitude League
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "600px", margin: "0 auto" }}>
          Every multiplayer match played across campus auditoriums feeds into the national collegiate leaderboard.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "32px" }}>
        {/* Top Colleges Standings */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <Building2 size={20} color="var(--primary)" /> Top Colleges Ranking
            </h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Aggregated Points</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {collegesList.map((col, idx) => (
              <div
                key={col.name}
                className="card-glow"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderColor: idx === 0 ? "rgba(245, 158, 11, 0.4)" : "var(--border-subtle)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{
                    fontSize: "1.1rem",
                    fontWeight: "900",
                    fontFamily: "var(--font-mono)",
                    color: idx === 0 ? "#f59e0b" : idx === 1 ? "#cbd5e1" : idx === 2 ? "#d97706" : "var(--text-dim)",
                    width: "28px"
                  }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{col.name}</h3>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                      {col.matchesPlayed} Matches Hosted • Top Match: {col.topScore} pts
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: "900", fontFamily: "var(--font-mono)", color: "var(--secondary)" }}>
                    {col.totalPoints.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block" }}>PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Individual Scorers Hall of Fame */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <Medal size={20} color="var(--accent-amber)" /> Student Hall of Fame
            </h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>National Top Performers</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topPlayers.map((player, idx) => (
              <div
                key={idx}
                className="card-glow"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{
                    fontSize: "1.1rem",
                    fontWeight: "900",
                    fontFamily: "var(--font-mono)",
                    color: idx === 0 ? "#f59e0b" : idx === 1 ? "#cbd5e1" : idx === 2 ? "#d97706" : "var(--text-dim)",
                    width: "28px"
                  }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{player.name}</h3>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                      {player.college} • {player.accuracy}% Accuracy
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: "900", fontFamily: "var(--font-mono)", color: "var(--accent-emerald)" }}>
                    {player.score.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "block" }}>PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
