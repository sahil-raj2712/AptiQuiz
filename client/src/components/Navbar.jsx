import React, { useState, useEffect } from "react";
import { Zap, Volume2, VolumeX, Shield, Trophy, Users, Laptop, HelpCircle } from "lucide-react";
import { sound } from "../utils/soundEngine";
import { getCurrentPing } from "../utils/socket";

export default function Navbar({ currentView, setView, onOpenRules, activeRoomCode }) {
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [ping, setPing] = useState(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(getCurrentPing());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="navbar-container" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 28px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(10, 13, 20, 0.8)",
      backdropFilter: "blur(14px)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <div 
        style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        onClick={() => setView("home")}
      >
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
        }}>
          <Zap size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.35rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
              Apti<span style={{ color: "var(--secondary)" }}>Quiz</span>
            </span>
            <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>
              <span className="pulse-dot"></span> Live Arena
            </span>
          </div>
          <span style={{ fontSize: "0.74rem", color: "var(--text-dim)", display: "block" }}>
            Multiplayer Placement Arena
          </span>
        </div>
      </div>

      {/* Nav Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button 
          className={`btn btn-sm ${currentView === "home" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setView("home")}
        >
          <Users size={16} /> Join Game
        </button>

        <button 
          className={`btn btn-sm ${currentView === "host" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setView("host")}
        >
          <Laptop size={16} /> Host Studio
        </button>

        <button 
          className={`btn btn-sm ${currentView === "league" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setView("league")}
        >
          <Trophy size={16} /> College League
        </button>

        {activeRoomCode && (
          <button 
            className={`btn btn-sm ${currentView === "spectator" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setView("spectator")}
            title="Projector / Auditorium Display"
          >
            📽️ Projector
          </button>
        )}

        <div style={{ height: "24px", width: "1px", background: "var(--border-subtle)", margin: "0 4px" }} />

        {/* Latency Fairness Pill */}
        <div 
          className="badge badge-indigo" 
          title="Network Delay Fairness is active. Client RTT compensated authoritatively by server."
          style={{ cursor: "help", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Shield size={12} />
          <span>{ping}ms Ping</span>
        </div>

        {/* Sound Toggle */}
        <button 
          onClick={handleToggleSound}
          className="btn btn-secondary btn-sm"
          style={{ padding: "8px 10px" }}
          title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
        >
          {isMuted ? <VolumeX size={16} color="var(--accent-rose)" /> : <Volume2 size={16} color="var(--accent-emerald)" />}
        </button>

        {/* Rules & Scoring */}
        <button 
          onClick={onOpenRules}
          className="btn btn-secondary btn-sm"
          style={{ padding: "8px 10px" }}
          title="Scoring Rules & Network Delay Fairness"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
}
