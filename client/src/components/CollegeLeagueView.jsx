import React, { useState, useEffect } from "react";
import { Trophy, Medal, Building2, User, Zap, Sparkles, TrendingUp, Filter, Search, RotateCcw } from "lucide-react";
import { socket } from "../utils/socket";

export default function CollegeLeagueView() {
  const [leagueData, setLeagueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLeague();

    // Listen for live league updates after any match concludes!
    const onLeagueUpdated = (data) => {
      if (data) {
        setLeagueData(data);
      }
    };

    socket.on("league_updated", onLeagueUpdated);
    return () => {
      socket.off("league_updated", onLeagueUpdated);
    };
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

  // Available colleges for filtering
  const availableColleges = [
    "ALL",
    ...new Set([
      "NIET",
      "GL BAJAJ",
      "AMITY",
      ...collegesList.map((c) => c.name),
      ...(leagueData?.topPlayers || []).map((p) => p.college)
    ])
  ];

  // Filter Hall of Fame candidates
  const allTopPlayers = leagueData?.topPlayers || [];
  const filteredPlayers = allTopPlayers.filter((player) => {
    const matchesCollege =
      selectedCollege === "ALL" ||
      player.college?.toLowerCase() === selectedCollege.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      player.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.college?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCollege && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1120px", margin: "40px auto", padding: "0 20px" }}>
      {/* League Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="badge badge-amber" style={{ marginBottom: "12px" }}>
          <Trophy size={14} /> Live Dynamic Collegiate Circuit
        </div>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "10px" }}>
          Inter-College Aptitude League
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "680px", margin: "0 auto" }}>
          Scores automatically update live after every multiplayer test. College rankings and candidate Hall of Fame dynamically adjust in real time!
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "32px" }}>
        {/* Left Column: Top Colleges Ranking */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <Building2 size={20} color="var(--primary)" /> Top Colleges Ranking
            </h2>
            <span className="badge badge-emerald" style={{ fontSize: "0.75rem" }}>
              Live Auto-Sync
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {collegesList.map((col, idx) => {
              const isSelected = selectedCollege === col.name;

              return (
                <div
                  key={col.name}
                  onClick={() => setSelectedCollege(isSelected ? "ALL" : col.name)}
                  className="card-glow"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    borderColor: isSelected
                      ? "var(--secondary)"
                      : idx === 0
                      ? "rgba(245, 158, 11, 0.4)"
                      : "var(--border-subtle)",
                    background: isSelected ? "rgba(6, 182, 212, 0.12)" : "var(--bg-card)",
                    transition: "all 0.15s ease"
                  }}
                  title="Click to filter Hall of Fame by this college"
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
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                        {col.name}
                        {isSelected && (
                          <span className="badge badge-indigo" style={{ fontSize: "0.68rem", padding: "2px 8px" }}>
                            Filtered
                          </span>
                        )}
                      </h3>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                        {col.matchesPlayed} Matches • Top Match: {col.topScore} pts
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
              );
            })}
          </div>
        </div>

        {/* Right Column: Student Hall of Fame with College Filter */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <Medal size={20} color="var(--accent-amber)" /> Student Hall of Fame
            </h2>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
              {selectedCollege === "ALL" ? "National Top Performers" : `Top Performers at ${selectedCollege}`}
            </span>
          </div>

          {/* College Filter Control */}
          <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                <Filter size={14} color="var(--secondary)" /> FILTER BY COLLEGE:
              </label>

              {selectedCollege !== "ALL" && (
                <button
                  onClick={() => setSelectedCollege("ALL")}
                  style={{ background: "none", border: "none", color: "var(--secondary)", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <RotateCcw size={12} /> Clear Filter
                </button>
              )}
            </div>

            {/* Quick College Filter Pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              {["ALL", "NIET", "GL BAJAJ", "AMITY", "IIT Bombay", "BITS Pilani"].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedCollege(col)}
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    borderRadius: "var(--radius-full)",
                    border: selectedCollege === col ? "2px solid var(--secondary)" : "1px solid var(--border-subtle)",
                    background: selectedCollege === col ? "rgba(6, 182, 212, 0.25)" : "rgba(255, 255, 255, 0.04)",
                    color: selectedCollege === col ? "#ffffff" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {col === "ALL" ? "🌐 All Colleges" : col}
                </button>
              ))}
            </div>

            {/* Dropdown for All Colleges + Search Input */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="input-field"
                style={{ background: "#0e1320", fontSize: "0.85rem", padding: "8px 12px" }}
              >
                <option value="ALL">🌐 All Colleges (National)</option>
                {availableColleges.filter((c) => c !== "ALL").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate..."
                  className="input-field"
                  style={{ fontSize: "0.85rem", padding: "8px 12px 8px 32px" }}
                />
                <Search size={14} color="var(--text-dim)" style={{ position: "absolute", left: "10px", top: "12px" }} />
              </div>
            </div>
          </div>

          {/* Filter Status Badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", padding: "0 4px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
              Showing <strong>{filteredPlayers.length}</strong> {selectedCollege === "ALL" ? "candidates nationwide" : `candidates from ${selectedCollege}`}
            </span>
          </div>

          {/* Filtered Candidates List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredPlayers.map((player, idx) => (
              <div
                key={`${player.name}-${player.college}-${idx}`}
                className="card-glow"
                style={{
                  padding: "14px 18px",
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
                    <h3 style={{ fontSize: "1.02rem", fontWeight: "700" }}>{player.name}</h3>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                      <strong style={{ color: "var(--secondary)" }}>{player.college}</strong> • {player.accuracy}% Accuracy • {player.matches} {player.matches === 1 ? "Match" : "Matches"}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.15rem", fontWeight: "900", fontFamily: "var(--font-mono)", color: "var(--accent-emerald)" }}>
                    {player.score.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", display: "block" }}>PTS</span>
                </div>
              </div>
            ))}

            {filteredPlayers.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "36px 20px",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-subtle)"
              }}>
                <Trophy size={32} color="var(--text-dim)" style={{ marginBottom: "8px" }} />
                <h4 style={{ fontSize: "1rem", color: "#cbd5e1", marginBottom: "4px" }}>
                  No Candidates Found for {selectedCollege}
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-dim)", maxWidth: "340px", margin: "0 auto" }}>
                  Play a match and select <strong>{selectedCollege}</strong> as your college to become the #1 champion on this leaderboard!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
