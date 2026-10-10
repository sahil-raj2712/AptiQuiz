import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import os from "os";
import { RoomManager } from "./game/RoomManager.js";
import { DEFAULT_QUESTION_SETS } from "./data/questionBank.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

const roomManager = new RoomManager(io);

// ==========================================
// REST API Routes
// ==========================================

// Server Info & LAN IP for Phone Join
app.get("/api/server-info", (req, res) => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  res.json({
    port: PORT,
    ip: addresses[0] || "localhost",
    allIps: addresses,
    localUrl: `http://${addresses[0] || "localhost"}:${PORT}`
  });
});

// Question Sets (Authoring & Viewing)
app.get("/api/question-sets", (req, res) => {
  res.json({ sets: roomManager.questionSets });
});

app.post("/api/question-sets", (req, res) => {
  try {
    const { title, description, author, questions } = req.body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Title and at least 1 question are required" });
    }

    const newSet = {
      id: `custom-${Date.now()}`,
      title,
      description: description || "Custom question set authored by faculty/host",
      author: author || "Host",
      isBuiltIn: false,
      questions: questions.map((q, idx) => ({
        id: q.id || `q_custom_${idx + 1}`,
        topic: q.topic || "Quantitative Aptitude",
        subtopic: q.subtopic || "General",
        difficulty: q.difficulty || "Medium",
        question: q.question,
        options: q.options || [],
        correctOptionId: q.correctOptionId || "opt_a",
        explanation: q.explanation || "No explanation provided.",
        timeLimitSeconds: Number(q.timeLimitSeconds) || 25,
        hasTable: !!q.hasTable,
        tableData: q.tableData || null
      }))
    };

    roomManager.questionSets.unshift(newSet);
    res.status(201).json({ success: true, set: newSet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// College League Table
app.get("/api/league", (req, res) => {
  res.json({ league: roomManager.collegeLeague });
});

// CSV Export for Faculty
app.get("/api/rooms/:code/export", (req, res) => {
  const { code } = req.params;
  const csv = roomManager.exportRoomCSV(code);
  if (!csv) {
    return res.status(404).json({ error: "Room not found or no stats available" });
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=aptiquiz_report_${code}.csv`);
  res.send(csv);
});

// Serve frontend in production
const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDistPath, "index.html"), err => {
    if (err) {
      res.send("AptiQuiz Server Active. Client is running on port 5173 in development.");
    }
  });
});

// ==========================================
// Real-Time Socket.io Events
// ==========================================

io.on("connection", socket => {
  // Latency measurement for network delay fairness
  socket.on("heartbeat_ping", ({ clientTime }) => {
    socket.emit("heartbeat_pong", {
      clientTime,
      serverTime: Date.now()
    });
  });

  // Client updates reported ping
  socket.on("report_ping", ({ roomCode, playerId, ping }) => {
    const room = roomManager.getRoom(roomCode);
    if (room) {
      const player = room.players.get(playerId);
      if (player) {
        player.ping = Number(ping) || 50;
      }
    }
  });

  // Host creates room
  socket.on("create_room", ({ questionSetId, options }, callback) => {
    try {
      const room = roomManager.createRoom({
        hostSocketId: socket.id,
        questionSetId,
        options
      });

      socket.join(room.code);
      socket.join(`host_${room.code}`);

      callback({
        success: true,
        roomCode: room.code,
        room: {
          code: room.code,
          title: room.title,
          hostCollege: room.hostCollege,
          status: room.status,
          totalQuestions: room.questionSet.questions.length,
          roundDurationSeconds: room.roundDurationSeconds,
          powerUpsEnabled: room.powerUpsEnabled,
          allowNegativeMarking: room.allowNegativeMarking
        }
      });
    } catch (err) {
      callback({ success: false, message: err.message });
    }
  });

  // Player joins room
  socket.on("join_room", ({ roomCode, playerId, name, college, avatar }, callback) => {
    try {
      const { room, player } = roomManager.addPlayer(roomCode, {
        playerId,
        socketId: socket.id,
        name,
        college,
        avatar
      });

      socket.join(room.code);

      // Inform existing room members
      io.to(room.code).emit("player_list_update", {
        players: Array.from(room.players.values()).map(p => ({
          id: p.id,
          name: p.name,
          college: p.college,
          avatar: p.avatar,
          score: p.score,
          isOnline: p.isOnline
        })),
        playerCount: room.players.size
      });

      callback({
        success: true,
        room: {
          code: room.code,
          title: room.title,
          status: room.status,
          hostCollege: room.hostCollege,
          totalQuestions: room.questionSet.questions.length,
          roundDurationSeconds: room.roundDurationSeconds,
          allowNegativeMarking: room.allowNegativeMarking,
          powerUpsEnabled: room.powerUpsEnabled
        },
        player: {
          id: player.id,
          name: player.name,
          college: player.college,
          avatar: player.avatar,
          score: player.score
        }
      });
    } catch (err) {
      callback({ success: false, message: err.message });
    }
  });

  // Reconnection support (refreshing browser or temporary network drop)
  socket.on("reconnect_room", ({ roomCode, playerId }, callback) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        return callback({ success: false, message: "Room not found" });
      }

      const player = room.players.get(playerId);
      if (!player) {
        return callback({ success: false, message: "Player session not found in this room" });
      }

      // Re-bind socket ID
      player.socketId = socket.id;
      player.isOnline = true;
      socket.join(room.code);

      // Send current state
      const currentQ = room.questionSet.questions[room.currentQuestionIndex];
      let activeQuestionData = null;

      if (room.status === "QUESTION_ACTIVE" && currentQ) {
        const shuffled = player.shuffledOptionsMap.get(room.currentQuestionIndex) || currentQ.options;
        const elapsed = (Date.now() - room.questionStartTime) / 1000;
        const totalDuration = Number(room.roundDurationSeconds) || Number(currentQ.timeLimitSeconds) || 25;
        const remaining = Math.max(0, totalDuration - elapsed);

        activeQuestionData = {
          questionIndex: room.currentQuestionIndex,
          totalQuestions: room.questionSet.questions.length,
          topic: currentQ.topic,
          difficulty: currentQ.difficulty,
          question: currentQ.question,
          hasTable: !!currentQ.hasTable,
          tableData: currentQ.tableData || null,
          options: shuffled.map(opt => ({ id: opt.id, text: opt.text })),
          timeLimitSeconds: remaining,
          serverStartTime: room.questionStartTime,
          hasAnswered: room.answersCurrentRound.has(playerId)
        };
      }

      callback({
        success: true,
        room: {
          code: room.code,
          title: room.title,
          status: room.status,
          totalQuestions: room.questionSet.questions.length
        },
        player: {
          id: player.id,
          name: player.name,
          college: player.college,
          avatar: player.avatar,
          score: player.score,
          streak: player.streak,
          powerUps: player.powerUps
        },
        activeQuestion: activeQuestionData
      });

      // Broadcast updated online count
      io.to(room.code).emit("player_status_change", {
        playerId: player.id,
        isOnline: true,
        playerCount: Array.from(room.players.values()).filter(p => p.isOnline).length
      });
    } catch (err) {
      callback({ success: false, message: err.message });
    }
  });

  // Host starts countdown
  socket.on("host_start_game", ({ roomCode }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return callback?.({ success: false, message: "Room not found" });
    if (room.status !== "LOBBY") return callback?.({ success: false, message: "Game already started" });

    roomManager.startCountdown(roomCode);
    callback?.({ success: true });
  });

  // Host advances to next question from round review
  socket.on("host_next_question", ({ roomCode }, callback) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return callback?.({ success: false, message: "Room not found" });
    if (room.status !== "ROUND_REVIEW") return callback?.({ success: false, message: "Round not in review state" });

    roomManager.startNextQuestion(roomCode);
    callback?.({ success: true });
  });

  // Player submits answer
  socket.on("submit_answer", ({ roomCode, playerId, optionId }, callback) => {
    const result = roomManager.handleAnswerSubmission(roomCode, {
      playerId,
      optionId,
      clientTimestamp: Date.now()
    });
    callback?.(result);
  });

  // Player power-up trigger
  socket.on("use_power_up", ({ roomCode, playerId, type }, callback) => {
    const result = roomManager.usePowerUp(roomCode, { playerId, type });
    callback?.(result);
  });

  // Disconnection
  socket.on("disconnect", () => {
    roomManager.handlePlayerDisconnect(socket.id);
  });
});

// Start HTTP & WebSocket Server
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 AptiQuiz Server active on port ${PORT}`);
  console.log(`🎮 WebSockets ready for up to 50 concurrent players`);
  console.log(`🛡️  Server-as-Referee engine initialized`);
  console.log(`===============================================`);
});
