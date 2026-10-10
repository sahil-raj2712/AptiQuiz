import React, { useState, useEffect } from "react";
import { CheckCircle2, ArrowUp, ArrowDown, Minus, Play, Flame, BarChart2, FastForward, Clock } from "lucide-react";
import { socket } from "../utils/socket";
import { sound } from "../utils/soundEngine";

export default function RoundReviewView({ result, room, player, isHost, onNextQuestion }) {
  const [secondsLeft, setSecondsLeft] = useState(result.reviewDurationSeconds || 7);

  useEffect(() => {
    // Check if current player answered correctly and play sound
    const myEntry = result.leaderboard?.find(p => p.id === player?.id);
    if (myEntry) {
      if (myEntry.answeredCorrectly) {
        sound.playCorrect();
      } else {
        sound.playWrong();
      }
    }
  }, [result, player]);

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

  const myEntry = result.leaderboard?.find(p => p.id === player?.id);
  const totalAnswersInRound = result.distribution ? Object.values(result.distribution).reduce((a, b) => a + b, 0) : 0;
  const isLastQuestion = result.isLastQuestion;
  const totalDuration = result.reviewDurationSeconds || 7;
  const progressPct = (secondsLeft / totalDuration) * 100;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "980px", margin: "32px auto", padding: "0 16px" }}>
      {/* Top Banner: Round Outcome */}
      <div className="glass-panel" style={{
        padding: "24px 32px",
        marginBottom: "24px",
        borderLeft: myEntry?.answeredCorrectly ? "5px solid var(--accent-emerald)" : "5px solid var(--accent-rose)",
        background: myEntry?.answeredCorrectly ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div className="badge badge-emerald" style={{ marginBottom: "8px" }}>
              Round {result.questionIndex + 1} Review
            </div>
            <h2 style={{ fontSize: "1.6rem" }}>
              {myEntry?.answeredCorrectly ? "🎯 Correct Answer!" : "❌ Missed This Round"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {myEntry?.answeredCorrectly 
                ? `You earned +${myEntry.lastPointsEarned} points (Speed & accuracy rewarded).`
                : (room.allowNegativeMarking ? "Negative marking: -200 points deducted." : "0 points awarded for wrong answer.")}
            </p>
          </div>

          {/* Player Score Badge */}
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Your Total Score</span>
            <div style={{ fontSize: "2rem", fontWeight: "900", fontFamily: "var(--font-mono)", color: "var(--secondary)" }}>
              {myEntry?.score || player?.score || 0}
            </div>
            {myEntry?.streak > 1 && (
              <span className="badge badge-amber" style={{ fontSize: "0.75rem" }}>
                <Flame size={12} /> {myEntry.streak}x Streak
              </span>
            )}
          </div>
        </div>

        {/* Explanation Card */}
        {result.explanation && (
          <div style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginTop: "16px"
          }}>
            <span style={{ fontSize: "0.78rem", color: "var(--accent-emerald)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>
              Solution & Step-by-Step Logic:
            </span>
            <p style={{ fontSize: "0.92rem", color: "#e2e8f0", lineHeight: "1.5" }}>
              {result.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Grid: Answer Distribution & Live Leaderboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "28px" }}>
        {/* Answer Distribution */}
        <div className="card-glow" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <BarChart2 size={18} color="var(--secondary)" /> Peer Answer Distribution ({totalAnswersInRound})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {result.distribution && Object.entries(result.distribution).map(([optId, count], idx) => {
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
            })}
          </div>
        </div>

        {/* Dynamic Leaderboard Standings */}
        <div className="card-glow" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Round Standings & Movement</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Live Climb/Drop</span>
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
