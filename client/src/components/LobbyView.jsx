import React, { useState, useEffect } from "react";
import { Users, Copy, Check, Play, QrCode, Shield, Sparkles } from "lucide-react";
import { socket } from "../utils/socket";
import { sound } from "../utils/soundEngine";

export default function LobbyView({ room, player, isHost, onGameStarted }) {
  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // Listen for player list updates
    const onPlayerList = (data) => {
      if (data?.players) {
        setPlayers(data.players);
      }
    };

    const onCountdownStart = ({ countdown: count }) => {
      setCountdown(count);
      sound.playTick();
    };

    const onCountdownTick = ({ countdown: count }) => {
      setCountdown(count);
      sound.playTick();
    };

    const onQuestionStart = (data) => {
      onGameStarted(data);
    };

    socket.on("player_list_update", onPlayerList);
    socket.on("game_countdown_start", onCountdownStart);
    socket.on("game_countdown_tick", onCountdownTick);
    socket.on("question_start", onQuestionStart);

    return () => {
      socket.off("player_list_update", onPlayerList);
      socket.off("game_countdown_start", onCountdownStart);
      socket.off("game_countdown_tick", onCountdownTick);
      socket.off("question_start", onQuestionStart);
    };
  }, [onGameStarted]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    socket.emit("host_start_game", { roomCode: room.code }, (res) => {
      if (!res?.success) {
        alert(res?.message || "Failed to start match.");
      }
    });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
      {/* Countdown Overlay when match starts */}
      {countdown !== null && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(7, 9, 14, 0.9)",
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <span style={{ fontSize: "1.2rem", color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "16px" }}>
            Match Begins In
          </span>
          <div style={{
            fontSize: "9rem",
            fontWeight: "900",
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #ffffff 0%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 50px rgba(99, 102, 241, 0.8)",
            animation: "pulseDot 1s infinite"
          }}>
            {countdown}
          </div>
          <span style={{ fontSize: "1.1rem", color: "var(--text-muted)", marginTop: "16px" }}>
            Get your fingers ready! Shuffling options...
          </span>
        </div>
      )}

      {/* Lobby Header Card */}
      <div className="glass-panel" style={{ padding: "36px", textAlign: "center", marginBottom: "32px", border: "1px solid var(--border-highlight)" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
          <span className="badge badge-indigo">{room.hostCollege}</span>
          <span className="badge badge-emerald">
            <Users size={13} /> {players.length} / 50 Players
          </span>
        </div>

        <h1 style={{ fontSize: "2.2rem", marginBottom: "8px" }}>
          {room.title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "24px" }}>
          Share this PIN with candidates. They can join from any phone or laptop browser.
        </p>

        {/* Room PIN Display */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "18px",
          background: "rgba(0, 0, 0, 0.4)",
          border: "2px solid var(--border-highlight)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 36px",
          marginBottom: "24px",
          boxShadow: "0 0 30px rgba(99, 102, 241, 0.25)"
        }}>
          <div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "2px", display: "block" }}>
              ROOM PIN
            </span>
            <span style={{ fontSize: "3rem", fontWeight: "900", fontFamily: "var(--font-mono)", letterSpacing: "6px", color: "#ffffff" }}>
              {room.code}
            </span>
          </div>

          <button
            onClick={copyRoomCode}
            className="btn btn-secondary btn-sm"
            style={{ padding: "10px 14px", height: "fit-content" }}
            title="Copy Room PIN"
          >
            {copied ? <><Check size={16} color="var(--accent-emerald)" /> Copied</> : <><Copy size={16} /> Copy PIN</>}
          </button>
        </div>

        {/* Action Button */}
        <div>
          {isHost ? (
            <button
              onClick={handleStartGame}
              className="btn btn-emerald btn-lg"
              style={{ padding: "16px 48px", fontSize: "1.2rem", boxShadow: "0 0 30px var(--accent-emerald-glow)" }}
            >
              <Play size={22} /> Start Placement Match ({players.length} Joined)
            </button>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", color: "var(--secondary)", background: "rgba(6, 182, 212, 0.1)", padding: "12px 24px", borderRadius: "var(--radius-full)" }}>
              <span className="pulse-dot"></span>
              <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                Waiting for host to start the countdown...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Connected Candidates Roster */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={20} color="var(--primary)" /> Joined Candidates ({players.length})
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Real-time WebSocket presence
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: "14px"
        }}>
          {players.map((p) => (
            <div
              key={p.id}
              className="card-glow"
              style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: p.id === player?.id ? "1px solid var(--secondary)" : "1px solid var(--border-subtle)",
                background: p.id === player?.id ? "rgba(6, 182, 212, 0.12)" : "var(--bg-card)"
              }}
            >
              <span style={{ fontSize: "1.7rem" }}>{p.avatar}</span>
              <div style={{ overflow: "hidden" }}>
                <span style={{ fontWeight: "600", fontSize: "0.95rem", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name} {p.id === player?.id && "(You)"}
                </span>
                <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.college}
                </span>
              </div>
            </div>
          ))}

          {players.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
              No candidates in lobby yet. Share the code <strong>{room.code}</strong> to let students join!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
