import React, { useState } from "react";
import { ArrowRight, Sparkles, Users, Award, ShieldAlert, Cpu } from "lucide-react";
import { socket } from "../utils/socket";

const AVATARS = ["🚀", "⚡", "🔥", "🎯", "🧠", "🦁", "💎", "⭐"];
const POPULAR_COLLEGES = [
  "NIET", "GL BAJAJ", "AMITY",
  "IIT Bombay", "BITS Pilani", "NIT Trichy", "DTU Delhi", 
  "VIT Vellore", "IIIT Hyderabad", "COEP Pune", "RVCE Bangalore"
];

export default function JoinScreen({ onJoined, presetRoomCode = "" }) {
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const queryRoom = urlParams?.get("room") || urlParams?.get("code") || urlParams?.get("pin") || "";
  const [roomCode, setRoomCode] = useState(queryRoom || presetRoomCode || localStorage.getItem("aptiquiz_last_room") || "");
  const [name, setName] = useState(localStorage.getItem("aptiquiz_player_name") || "");
  const [college, setCollege] = useState(localStorage.getItem("aptiquiz_player_college") || "NIET");
  const [selectedAvatar, setSelectedAvatar] = useState("🚀");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = (e) => {
    e?.preventDefault();
    setError("");

    const cleanCode = roomCode.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError("Please enter a 6-character room PIN.");
      return;
    }
    if (!cleanName) {
      setError("Please enter your candidate name.");
      return;
    }

    setLoading(true);

    // Save preferences
    localStorage.setItem("aptiquiz_player_name", cleanName);
    localStorage.setItem("aptiquiz_player_college", college);
    localStorage.setItem("aptiquiz_last_room", cleanCode);

    // Generate persistent playerId if not existing
    let playerId = localStorage.getItem("aptiquiz_player_id");
    if (!playerId) {
      playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      localStorage.setItem("aptiquiz_player_id", playerId);
    }

    socket.emit("join_room", {
      roomCode: cleanCode,
      playerId,
      name: cleanName,
      college,
      avatar: selectedAvatar
    }, (res) => {
      setLoading(false);
      if (res?.success) {
        localStorage.setItem("aptiquiz_room_code", cleanCode);
        onJoined({
          room: res.room,
          player: res.player,
          isHost: false
        });
      } else {
        setError(res?.message || "Failed to join room. Please check the code.");
      }
    });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1080px", margin: "40px auto", padding: "0 20px" }}>
      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="badge badge-cyan" style={{ marginBottom: "16px" }}>
          <Sparkles size={14} /> Competitive Aptitude Esports
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", lineHeight: 1.15, marginBottom: "16px" }}>
          Race 50 Peers in Real-Time.<br />
          <span style={{ 
            background: "linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent" 
          }}>
            Crush the Placement Filter.
          </span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "620px", margin: "0 auto" }}>
          Say goodbye to boring solo PDFs. Battle up to 50 students live under real company test pressure with dynamic speed-accuracy leaderboards.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
        {/* Main Join Card */}
        <div className="glass-panel" style={{ padding: "32px", border: "1px solid var(--border-highlight)" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
            <Cpu size={22} color="var(--primary)" /> Enter Match Arena
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "24px" }}>
            Enter the 6-character PIN shown on the host or projector screen.
          </p>

          {error && (
            <div style={{
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              color: "#fecdd3",
              fontSize: "0.88rem",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Room Code */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", color: "#cbd5e1" }}>
                ROOM PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. 5N6ZGF"
                className="input-field"
                style={{
                  fontSize: "1.6rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: "700",
                  letterSpacing: "4px",
                  textAlign: "center",
                  textTransform: "uppercase"
                }}
              />
            </div>

            {/* Candidate Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", color: "#cbd5e1" }}>
                YOUR CANDIDATE NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="input-field"
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "8px", color: "#cbd5e1" }}>
                CHOOSE AVATAR
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    style={{
                      width: "44px",
                      height: "44px",
                      fontSize: "1.3rem",
                      borderRadius: "var(--radius-sm)",
                      border: selectedAvatar === av ? "2px solid var(--secondary)" : "1px solid var(--border-subtle)",
                      background: selectedAvatar === av ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                      transform: selectedAvatar === av ? "scale(1.1)" : "scale(1)"
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* College Selection */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", color: "#cbd5e1" }}>
                COLLEGE / INSTITUTION (FOR LEAGUE TABLE)
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="input-field"
                style={{ background: "#0e1320", color: "#f8fafc" }}
              >
                {POPULAR_COLLEGES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ marginTop: "8px", width: "100%" }}
            >
              {loading ? "Joining Arena..." : (
                <>Enter Match Lobby <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        {/* Feature & Rules Info Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card-glow" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.15)" }}>
                <Users size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: "1.1rem" }}>50-Player Synchronized Rooms</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: "1.5" }}>
              Battle classmates in massive lobbies. The authoritative server clock synchronizes question reveals down to the millisecond across mobile and desktop.
            </p>
          </div>

          <div className="card-glow" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(6, 182, 212, 0.15)" }}>
                <Sparkles size={20} color="var(--secondary)" />
              </div>
              <h3 style={{ fontSize: "1.1rem" }}>Speed & Accuracy Scoring</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: "1.5" }}>
              Score up to 1,000 points per question. Faster correct answers unlock high speed bonuses and consecutive streak multipliers up to 1.5x.
            </p>
          </div>

          <div className="card-glow" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)" }}>
                <Award size={20} color="var(--accent-emerald)" />
              </div>
              <h3 style={{ fontSize: "1.1rem" }}>Inter-College League Standings</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: "1.5" }}>
              Represent your university. Every round played feeds into national college rankings and the student placement hall of fame.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
