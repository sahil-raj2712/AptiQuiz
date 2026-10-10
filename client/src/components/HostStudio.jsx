import React, { useState, useEffect } from "react";
import { Plus, Play, BookOpen, Clock, BarChart3, Settings2, Trash2, CheckCircle2, Table, X } from "lucide-react";
import { socket } from "../utils/socket";

export default function HostStudio({ onRoomCreated }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSetToLaunch, setSelectedSetToLaunch] = useState(null);

  // Match Configuration Options
  const [hostCollege, setHostCollege] = useState("National Tech Placement Arena");
  const [roundDuration, setRoundDuration] = useState(25);
  const [powerUpsEnabled, setPowerUpsEnabled] = useState(true);
  const [allowNegativeMarking, setAllowNegativeMarking] = useState(false);
  const [launching, setLaunching] = useState(false);

  // New Question Set State
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDesc, setNewSetDesc] = useState("");
  const [newQuestions, setNewQuestions] = useState([
    {
      topic: "Quantitative Aptitude",
      subtopic: "Speed & Time",
      difficulty: "Medium",
      question: "A train running at 54 km/hr crosses a 180m long platform in 20 seconds. What is the length of the train in meters?",
      options: [
        { id: "opt_a", text: "120 meters" },
        { id: "opt_b", text: "150 meters" },
        { id: "opt_c", text: "180 meters" },
        { id: "opt_d", text: "200 meters" }
      ],
      correctOptionId: "opt_a",
      explanation: "Speed = 54 * (5/18) = 15 m/s. Total distance in 20s = 15 * 20 = 300m. Train length = 300 - 180 = 120m.",
      timeLimitSeconds: 25,
      hasTable: false
    }
  ]);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/question-sets");
      const data = await res.json();
      if (data?.sets) {
        setSets(data.sets);
      }
    } catch (err) {
      console.error("Failed to load question sets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionToNewSet = () => {
    setNewQuestions([
      ...newQuestions,
      {
        topic: "Logical Reasoning",
        subtopic: "Puzzles",
        difficulty: "Easy",
        question: "New question prompt...",
        options: [
          { id: "opt_a", text: "Option A" },
          { id: "opt_b", text: "Option B" },
          { id: "opt_c", text: "Option C" },
          { id: "opt_d", text: "Option D" }
        ],
        correctOptionId: "opt_a",
        explanation: "Brief solution explanation...",
        timeLimitSeconds: 20,
        hasTable: false
      }
    ]);
  };

  const handleSaveCustomSet = async () => {
    if (!newSetTitle.trim()) {
      alert("Please give this question set a title.");
      return;
    }
    try {
      const res = await fetch("/api/question-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSetTitle,
          description: newSetDesc,
          author: hostCollege || "Faculty Host",
          questions: newQuestions
        })
      });
      const data = await res.json();
      if (data?.success) {
        setShowCreateModal(false);
        fetchSets();
      }
    } catch (err) {
      alert("Error saving custom set: " + err.message);
    }
  };

  const handleLaunchRoom = (questionSet) => {
    setSelectedSetToLaunch(questionSet);
  };

  const confirmLaunch = () => {
    if (!selectedSetToLaunch) return;
    setLaunching(true);

    socket.emit("create_room", {
      questionSetId: selectedSetToLaunch.id,
      options: {
        title: selectedSetToLaunch.title,
        hostCollege,
        roundDurationSeconds: roundDuration,
        powerUpsEnabled,
        allowNegativeMarking
      }
    }, (res) => {
      setLaunching(false);
      if (res?.success) {
        localStorage.setItem("aptiquiz_room_code", res.roomCode);
        onRoomCreated({
          room: res.room,
          isHost: true
        });
      } else {
        alert(res?.message || "Failed to create match room.");
      }
    });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1140px", margin: "40px auto", padding: "0 20px" }}>
      {/* Studio Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="badge badge-indigo" style={{ marginBottom: "10px" }}>
            Faculty & Host Control Center
          </div>
          <h1 style={{ fontSize: "2.2rem" }}>Question Authoring & Room Arena</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Select a verified campus placement question set or create custom aptitude tracks with tables & formulas.
          </p>
        </div>

        <button 
          className="btn btn-emerald btn-lg"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} /> Author New Question Set
        </button>
      </div>

      {/* Question Sets List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {sets.map((set) => (
          <div key={set.id} className="card-glow" style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span className={`badge ${set.isBuiltIn ? "badge-cyan" : "badge-amber"}`}>
                  {set.isBuiltIn ? "Verified Placement Set" : "Custom Track"}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <BookOpen size={14} /> {set.questions.length} Questions
                </span>
              </div>

              <h2 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>{set.title}</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "20px", lineHeight: "1.5" }}>
                {set.description}
              </p>

              {/* Topic Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                {Array.from(new Set(set.questions.map(q => q.topic))).map(topic => (
                  <span key={topic} style={{
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#cbd5e1"
                  }}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => handleLaunchRoom(set)}
            >
              <Play size={16} /> Launch Live Room (50 Players)
            </button>
          </div>
        ))}
      </div>

      {/* Launch Configuration Modal */}
      {selectedSetToLaunch && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div className="glass-panel" style={{ maxWidth: "560px", width: "100%", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setSelectedSetToLaunch(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div className="badge badge-emerald" style={{ marginBottom: "12px" }}>
              Room Arena Setup
            </div>
            <h2 style={{ fontSize: "1.6rem", marginBottom: "6px" }}>
              Launch Match: {selectedSetToLaunch.title}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "24px" }}>
              Configure referee rules and college league settings for this session.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", color: "#cbd5e1" }}>
                  HOST COLLEGE / INSTITUTION NAME
                </label>
                <input
                  type="text"
                  value={hostCollege}
                  onChange={(e) => setHostCollege(e.target.value)}
                  className="input-field"
                  placeholder="e.g. IIT Bombay / DTU Delhi"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px", color: "#cbd5e1" }}>
                  DEFAULT QUESTION TIME LIMIT
                </label>
                <select
                  value={roundDuration}
                  onChange={(e) => setRoundDuration(Number(e.target.value))}
                  className="input-field"
                  style={{ background: "#0e1320" }}
                >
                  <option value={15}>15 Seconds (Blitz Pressure)</option>
                  <option value={20}>20 Seconds (Standard Placement Speed)</option>
                  <option value={25}>25 Seconds (Analytical & Math)</option>
                  <option value={35}>35 Seconds (Data Interpretation Charts)</option>
                </select>
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(0, 0, 0, 0.3)", padding: "16px", borderRadius: "var(--radius-md)" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div>
                    <span style={{ fontWeight: "600", fontSize: "0.92rem", display: "block" }}>Enable Student Power-Ups</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Allows 50:50 and 2x Multiplier once per match</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={powerUpsEnabled}
                    onChange={(e) => setPowerUpsEnabled(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
                  />
                </label>

                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div>
                    <span style={{ fontWeight: "600", fontSize: "0.92rem", display: "block" }}>Negative Marking (-200 pts)</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>Penalizes wrong guesses like real placement screenings</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowNegativeMarking}
                    onChange={(e) => setAllowNegativeMarking(e.target.checked)}
                    style={{ width: "20px", height: "20px", accentColor: "var(--accent-rose)" }}
                  />
                </label>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: "100%", marginTop: "10px" }}
                disabled={launching}
                onClick={confirmLaunch}
              >
                {launching ? "Spinning Up Room..." : "Generate 6-Character Room PIN ➔"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author New Question Set Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div className="glass-panel" style={{ maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: "1.7rem", marginBottom: "8px" }}>Author Custom Question Set</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "20px" }}>
              Add multiple aptitude questions across Quantitative, Logical, Verbal, and Data Interpretation.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Set Title</label>
                <input
                  type="text"
                  value={newSetTitle}
                  onChange={(e) => setNewSetTitle(e.target.value)}
                  placeholder="e.g. TCS / Infosys Mock Round 2"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Description</label>
                <input
                  type="text"
                  value={newSetDesc}
                  onChange={(e) => setNewSetDesc(e.target.value)}
                  placeholder="e.g. 5 questions on P&C, Syllogisms, and Table analysis"
                  className="input-field"
                />
              </div>

              {/* Questions List */}
              <h3 style={{ fontSize: "1.2rem", marginTop: "12px" }}>Questions ({newQuestions.length})</h3>

              {newQuestions.map((q, idx) => (
                <div key={idx} style={{ background: "rgba(0, 0, 0, 0.4)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span className="badge badge-indigo">Question {idx + 1}</span>
                    {newQuestions.length > 1 && (
                      <button
                        onClick={() => setNewQuestions(newQuestions.filter((_, i) => i !== idx))}
                        style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Topic</label>
                      <select
                        value={q.topic}
                        onChange={(e) => {
                          const updated = [...newQuestions];
                          updated[idx].topic = e.target.value;
                          setNewQuestions(updated);
                        }}
                        className="input-field"
                        style={{ background: "#0e1320" }}
                      >
                        <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                        <option value="Logical Reasoning">Logical Reasoning</option>
                        <option value="Verbal Ability">Verbal Ability</option>
                        <option value="Data Interpretation">Data Interpretation</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Difficulty</label>
                      <select
                        value={q.difficulty}
                        onChange={(e) => {
                          const updated = [...newQuestions];
                          updated[idx].difficulty = e.target.value;
                          setNewQuestions(updated);
                        }}
                        className="input-field"
                        style={{ background: "#0e1320" }}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Question Text</label>
                    <textarea
                      rows={2}
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...newQuestions];
                        updated[idx].question = e.target.value;
                        setNewQuestions(updated);
                      }}
                      className="input-field"
                    />
                  </div>

                  {/* Options */}
                  <label style={{ fontSize: "0.8rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                    4 Options & Select Correct Answer
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="radio"
                          name={`correct_${idx}`}
                          checked={q.correctOptionId === opt.id}
                          onChange={() => {
                            const updated = [...newQuestions];
                            updated[idx].correctOptionId = opt.id;
                            setNewQuestions(updated);
                          }}
                          style={{ accentColor: "var(--accent-emerald)" }}
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[idx].options[oIdx].text = e.target.value;
                            setNewQuestions(updated);
                          }}
                          className="input-field"
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>Explanation</label>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => {
                        const updated = [...newQuestions];
                        updated[idx].explanation = e.target.value;
                        setNewQuestions(updated);
                      }}
                      className="input-field"
                      placeholder="Step-by-step logic for the correct answer..."
                    />
                  </div>
                </div>
              ))}

              <button
                className="btn btn-secondary"
                onClick={handleAddQuestionToNewSet}
              >
                <Plus size={16} /> Add Another Question
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-emerald" style={{ flex: 1 }} onClick={handleSaveCustomSet}>
                Save Question Set to Arena
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
