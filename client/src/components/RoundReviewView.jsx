import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ArrowUp, ArrowDown, Minus, Play, Flame, BarChart2, FastForward, Clock, HelpCircle, Check, X } from "lucide-react";
import { socket } from "../utils/socket";
import { sound } from "../utils/soundEngine";

export default function RoundReviewView({ result, room, player, isHost, onNextQuestion }) {
  const [secondsLeft, setSecondsLeft] = useState(result.reviewDurationSeconds || 7);

  // Robust player result resolution (direct from playerResults map or leaderboard)
  const myResult = (player && result.playerResults && result.playerResults[player.id])
    || result.leaderboard?.find(p => p.id === player?.id);

  useEffect(() => {
    // Play sound based on user's answer outcome
    if (isHost) return;
    if (myResult) {
      if (myResult.hasAnswered && myResult.answeredCorrectly) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }
    }
  }, [result, myResult, isHost]);

  useEffect(() => {
    const totalSecs = result.reviewDurationSeconds || 7;
    setSecondsLeft(totalSecs);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [result]);

  const handleNext = () => {
    socket.emit("host_next_question", { roomCode: room.code });
  };

  const totalAnswersInRound = result.distribution ? Object.values(result.distribution).reduce((a, b) => a + b, 0) : 0;
  const isLastQuestion = result.isLastQuestion;
  const totalDuration = result.reviewDurationSeconds || 7;
  const progressPct = (secondsLeft / totalDuration) * 100;

  // Outcome status for student
  const isCorrect = myResult?.hasAnswered && myResult?.answeredCorrectly;
  const isWrong = myResult?.hasAnswered && !myResult?.answeredCorrectly;
  const isUnanswered = !myResult?.hasAnswered;

  const bannerBorder = isHost
    ? "5px solid var(--primary)"
    : isCorrect
    ? "5px solid var(--accent-emerald)"
    : "5px solid var(--accent-rose)";

  const bannerBg = isHost
    ? "rgba(99, 102, 241, 0.08)"
    : isCorrect
    ? "rgba(16, 185, 129, 0.09)"
    : "rgba(244, 63, 94, 0.09)";

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "32px auto", padding: "0 16px" }}>
      {/* Top Banner: Round Outcome */}
      <div className="glass-panel" style={{
        padding: "26px 32px",
        marginBottom: "24px",
        borderLeft: bannerBorder,
        background: bannerBg
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className={`badge ${isHost ? "badge-indigo" : isCorrect ? "badge-emerald" : "badge-rose"}`}>
                Round {result.questionIndex + 1} of {result.totalQuestions || "?"} Review
              </span>
              {!isHost && isCorrect && (
                <span className="badge badge-emerald">
                  <Check size={12} /> Correct (+{myResult.pointsEarned} pts)
                </span>
              )}
              {!isHost && isWrong && (
                <span className="badge badge-rose">
                  <X size={12} /> Incorrect {room.allowNegativeMarking ? "(-200 pts)" : "(0 pts)"}
                </span>
              )}
              {!isHost && isUnanswered && (
                <span className="badge badge-amber">
                  ⏱️ Timed Out (0 pts)
                </span>
              )}
            </div>

            {/* Main Headline */}
            <h2 style={{ fontSize: "1.7rem", fontWeight: "700", marginBottom: "6px" }}>
              {isHost && "👑 Match Referee & Faculty Spectator Overview"}
              {!isHost && isCorrect && "🎯 Spot On! You Answered Correctly!"}
              {!isHost && isWrong && "❌ Incorrect Answer"}
              {!isHost && isUnanswered && "⏱️ Time Expired (No Answer Submitted)"}
            </h2>

            {/* Explanatory subline for candidate answer */}
            {!isHost && (
              <div style={{ fontSize: "0.95rem", color: "#e2e8f0", lineHeight: "1.5" }}>
                {isCorrect && (
                  <span>
                    You selected <strong>Option {myResult.selectedOptionLetter}: "{myResult.selectedOptionText}"</strong>. High-speed bonus applied!
                  </span>
                )}
                {isWrong && (
                  <div>
                    <span>You picked: <strong style={{ color: "var(--accent-rose)", textDecoration: "line-through" }}>Option {myResult.selectedOptionLetter || "?"}: "{myResult.selectedOptionText || "N/A"}"</strong></span>
                    <span style={{ display: "block", marginTop: "2px", color: "#6ee7b7" }}>
                      Correct answer: <strong>Option {myResult.correctOptionLetter || "?"}: "{myResult.correctOptionText || result.correctOptionText}"</strong>
                    </span>
                  </div>
                )}
                {isUnanswered && (
                  <span>
                    You didn't lock in an option before the timer expired. Correct Answer was: <strong style={{ color: "var(--accent-emerald)" }}>Option {myResult?.correctOptionLetter || "?"}: "{myResult?.correctOptionText || result.correctOptionText}"</strong>
                  </span>
                )}
              </div>
            )}

            {isHost && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Correct answer: <strong style={{ color: "var(--accent-emerald)" }}>{result.correctOptionText || result.correctOptionId}</strong>
              </p>
            )}
          </div>

          {/* Player Score Badge */}
          {!isHost && (
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px" }}>Your Total Score</span>
              <div style={{ fontSize: "2.2rem", fontWeight: "900", fontFamily: "var(--font-mono)", color: "var(--secondary)" }}>
                {myResult?.score || player?.score || 0}
              </div>
              {myResult?.streak > 1 && (
                <span className="badge badge-amber" style={{ fontSize: "0.75rem", marginTop: "4px" }}>
                  <Flame size={12} /> {myResult.streak}x Streak Active
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Question & All 4 Options Review Card */}
      {result.questionText && (
        <div className="glass-panel" style={{ padding: "26px 30px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Problem Formulation
            </span>
            <span className="badge badge-cyan" style={{ fontSize: "0.75rem" }}>
              Official Answer Key
            </span>
          </div>

          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", lineHeight: "1.45", marginBottom: "20px", whiteSpace: "pre-line", color: "#f8fafc" }}>
            {result.questionText}
          </h3>

          {/* Options Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", marginBottom: "18px" }}>
            {(result.distributionDetails || result.options || []).map((opt) => {
              const isCorrectOpt = opt.isCorrect || opt.id === result.correctOptionId;
              const isMySelection = myResult?.selectedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "var(--radius-md)",
                    border: isCorrectOpt
                      ? "2px solid var(--accent-emerald)"
                      : isMySelection
                      ? "2px solid var(--accent-rose)"
                      : "1px solid var(--border-subtle)",
                    background: isCorrectOpt
                      ? "rgba(16, 185, 129, 0.12)"
                      : isMySelection
                      ? "rgba(244, 63, 94, 0.12)"
                      : "rgba(255, 255, 255, 0.02)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    transition: "all 0.2s ease"
                  }}
                >
                  {/* Option Letter Circle */}
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: isCorrectOpt
                      ? "var(--accent-emerald)"
                      : isMySelection
                      ? "var(--accent-rose)"
                      : "rgba(255, 255, 255, 0.08)",
                    color: isCorrectOpt || isMySelection ? "#07090e" : "#f8fafc",
                    fontWeight: "800",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {opt.letter}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ fontSize: "1rem", fontWeight: isCorrectOpt || isMySelection ? "700" : "400", color: "#f8fafc" }}>
                        {opt.text}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      {isCorrectOpt && (
                        <span className="badge badge-emerald" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                          ✓ Correct Answer
                        </span>
                      )}
                      {isMySelection && !isCorrectOpt && (
                        <span className="badge badge-rose" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                          ✗ Your Choice
                        </span>
                      )}
                      {isMySelection && isCorrectOpt && (
                        <span className="badge badge-emerald" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                          🎯 Your Choice & Correct!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step-by-Step Logic & Explanation */}
          {result.explanation && (
            <div style={{
              background: "rgba(0, 0, 0, 0.45)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px"
            }}>
              <span style={{ fontSize: "0.78rem", color: "var(--accent-emerald)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
                Step-by-Step Explanation & Method:
              </span>
              <p style={{ fontSize: "0.94rem", color: "#e2e8f0", lineHeight: "1.6", margin: 0 }}>
                {result.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid: Peer Answer Distribution & Live Leaderboard Standings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Peer Answer Distribution */}
        <div className="card-glow" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <BarChart2 size={18} color="var(--secondary)" /> Peer Answer Distribution ({totalAnswersInRound} total)
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {(result.distributionDetails || []).length > 0 ? (
              result.distributionDetails.map((item) => {
                const count = item.count || 0;
                const pct = totalAnswersInRound > 0 ? Math.round((count / totalAnswersInRound) * 100) : 0;
                const isCorrect = item.isCorrect;
                const isMine = myResult?.selectedOptionId === item.id;

                return (
                  <div key={item.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                      <span style={{ fontWeight: isCorrect ? "700" : "500", color: isCorrect ? "#6ee7b7" : isMine ? "#fda4af" : "#cbd5e1" }}>
                        Option {item.letter}: {item.text} {isCorrect && "✓"} {isMine && "(You)"}
                      </span>
                      <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: isCorrect ? "var(--accent-emerald)" : isMine ? "var(--accent-rose)" : "var(--primary)",
                        borderRadius: "4px",
                        transition: "width 0.6s ease"
                      }} />
                    </div>
                  </div>
                );
              })
            ) : (
              result.distribution && Object.entries(result.distribution).map(([optId, count], idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isCorrect = optId === result.correctOptionId;
                const pct = totalAnswersInRound > 0 ? Math.round((count / totalAnswersInRound) * 100) : 0;

                return (
                  <div key={optId}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                      <span style={{ fontWeight: isCorrect ? "700" : "500", color: isCorrect ? "#6ee7b7" : "#cbd5e1" }}>
                        Option {letter} {isCorrect && "✓ (Correct)"}
                      </span>
                      <span style={{ color: "var(--text-dim)" }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: isCorrect ? "var(--accent-emerald)" : "var(--primary)",
                        borderRadius: "4px"
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Leaderboard Standings */}
        <div className="card-glow" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Round Standings & Movement</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Real-time Rank Delta</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {result.leaderboard?.slice(0, 7).map((p) => {
              const isMe = p.id === player?.id;
              const climbed = p.rankDelta > 0;
              const dropped = p.rankDelta < 0;

              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: isMe ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.02)",
                    border: isMe ? "1px solid var(--primary)" : "1px solid transparent"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Rank */}
                    <span style={{
                      fontWeight: "800",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.9rem",
                      width: "24px",
                      color: p.rank <= 3 ? "var(--accent-amber)" : "var(--text-dim)"
                    }}>
                      #{p.rank}
                    </span>

                    {/* Rank Delta indicator */}
                    <span style={{
                      fontSize: "0.78rem",
                      display: "flex",
                      alignItems: "center",
                      color: climbed ? "var(--accent-emerald)" : dropped ? "var(--accent-rose)" : "var(--text-dim)"
                    }}>
                      {climbed && <><ArrowUp size={12} />+{p.rankDelta}</>}
                      {dropped && <><ArrowDown size={12} />{p.rankDelta}</>}
                      {!climbed && !dropped && <Minus size={12} />}
                    </span>

                    <span style={{ fontSize: "1.1rem" }}>{p.avatar}</span>

                    <div>
                      <span style={{ fontSize: "0.88rem", fontWeight: isMe ? "700" : "500", display: "block" }}>
                        {p.name} {isMe && "(You)"}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                        {p.college}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: "700", fontFamily: "var(--font-mono)", fontSize: "0.92rem", color: "#f8fafc" }}>
                      {p.score} pts
                    </span>
                    {p.lastPointsEarned > 0 && (
                      <span style={{ fontSize: "0.72rem", color: "var(--accent-emerald)", display: "block" }}>
                        +{p.lastPointsEarned}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auto-Advance Round Ticker & Host Controls */}
      <div className="glass-panel" style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.75)",
        border: "1px solid rgba(99, 102, 241, 0.3)"
      }}>
        {/* Countdown Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "600px",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={20} color="var(--secondary)" className="animate-pulse" />
            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc" }}>
              {isLastQuestion
                ? "Calculating Final Placement Podium & League Ratings..."
                : `Next Question Starting in ${secondsLeft}s...`}
            </span>
          </div>

          <span className="badge badge-indigo" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            {secondsLeft}s auto-advance
          </span>
        </div>

        {/* Dynamic Visual Progress Bar */}
        <div style={{
          width: "100%",
          maxWidth: "600px",
          height: "8px",
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "4px",
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, var(--secondary), var(--primary))",
            transition: "width 1s linear"
          }} />
        </div>

        {/* Host Instant Skip Button vs Student Indicator */}
        {isHost ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <button
              onClick={handleNext}
              className="btn btn-emerald"
              style={{ padding: "10px 24px", fontSize: "0.95rem" }}
            >
              Skip Countdown & Next Question Now <FastForward size={16} />
            </button>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
              (Or let it automatically advance in {secondsLeft}s)
            </span>
          </div>
        ) : (
          <div style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
            ⚡ Automatic esports transition — Get ready for the next problem!
          </div>
        )}
      </div>
    </div>
  );
}
