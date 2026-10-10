# AptiQuiz: Real-Time Multiplayer Placement Aptitude Arena

### Problem Statement #3: AptiQuiz (Aptitude practice as a live multiplayer game)
**Team**: Logic Lords  
**Team Lead**: Sahil Raj  
**Team Member**: Shaurya Pratap Singh  

> 🚀 **Live Production Deployment**: [https://aptiquiz-q9br.onrender.com/](https://aptiquiz-q9br.onrender.com/)  
> 📊 **Grand Finale Presentation Deck (Interactive Slides)**: [https://aptiquiz-q9br.onrender.com/presentation.html](https://aptiquiz-q9br.onrender.com/presentation.html)  
> 📥 **PowerPoint Deck Download (.pptx)**: [https://aptiquiz-q9br.onrender.com/AptiQuiz_LogicLords.pptx](https://aptiquiz-q9br.onrender.com/AptiQuiz_LogicLords.pptx)

---

## 1. What It Does
**AptiQuiz** transforms dull solo aptitude preparation into an exhilarating real-time multiplayer esports arena where up to 50 students simultaneously race against the clock on Quantitative, Logical Reasoning, Verbal, and Data Interpretation challenges. The platform features an authoritative server referee, speed-and-accuracy scoring, anti-cheat randomized option layouts, live climb/drop leaderboards, and an inter-collegiate league system that turns campus placement training into an engaging spectator sport.

---

## 2. Done / Left / Plan

### Done (What Works Now)
- **Authoritative Server Referee**: Built on Node.js and Socket.IO; controls state transitions (`LOBBY`, `COUNTDOWN`, `QUESTION_ACTIVE`, `ROUND_REVIEW`, `GAME_OVER`), countdown intervals, and score validation. Client clocks are strictly distrusted.
- **Cheating-Resistant Protocol**: Unique option shuffling per player socket, zero correct-answer leakage to the client before round cutoff, and automated rejection of duplicate or late packets.
- **Fairness Under Network Delay**: Real-time RTT latency measurement with server-side arrival compensation.
- **Stateful Mid-Match Reconnection**: Players can refresh their browser or recover from Wi-Fi drops without losing their score, streak, or current round standing.
- **Full Question Authoring**: Preloaded sets with Quantitative, Logical, Verbal, and Data Interpretation questions (with tables and formulas) + in-app faculty question authoring.
- **Interactive Game Arena**: Synchronized countdown, tactile response, power-ups (50:50 and 2x Multiplier), and sound synthesis.
- **Leaderboards & Post-Game Analytics**: Dynamic rank movement ($\uparrow$ climbed, $\downarrow$ dropped), confetti celebration, student topic strength diagnostic card, and downloadable Faculty CSV report.
- **College League Circuit**: Aggregated inter-college rankings and student Hall of Fame.
- **50-Player Benchmark Script**: Tested and validated with 50 concurrent automated simulated players.

### Left (Next 16 Hours)
- Multi-college live tournament brackets (Team vs. Team college battles).
- Adaptive AI difficulty that scales question complexity based on lobby accuracy.
- OCR question import for faculty from placement PDF papers.

### Execution Plan
1. **Hours 1–4**: Enhance mobile viewport responsiveness and conduct multi-device staging tests.
2. **Hours 5–8**: Deploy production build to cloud hosting (Render / Railway) with HTTPS and secure WebSocket clustering.
3. **Hours 9–12**: Finalize presentation slide deck (PPT) with architecture diagrams and record offline backup demonstration video.
4. **Hours 13–16**: Final rehearsals for the 3-minute Round 1 table demo and 6-minute stage finale presentation.

---

## 3. Architecture and Why

```
                     ┌────────────────────────────────────────┐
                     │          React + Vite Frontend         │
                     │  (Cyber Arena Dark Mode / Glassmorphism│
                     │   Procedural Web Audio / Canvas Confetti│
                     └───────────────────▲────────────────────┘
                                         │
                         WebSocket (Bidirectional / Sub-50ms)
                                         │
                     ┌───────────────────▼────────────────────┐
                     │          Node.js Express + Socket.IO   │
                     │  ┌──────────────────────────────────┐  │
                     │  │    Authoritative Server Referee   │  │
                     │  │    - Authoritative Epoch Clock   │  │
                     │  │    - Shuffled Option Generator   │  │
                     │  │    - Anti-Cheat & Late Rejection │  │
                     │  │    - Network Latency Compensator │  │
                     │  └──────────────────────────────────┘  │
                     │  ┌──────────────────────────────────┐  │
                     │  │       College League Engine      │  │
                     │  │    - Inter-Collegiate Standings  │  │
                     │  │    - Student Hall of Fame        │  │
                     │  └──────────────────────────────────┘  │
                     └────────────────────────────────────────┘
```

### Why These Technical Choices?
- **Node.js & Socket.IO vs HTTP Polling**: Sub-50ms synchronization is essential for 50 players answering simultaneously against a tight 15–25s countdown. Socket.IO provides battle-tested WebSocket transport, built-in room clustering, heartbeat pinging, and automatic connection recovery.
- **Authoritative Server Referee vs Client Validation**: In high-stakes placement tournaments, students can manipulate client timestamps or DOM values. In our architecture, the server decides when a question begins, when it ends, validates answers against an in-memory secret answer key, and computes scores.
- **Single-Port Production Deployment**: Express directly serves the pre-compiled `client/dist` assets while exposing real-time WebSockets and REST analytics on port `4000`, eliminating CORS overhead and simplifying deployment on any cloud provider or localhost laptop.

---

## 4. What We Added (Differentiators)

1. **Auditorium Projector / Spectator Mode**: A dedicated high-contrast, large-typography presentation view designed for campus auditorium projectors during college placement drives.
2. **Zero-Dependency Procedural Web Audio Engine**: Synthesized game-show audio (clock ticks, correct harmonic chimes, wrong buzzers, 50:50 sweeps, victory fanfare) generated in pure Web Audio API without bulky MP3 files.
3. **Student Power-Ups (Fair Play)**: Added strategic depth with 50:50 (eliminates 2 wrong options) and 2x Multiplier, limited to single-use per match.
4. **Faculty Analytics & CSV Export**: One-click download providing faculty with complete room gradebooks and question-level difficulty diagnostics (most-missed questions).

---

## 5. Network Delay Fairness (Plain Words)

In live multiplayer tests, a student on a fast 20ms campus fiber connection should not automatically beat a student answering on a 120ms mobile 4G hotspot.

### How Our Server Handles It:
1. Every client exchanges periodic heartbeat pings with the server to measure their Round-Trip Time ($RTT$).
2. The server records the exact epoch timestamp $T_0$ when a question is broadcast.
3. When an answer packet arrives at server time $T_1$, the server computes the candidate's actual cognitive reaction time by subtracting their estimated one-way transit delay:
   $$\text{Fair Reaction Time} = (T_1 - T_0) - \frac{RTT}{2}$$
4. Two students who read and tap the correct answer with the same mental reaction speed receive the exact same speed bonus, regardless of individual network speed.

---

## 6. 50-Player Benchmark Script & Verification

To satisfy the 50-player concurrency requirement, an automated simulation script is included at [`tests/simulate_50_players.js`](file:///d:/Code2Career/tests/simulate_50_players.js).

### How to Run the Benchmark
```bash
# Ensure server is running on port 4000
npm run test:50
```

### What the Benchmark Showed
The script spawns a host socket, creates a room, connects 50 simulated player WebSockets, submits answers across rounds with randomized thinking times and network delays, triggers power-ups, and simulates mid-match disconnections:

```
================================================================
🎯 APTIQUIZ 50-PLAYER STRESS & LATENCY TEST RESULTS
================================================================
• Concurrent Connected Players : 50 / 50 (100%)
• Total Answers Processed      : 99
• Rounds Played & Synced       : 2
• Anti-Cheat Option Shuffling  : VERIFIED (99 player feeds shuffled)
• Mid-Match Reconnection Test  : PASSED (Zero score loss)
• Server Clock Authoritativeness: ENFORCED
• Total Test Execution Time    : 25.91s
================================================================
```

---

## 7. How to Run It

### Prerequisites
- Node.js v18+ and npm installed

### Quick Start (Local Run for Round 1)
```bash
# 1. Install root dependencies
npm install

# 2. Install server and client packages
cd server && npm install && cd ..
cd client && npm install && cd ..

# 3. Build frontend bundle
npm run build

# 4. Start the server (serves both API & Frontend)
npm start
```

Open your browser to:
**`http://localhost:4000`**

*(For development with Vite Hot-Module Reloading, run `npm run server` and in a separate terminal run `npm run client` on port 5173).*

---

## 8. Tools and AI Used

- **Runtime & Backend**: Node.js, Express, Socket.IO, UUID.
- **Frontend & UI**: React 19, Vite, Lucide Icons, Canvas-Confetti, Web Audio API.
- **AI Assistance**: LLM pair programming was utilized during development for rapid question synthesis and stress-test test harness scaffolding.
- **AI Disclosure to Users**: AptiQuiz features human vs. human multiplayer competition; all live opponents are verified peer candidates with transparent AI disclosure badges in the UI.

---

## 9. Who It Is For & Retention Hook

- **Primary Audience**: Engineering and management college students preparing for competitive placement aptitude screenings (TCS NQT, Infosys, Accenture, Cognizant, Product startups).
- **Secondary Audience**: Placement training officers and college faculty seeking real-time engagement and diagnostic data.
- **Retention Hooks**:
  - **Esports Adrenaline**: High-speed timers, streak multipliers, and instant rank movement eliminate solo prep boredom.
  - **University Pride**: The Inter-College League leaderboard fosters campus rivalries and repeat daily participation.
  - **Diagnostic Report Card**: Clear breakdown of strengths and weaknesses across Quantitative, Logical, Verbal, and Data Interpretation.
