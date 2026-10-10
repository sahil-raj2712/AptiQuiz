import React, { useState, useEffect } from "react";
import { Clock, Zap, Flame, Sparkles, CheckCircle, HelpCircle, Shield, AlertTriangle } from "lucide-react";
import { socket } from "../utils/socket";
import { sound } from "../utils/soundEngine";

export default function ArenaView({ questionData, room, player, onRoundResolved }) {
  const [timeLeft, setTimeLeft] = useState(questionData.timeLimitSeconds || 20);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isLocked, setIsLocked] = useState(questionData.hasAnswered || false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [is2XActive, setIs2XActive] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(1);
  const [streak, setStreak] = useState(player?.streak || 0);

  const totalDuration = questionData.timeLimitSeconds || 20;

  useEffect(() => {
    // Reset state for new question
    setTimeLeft(totalDuration);
    setSelectedOptionId(null);
    setIsLocked(questionData.hasAnswered || false);
    setEliminatedOptions([]);
    setIs2XActive(false);

    // Synchronized countdown interval
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        if (prev <= 5) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    // Socket listener for live answered count
    const onAnswerUpdate = ({ totalAnswered, totalPlayers: total }) => {
      setAnsweredCount(totalAnswered);
      setTotalPlayers(total);
    };

    const onResolved = (result) => {
      clearInterval(timer);
      onRoundResolved(result);
    };

    socket.on("answer_submitted_update", onAnswerUpdate);
    socket.on("round_resolved", onResolved);

    return () => {
      clearInterval(timer);
      socket.off("answer_submitted_update", onAnswerUpdate);
      socket.off("round_resolved", onResolved);
    };
  }, [questionData, totalDuration, onRoundResolved]);

  const handleSelectOption = (optId) => {
    if (isLocked || timeLeft <= 0 || eliminatedOptions.includes(optId)) return;

    setSelectedOptionId(optId);
    setIsLocked(true);
    sound.playTick();

    socket.emit("submit_answer", {
      roomCode: room.code,
      playerId: player.id,
      optionId: optId
    }, (res) => {
      if (!res?.success) {
        console.warn("Answer rejected by referee:", res?.message);
      }
    });
  };

  const handleUsePowerUp = (type) => {
    if (isLocked || timeLeft <= 0) return;

    socket.emit("use_power_up", {
      roomCode: room.code,
      playerId: player.id,
      type
    }, (res) => {
      if (res?.success) {
        sound.playPowerUp();
        if (type === "fifty_fifty" && res.eliminatedOptionIds) {
          setEliminatedOptions(res.eliminatedOptionIds);
        } else if (type === "two_x") {
          setIs2XActive(true);
        }
      } else {
        alert(res?.message || "Power-up unavailable");
      }
    });
  };

  // Timer percentage and dynamic color
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
  const timerColor = timeLeft > 10 ? "var(--accent-emerald)" : timeLeft > 5 ? "var(--accent-amber)" : "var(--accent-rose)";

  return (
    <div className="animate-fade-in" style={{ maxWidth: "980px", margin: "24px auto", padding: "0 16px" }}>
      {/* Top Arena Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        {/* Question Counter & Topic */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="badge badge-indigo" style={{ fontSize: "0.85rem" }}>
            Question {questionData.questionIndex + 1} of {questionData.totalQuestions}
          </span>
          <span className="badge badge-cyan">
            {questionData.topic}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            • {questionData.difficulty}
          </span>
        </div>

        {/* Player Score & Streak */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {streak > 1 && (
            <div className="badge badge-amber" style={{ animation: "pulseDot 1.5s infinite" }}>
              <Flame size={14} /> {streak}x Streak (+{Math.min(streak * 10, 50)}% pts)
            </div>
          )}
          {is2XActive && (
            <div className="badge badge-cyan" style={{ boxShadow: "0 0 15px var(--secondary)" }}>
              <Zap size={14} /> 2X Multiplier Active!
            </div>
          )}
          <div style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid var(--border-subtle)",
            padding: "6px 14px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.95rem",
            fontWeight: "700"
          }}>
            Score: <span style={{ color: "var(--secondary)" }}>{player?.score || 0}</span>
          </div>
        </div>
      </div>

      {/* Synchronized Countdown Bar */}
      <div style={{
        width: "100%",
        height: "8px",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "24px",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)"
      }}>
        <div style={{
          height: "100%",
          width: `${timerPercent}%`,
          background: timerColor,
          transition: "width 1s linear, background-color 0.5s ease",
          boxShadow: `0 0 12px ${timerColor}`
        }} />
      </div>

      {/* Main Question Card */}
      <div className="glass-panel" style={{ padding: "32px", marginBottom: "24px", position: "relative" }}>
        {/* Floating Timer Badge */}
        <div style={{
          position: "absolute",
          top: "-16px",
          right: "24px",
          background: timerColor,
          color: "#ffffff",
          fontWeight: "800",
          fontFamily: "var(--font-mono)",
          fontSize: "1.2rem",
          padding: "6px 16px",
          borderRadius: "var(--radius-full)",
          boxShadow: `0 4px 16px ${timerColor}`,
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <Clock size={16} /> {timeLeft}s
        </div>

        {/* Subtopic */}
        {questionData.subtopic && (
          <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1.5px", display: "block", marginBottom: "8px" }}>
            {questionData.subtopic}
          </span>
        )}

        {/* Question Text */}
        <h2 style={{ fontSize: "clamp(1.2rem, 2.8vw, 1.6rem)", fontWeight: "600", lineHeight: "1.4", marginBottom: "16px", whiteSpace: "pre-line" }}>
          {questionData.question}
        </h2>

        {/* Data Interpretation Table (if present) */}
        {questionData.hasTable && questionData.tableData && (
          <div className="di-table-container">
            <table className="di-table">
              <thead>
                <tr>
                  {questionData.tableData.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {questionData.tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Power-ups toolbar */}
        {room.powerUpsEnabled && (
          <div style={{ display: "flex", gap: "10px", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Sparkles size={14} /> Power-Ups:
            </span>
            <button
              onClick={() => handleUsePowerUp("fifty_fifty")}
              disabled={isLocked || eliminatedOptions.length > 0}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: "0.78rem",
                opacity: (isLocked || eliminatedOptions.length > 0) ? 0.4 : 1
              }}
              title="Eliminate 2 wrong answers"
            >
              50:50 (Remove 2 Wrongs)
            </button>

            <button
              onClick={() => handleUsePowerUp("two_x")}
              disabled={isLocked || is2XActive}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: "0.78rem",
                borderColor: is2XActive ? "var(--secondary)" : "var(--border-subtle)",
                opacity: (isLocked || is2XActive) ? 0.4 : 1
              }}
              title="Double this question's points if correct"
            >
              <Zap size={13} color="var(--secondary)" /> 2X Multiplier
            </button>
          </div>
        )}
      </div>

      {/* 4 Interactive Option Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "14px",
        marginBottom: "24px"
      }}>
        {questionData.options.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOptionId === opt.id;
          const isEliminated = eliminatedOptions.includes(opt.id);

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={isLocked || timeLeft <= 0 || isEliminated}
              className="card-glow"
              style={{
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                textAlign: "left",
                cursor: (isLocked || isEliminated) ? "default" : "pointer",
                background: isSelected
                  ? "linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)"
                  : isEliminated
                  ? "rgba(20, 20, 25, 0.3)"
                  : "var(--bg-card)",
                borderColor: isSelected ? "var(--secondary)" : isEliminated ? "transparent" : "var(--border-subtle)",
                opacity: isEliminated ? 0.3 : 1,
                textDecoration: isEliminated ? "line-through" : "none",
                transform: isSelected ? "scale(1.02)" : "none",
                boxShadow: isSelected ? "0 0 25px rgba(6, 182, 212, 0.35)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: isSelected ? "var(--secondary)" : "rgba(255, 255, 255, 0.08)",
                color: isSelected ? "#07090e" : "#f8fafc",
                fontWeight: "800",
                fontFamily: "var(--font-mono)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {letter}
              </div>

              <span style={{ fontSize: "1.05rem", fontWeight: isSelected ? "600" : "400", color: "#f8fafc" }}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Answer Status Banner */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(0, 0, 0, 0.35)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "12px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isLocked ? (
            <>
              <CheckCircle size={18} color="var(--accent-emerald)" />
              <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "#6ee7b7" }}>
                Answer Locked In! Scoring speed bonus...
              </span>
            </>
          ) : (
            <>
              <HelpCircle size={18} color="var(--secondary)" />
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Click your answer above before the clock runs out.
              </span>
            </>
          )}
        </div>

        {/* Live Peers Progress */}
        <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
          {answeredCount > 0 ? `${answeredCount} of ${totalPlayers} candidates locked in` : "Waiting for submissions..."}
        </div>
      </div>
    </div>
  );
}
