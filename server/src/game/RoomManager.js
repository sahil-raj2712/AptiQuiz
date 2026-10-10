import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_QUESTION_SETS } from "../data/questionBank.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEAGUE_FILE = path.join(__dirname, "../data/college_league.json");

// Helper: Shuffle array randomly
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> RoomObject
    this.questionSets = [...DEFAULT_QUESTION_SETS];
    this.collegeLeague = this.loadCollegeLeague();
  }

  loadCollegeLeague() {
    try {
      if (fs.existsSync(LEAGUE_FILE)) {
        const raw = fs.readFileSync(LEAGUE_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not load college league file, initializing default.", err.message);
    }
    return {
      colleges: {
        "NIET": { matchesPlayed: 16, totalPoints: 142800, topScore: 9950 },
        "GL BAJAJ": { matchesPlayed: 15, totalPoints: 136200, topScore: 9890 },
        "AMITY": { matchesPlayed: 14, totalPoints: 128500, topScore: 9780 },
        "IIT Bombay": { matchesPlayed: 14, totalPoints: 124500, topScore: 9800 },
        "BITS Pilani": { matchesPlayed: 12, totalPoints: 112000, topScore: 9650 },
        "NIT Trichy": { matchesPlayed: 10, totalPoints: 89400, topScore: 9400 },
        "DTU Delhi": { matchesPlayed: 9, totalPoints: 81200, topScore: 9100 },
        "VIT Vellore": { matchesPlayed: 15, totalPoints: 132000, topScore: 9550 }
      },
      topPlayers: [
        { name: "Aman Singh", college: "NIET", matches: 8, score: 34200, accuracy: 94 },
        { name: "Sneha Gupta", college: "GL BAJAJ", matches: 7, score: 31500, accuracy: 91 },
        { name: "Kabir Mehta", college: "AMITY", matches: 7, score: 29800, accuracy: 89 },
        { name: "Arjun Verma", college: "IIT Bombay", matches: 6, score: 28400, accuracy: 92 },
        { name: "Priya Sharma", college: "BITS Pilani", matches: 5, score: 24100, accuracy: 88 },
        { name: "Rohan Patel", college: "NIT Trichy", matches: 4, score: 19800, accuracy: 85 }
      ]
    };
  }

  saveCollegeLeague() {
    try {
      fs.writeFileSync(LEAGUE_FILE, JSON.stringify(this.collegeLeague, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save college league:", err.message);
    }
  }

  recordMatchToLeague(room) {
    const hostCollege = room.hostCollege || "Independent League";
    if (!this.collegeLeague.colleges[hostCollege]) {
      this.collegeLeague.colleges[hostCollege] = { matchesPlayed: 0, totalPoints: 0, topScore: 0 };
    }
    this.collegeLeague.colleges[hostCollege].matchesPlayed += 1;

    const players = Array.from(room.players.values());
    const collegesInMatch = new Set();

    players.forEach(p => {
      const colName = p.college || hostCollege;
      collegesInMatch.add(colName);

      if (!this.collegeLeague.colleges[colName]) {
        this.collegeLeague.colleges[colName] = { matchesPlayed: 0, totalPoints: 0, topScore: 0 };
      }

      const col = this.collegeLeague.colleges[colName];
      col.totalPoints += p.score;
      if (p.score > col.topScore) {
        col.topScore = p.score;
      }

      // Record / update player in Hall of Fame (every real candidate who scored points)
      if (p.name && !p.name.startsWith("Host")) {
        const existing = this.collegeLeague.topPlayers.find(
          tp => tp.name.toLowerCase() === p.name.toLowerCase() && tp.college.toLowerCase() === colName.toLowerCase()
        );

        if (existing) {
          existing.matches = (existing.matches || 1) + 1;
          existing.score += p.score;
          existing.accuracy = Math.round(((existing.accuracy || 0) + (p.accuracy || 0)) / 2);
        } else {
          this.collegeLeague.topPlayers.push({
            name: p.name,
            college: colName,
            matches: 1,
            score: p.score,
            accuracy: p.accuracy || 0
          });
        }
      }
    });

    // Increment matchesPlayed for participating colleges
    collegesInMatch.forEach(colName => {
      if (colName !== hostCollege && this.collegeLeague.colleges[colName]) {
        this.collegeLeague.colleges[colName].matchesPlayed += 1;
      }
    });

    // Sort top players descending by score
    this.collegeLeague.topPlayers.sort((a, b) => b.score - a.score);
    // Keep top 100 players so that filtering by any college has rich candidate data
    this.collegeLeague.topPlayers = this.collegeLeague.topPlayers.slice(0, 100);

    this.saveCollegeLeague();

    // Real-time broadcast to all clients viewing the league
    this.io.emit("league_updated", this.collegeLeague);
  }

  // Generate short readable 6-character room code
  generateRoomCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom({ hostSocketId, questionSetId, options = {} }) {
    const questionSet = this.questionSets.find(qs => qs.id === questionSetId) || this.questionSets[0];
    const roomCode = this.generateRoomCode();

    const room = {
      code: roomCode,
      hostSocketId,
      hostCollege: options.hostCollege || "National Campus Arena",
      title: options.title || questionSet.title,
      questionSet: JSON.parse(JSON.stringify(questionSet)), // deep clone
      status: "LOBBY", // LOBBY, COUNTDOWN, QUESTION_ACTIVE, ROUND_REVIEW, GAME_OVER
      currentQuestionIndex: -1,
      questionTimer: null,
      questionStartTime: 0,
      roundDurationSeconds: options.roundDurationSeconds || 25,
      reviewDurationSeconds: options.reviewDurationSeconds || 7,
      autoAdvance: options.autoAdvance !== false, // default true: automatically moves to next round
      allowNegativeMarking: !!options.allowNegativeMarking,
      powerUpsEnabled: options.powerUpsEnabled !== false, // default true
      shuffleQuestions: options.shuffleQuestions !== false, // Host toggle: shuffle question sequence
      shuffleOptions: options.shuffleOptions !== false, // Host toggle: shuffle options per candidate
      maxCapacity: 50,
      players: new Map(), // playerId -> Player
      answersCurrentRound: new Map(), // playerId -> AnswerObj
      roundStats: [], // stats per question
      previousRankings: [] // for tracking rank climb/drop
    };

    if (room.shuffleQuestions) {
      room.questionSet.questions = shuffleArray(room.questionSet.questions);
    }

    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    return this.rooms.get(roomCode.trim().toUpperCase());
  }

  addPlayer(roomCode, { playerId, socketId, name, college, avatar }) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error("Room not found");
    if (room.status !== "LOBBY" && !room.players.has(playerId)) {
      throw new Error("Match already started. Late joins cannot enter fresh.");
    }
    if (room.players.size >= room.maxCapacity && !room.players.has(playerId)) {
      throw new Error("Room reached max capacity (50 players).");
    }

    // Reconnection or new player
    let player = room.players.get(playerId);
    if (player) {
      // Reconnecting player!
      player.socketId = socketId;
      player.isOnline = true;
      if (name) player.name = name;
      if (college) player.college = college;
    } else {
      player = {
        id: playerId || uuidv4(),
        socketId,
        name: name || `Player_${Math.floor(1000 + Math.random() * 9000)}`,
        college: college || room.hostCollege,
        avatar: avatar || "🚀",
        score: 0,
        streak: 0,
        highestStreak: 0,
        correctCount: 0,
        accuracy: 0,
        topicStats: {}, // { [topic]: { correct: 0, total: 0 } }
        powerUps: {
          fiftyFiftyUsed: false,
          twoXUsed: false
        },
        shuffledOptionsMap: new Map(), // questionIndex -> shuffledOptions
        active2X: false,
        ping: 50,
        isOnline: true,
        connectedAt: Date.now()
      };
      room.players.set(player.id, player);
    }

    return { room, player };
  }

  handlePlayerDisconnect(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      for (const [pId, player] of room.players.entries()) {
        if (player.socketId === socketId) {
          player.isOnline = false;
          this.io.to(code).emit("player_status_change", {
            playerId: pId,
            isOnline: false,
            playerCount: Array.from(room.players.values()).filter(p => p.isOnline).length
          });
          break;
        }
      }
    }
  }

  startCountdown(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== "LOBBY") return;

    room.status = "COUNTDOWN";
    let countdown = 5;

    this.io.to(roomCode).emit("game_countdown_start", { countdown });

    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        this.io.to(roomCode).emit("game_countdown_tick", { countdown });
      } else {
        clearInterval(interval);
        this.startNextQuestion(roomCode);
      }
    }, 1000);
  }

  startNextQuestion(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = null;
    }
    if (room.reviewTimer) {
      clearTimeout(room.reviewTimer);
      room.reviewTimer = null;
    }

    room.currentQuestionIndex += 1;
    const questions = room.questionSet.questions;

    if (room.currentQuestionIndex >= questions.length) {
      this.endGame(roomCode);
      return;
    }

    const currentQ = questions[room.currentQuestionIndex];
    room.status = "QUESTION_ACTIVE";
    room.answersCurrentRound.clear();
    room.questionStartTime = Date.now();
    // Prioritize host-chosen duration for this match
    const duration = Number(room.roundDurationSeconds) || Number(currentQ.timeLimitSeconds) || 25;

    // Reset single-round active 2x flags
    for (const player of room.players.values()) {
      player.active2X = false;
    }

    // Save previous standings for climb/fall delta
    const currentStandings = Array.from(room.players.values())
      .sort((a, b) => b.score - a.score)
      .map(p => p.id);
    room.previousRankings = currentStandings;

    // Send question to each player with options (shuffled if shuffleOptions is enabled)
    // Notice: correctOptionId is NEVER sent to the client!
    for (const player of room.players.values()) {
      const optionsToSend = room.shuffleOptions !== false ? shuffleArray(currentQ.options) : [...currentQ.options];
      player.shuffledOptionsMap.set(room.currentQuestionIndex, optionsToSend);

      if (player.socketId) {
        this.io.to(player.socketId).emit("question_start", {
          questionIndex: room.currentQuestionIndex,
          totalQuestions: questions.length,
          topic: currentQ.topic,
          subtopic: currentQ.subtopic,
          difficulty: currentQ.difficulty,
          question: currentQ.question,
          hasTable: !!currentQ.hasTable,
          tableData: currentQ.tableData || null,
          options: optionsToSend.map(opt => ({ id: opt.id, text: opt.text })), // clean options without any answer clues
          timeLimitSeconds: duration,
          serverStartTime: room.questionStartTime,
          streak: player.streak,
          score: player.score,
          powerUps: player.powerUps
        });
      }
    }

    // Also emit to spectator / projector room (host view)
    this.io.to(`host_${roomCode}`).emit("host_question_active", {
      questionIndex: room.currentQuestionIndex,
      totalQuestions: questions.length,
      topic: currentQ.topic,
      difficulty: currentQ.difficulty,
      question: currentQ.question,
      hasTable: !!currentQ.hasTable,
      tableData: currentQ.tableData || null,
      options: currentQ.options,
      timeLimitSeconds: duration,
      serverStartTime: room.questionStartTime
    });

    // Server-authoritative timer: Ends round when duration expires (+ 350ms network transit buffer)
    room.questionTimer = setTimeout(() => {
      this.resolveRound(roomCode);
    }, duration * 1000 + 350);
  }

  handleAnswerSubmission(roomCode, { playerId, optionId, clientTimestamp }) {
    const room = this.getRoom(roomCode);
    if (!room) return { success: false, message: "Room not found" };
    if (room.status !== "QUESTION_ACTIVE") {
      return { success: false, message: "Round is not currently active" };
    }

    const player = room.players.get(playerId);
    if (!player) return { success: false, message: "Player not found" };

    if (room.answersCurrentRound.has(playerId)) {
      return { success: false, message: "Answer already registered for this round" };
    }

    const currentQ = room.questionSet.questions[room.currentQuestionIndex];
    const serverNow = Date.now();
    const durationMs = (Number(room.roundDurationSeconds) || Number(currentQ.timeLimitSeconds) || 25) * 1000;

    // Check if submission exceeded server cutoff
    const elapsedSinceStart = serverNow - room.questionStartTime;
    if (elapsedSinceStart > durationMs + 500) {
      return { success: false, message: "Time expired" };
    }

    // Network Delay Fairness Calculation:
    // Effective latency compensation using half estimated ping, bounded between 0 and 400ms
    const estimatedLatency = Math.min(player.ping || 60, 400);
    const fairResponseTimeMs = Math.max(200, elapsedSinceStart - Math.round(estimatedLatency / 2));
    const timeRemainingMs = Math.max(0, durationMs - fairResponseTimeMs);

    const isCorrect = optionId === currentQ.correctOptionId;
    let pointsEarned = 0;

    if (isCorrect) {
      // Speed + Accuracy Scoring Formula:
      // Base: 500 points
      // Speed Bonus: up to 500 points proportional to time remaining
      const speedBonus = Math.round(500 * (timeRemainingMs / durationMs));
      let roundPoints = 500 + speedBonus;

      // Streak Bonus Multiplier (1.1x to 1.5x)
      const streakMultiplier = 1 + Math.min(player.streak * 0.1, 0.5);
      roundPoints = Math.round(roundPoints * streakMultiplier);

      // Power-up 2X boost check
      if (player.active2X) {
        roundPoints *= 2;
      }

      pointsEarned = roundPoints;
      player.streak += 1;
      if (player.streak > player.highestStreak) {
        player.highestStreak = player.streak;
      }
      player.correctCount += 1;
    } else {
      player.streak = 0;
      if (room.allowNegativeMarking) {
        pointsEarned = -200;
      } else {
        pointsEarned = 0;
      }
    }

    player.score = Math.max(0, player.score + pointsEarned);

    // Update topic statistics
    if (!player.topicStats[currentQ.topic]) {
      player.topicStats[currentQ.topic] = { correct: 0, total: 0 };
    }
    player.topicStats[currentQ.topic].total += 1;
    if (isCorrect) {
      player.topicStats[currentQ.topic].correct += 1;
    }

    const answerRecord = {
      playerId,
      playerName: player.name,
      optionId,
      isCorrect,
      responseTimeMs: fairResponseTimeMs,
      pointsEarned,
      currentScore: player.score,
      answeredAt: serverNow
    };

    room.answersCurrentRound.set(playerId, answerRecord);

    // Notify host & room about live answer count
    const totalAnswered = room.answersCurrentRound.size;
    const totalOnline = Array.from(room.players.values()).filter(p => p.isOnline).length;

    this.io.to(roomCode).emit("answer_submitted_update", {
      totalAnswered,
      totalPlayers: totalOnline,
      playerId
    });

    // If every online player has submitted answers, conclude round immediately!
    if (totalAnswered >= totalOnline && totalOnline > 0) {
      if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = null;
      }
      // Small pause of 400ms for dramatic finish
      setTimeout(() => {
        this.resolveRound(roomCode);
      }, 400);
    }

    return { success: true, pointsEarned, isCorrect };
  }

  usePowerUp(roomCode, { playerId, type }) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== "QUESTION_ACTIVE") {
      return { success: false, message: "Invalid state" };
    }
    if (!room.powerUpsEnabled) {
      return { success: false, message: "Power-ups are disabled in this room" };
    }

    const player = room.players.get(playerId);
    if (!player) return { success: false, message: "Player not found" };

    const currentQ = room.questionSet.questions[room.currentQuestionIndex];

    if (type === "fifty_fifty") {
      if (player.powerUps.fiftyFiftyUsed) {
        return { success: false, message: "50:50 already used" };
      }
      player.powerUps.fiftyFiftyUsed = true;

      // Find 2 wrong options to eliminate
      const wrongOptions = currentQ.options
        .filter(opt => opt.id !== currentQ.correctOptionId)
        .map(opt => opt.id);
      const shuffledWrongs = shuffleArray(wrongOptions);
      const eliminated = shuffledWrongs.slice(0, 2);

      return { success: true, type: "fifty_fifty", eliminatedOptionIds: eliminated };
    }

    if (type === "two_x") {
      if (player.powerUps.twoXUsed) {
        return { success: false, message: "2X Multiplier already used" };
      }
      player.powerUps.twoXUsed = true;
      player.active2X = true;
      return { success: true, type: "two_x" };
    }

    return { success: false, message: "Unknown power-up" };
  }

  resolveRound(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== "QUESTION_ACTIVE") return;

    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = null;
    }
    if (room.reviewTimer) {
      clearTimeout(room.reviewTimer);
      room.reviewTimer = null;
    }

    room.status = "ROUND_REVIEW";
    const currentQ = room.questionSet.questions[room.currentQuestionIndex];
    const totalQuestions = room.questionSet.questions.length;
    const isLastQuestion = room.currentQuestionIndex + 1 >= totalQuestions;

    // Compute answer distribution (A, B, C, D count)
    const distribution = {};
    currentQ.options.forEach(opt => {
      distribution[opt.id] = 0;
    });

    for (const ans of room.answersCurrentRound.values()) {
      if (distribution[ans.optionId] !== undefined) {
        distribution[ans.optionId] += 1;
      }
    }

    // Sort current standings
    const sortedPlayers = Array.from(room.players.values()).sort((a, b) => b.score - a.score);

    // Calculate leaderboard with movement (climbed, dropped, stayed)
    const leaderboard = sortedPlayers.map((player, index) => {
      const currentRank = index + 1;
      const prevIndex = room.previousRankings.indexOf(player.id);
      let rankDelta = 0;
      if (prevIndex !== -1) {
        const prevRank = prevIndex + 1;
        rankDelta = prevRank - currentRank; // positive = climbed, negative = dropped
      }

      const answer = room.answersCurrentRound.get(player.id);
      return {
        id: player.id,
        name: player.name,
        college: player.college,
        avatar: player.avatar,
        score: player.score,
        rank: currentRank,
        rankDelta,
        streak: player.streak,
        isOnline: player.isOnline,
        lastPointsEarned: answer ? answer.pointsEarned : 0,
        answeredCorrectly: answer ? answer.isCorrect : false,
        selectedOptionId: answer ? answer.optionId : null
      };
    });

    // Build canonical options with correct flag
    const optionsPayload = currentQ.options.map((opt, idx) => ({
      id: opt.id,
      text: opt.text,
      letter: String.fromCharCode(65 + idx),
      isCorrect: opt.id === currentQ.correctOptionId
    }));

    const correctOpt = currentQ.options.find(o => o.id === currentQ.correctOptionId);

    // Distribution with full option details and letters
    const distributionDetails = currentQ.options.map((opt, idx) => ({
      id: opt.id,
      text: opt.text,
      letter: String.fromCharCode(65 + idx),
      isCorrect: opt.id === currentQ.correctOptionId,
      count: distribution[opt.id] || 0
    }));

    // Build comprehensive personalized results map for every player (rank 1 to 50)
    const playerResults = {};
    for (const player of room.players.values()) {
      const answer = room.answersCurrentRound.get(player.id);
      const chosenOpt = answer ? currentQ.options.find(o => o.id === answer.optionId) : null;

      // Determine option letter as presented on THIS player's device
      const playerShuffled = player.shuffledOptionsMap?.get(room.currentQuestionIndex) || currentQ.options;
      const chosenIndex = chosenOpt ? playerShuffled.findIndex(o => o.id === chosenOpt.id) : -1;
      const correctIndex = correctOpt ? playerShuffled.findIndex(o => o.id === correctOpt.id) : -1;

      const pRank = sortedPlayers.findIndex(p => p.id === player.id) + 1;

      playerResults[player.id] = {
        playerId: player.id,
        playerName: player.name,
        hasAnswered: !!answer,
        answeredCorrectly: answer ? answer.isCorrect : false,
        selectedOptionId: answer ? answer.optionId : null,
        selectedOptionText: chosenOpt ? chosenOpt.text : null,
        selectedOptionLetter: chosenIndex >= 0 ? String.fromCharCode(65 + chosenIndex) : null,
        correctOptionId: currentQ.correctOptionId,
        correctOptionText: correctOpt ? correctOpt.text : "",
        correctOptionLetter: correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : "A",
        pointsEarned: answer ? answer.pointsEarned : (room.allowNegativeMarking ? -200 : 0),
        score: player.score,
        streak: player.streak,
        rank: pRank
      };

      // Emit direct personal notification to player socket
      if (player.socketId) {
        this.io.to(player.socketId).emit("player_round_result", playerResults[player.id]);
      }
    }

    // Record round statistics for faculty analytics
    room.roundStats.push({
      questionIndex: room.currentQuestionIndex,
      questionId: currentQ.id,
      questionText: currentQ.question,
      topic: currentQ.topic,
      difficulty: currentQ.difficulty,
      correctOptionId: currentQ.correctOptionId,
      distribution,
      totalAnswered: room.answersCurrentRound.size,
      correctAnswersCount: Array.from(room.answersCurrentRound.values()).filter(a => a.isCorrect).length
    });

    // Broadcast round resolution to all players and spectators
    this.io.to(roomCode).emit("round_resolved", {
      questionIndex: room.currentQuestionIndex,
      totalQuestions,
      isLastQuestion,
      autoAdvance: room.autoAdvance,
      reviewDurationSeconds: room.reviewDurationSeconds,
      questionText: currentQ.question,
      options: optionsPayload,
      correctOptionId: currentQ.correctOptionId,
      correctOptionText: correctOpt ? correctOpt.text : "",
      explanation: currentQ.explanation,
      distribution,
      distributionDetails,
      playerResults,
      leaderboard: leaderboard.slice(0, 10), // Top 10 for quick display
      fullLeaderboardLength: leaderboard.length
    });

    // Host receives detailed breakdown
    this.io.to(`host_${roomCode}`).emit("host_round_resolved", {
      questionIndex: room.currentQuestionIndex,
      totalQuestions,
      isLastQuestion,
      autoAdvance: room.autoAdvance,
      reviewDurationSeconds: room.reviewDurationSeconds,
      questionText: currentQ.question,
      options: optionsPayload,
      correctOptionId: currentQ.correctOptionId,
      correctOptionText: correctOpt ? correctOpt.text : "",
      explanation: currentQ.explanation,
      distribution,
      distributionDetails,
      playerResults,
      leaderboard
    });

    // Automatically transition to next question if autoAdvance is enabled
    if (room.autoAdvance) {
      room.reviewTimer = setTimeout(() => {
        if (room.status === "ROUND_REVIEW") {
          this.startNextQuestion(roomCode);
        }
      }, room.reviewDurationSeconds * 1000);
    }
  }

  endGame(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    if (room.questionTimer) {
      clearTimeout(room.questionTimer);
      room.questionTimer = null;
    }
    if (room.reviewTimer) {
      clearTimeout(room.reviewTimer);
      room.reviewTimer = null;
    }

    room.status = "GAME_OVER";
    const totalQuestions = room.questionSet.questions.length;

    // Calculate accuracy and metrics for each player
    for (const player of room.players.values()) {
      player.accuracy = totalQuestions > 0 ? Math.round((player.correctCount / totalQuestions) * 100) : 0;
    }

    const sortedPlayers = Array.from(room.players.values())
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({
        rank: idx + 1,
        id: p.id,
        name: p.name,
        college: p.college,
        avatar: p.avatar,
        score: p.score,
        accuracy: p.accuracy,
        correctCount: p.correctCount,
        highestStreak: p.highestStreak,
        topicStats: p.topicStats
      }));

    // Record match into college league
    this.recordMatchToLeague(room);

    // Broadcast final game over podium
    this.io.to(roomCode).emit("game_over", {
      podium: sortedPlayers.slice(0, 3),
      leaderboard: sortedPlayers,
      totalQuestions,
      roomTitle: room.title,
      college: room.hostCollege
    });

    this.io.to(`host_${roomCode}`).emit("host_game_over", {
      leaderboard: sortedPlayers,
      roundStats: room.roundStats
    });
  }

  // Export Room Analytics to CSV
  exportRoomCSV(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    let csv = "Rank,Player Name,College,Final Score,Accuracy (%),Correct Answers,Highest Streak\n";
    const sorted = Array.from(room.players.values()).sort((a, b) => b.score - a.score);

    sorted.forEach((p, idx) => {
      csv += `${idx + 1},"${p.name}","${p.college}",${p.score},${p.accuracy}%,${p.correctCount},${p.highestStreak}\n`;
    });

    csv += "\nQuestion Analytics\n";
    csv += "Question #,Topic,Difficulty,Total Answered,Correct Count,Accuracy (%)\n";

    room.roundStats.forEach((stat, idx) => {
      const acc = stat.totalAnswered > 0 ? Math.round((stat.correctAnswersCount / stat.totalAnswered) * 100) : 0;
      csv += `${idx + 1},"${stat.topic}","${stat.difficulty}",${stat.totalAnswered},${stat.correctAnswersCount},${acc}%\n`;
    });

    return csv;
  }
}
