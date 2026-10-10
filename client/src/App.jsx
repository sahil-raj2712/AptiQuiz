import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import RulesModal from "./components/RulesModal";
import JoinScreen from "./components/JoinScreen";
import HostStudio from "./components/HostStudio";
import LobbyView from "./components/LobbyView";
import ArenaView from "./components/ArenaView";
import RoundReviewView from "./components/RoundReviewView";
import GameOverView from "./components/GameOverView";
import SpectatorArena from "./components/SpectatorArena";
import CollegeLeagueView from "./components/CollegeLeagueView";
import { socket } from "./utils/socket";

export default function App() {
  const [currentView, setCurrentView] = useState("home"); // home, host, lobby, arena, review, game_over, spectator, league
  const [showRules, setShowRules] = useState(false);

  // Active Session State
  const [activeRoom, setActiveRoom] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isHost, setIsHost] = useState(false);

  // Gameplay State
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [roundResultData, setRoundResultData] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);

  // Seamless Reconnection on page reload
  useEffect(() => {
    const savedRoom = localStorage.getItem("aptiquiz_room_code");
    const savedPlayerId = localStorage.getItem("aptiquiz_player_id");

    if (savedRoom && savedPlayerId) {
      socket.emit("reconnect_room", {
        roomCode: savedRoom,
        playerId: savedPlayerId
      }, (res) => {
        if (res?.success) {
          setActiveRoom(res.room);
          setCurrentPlayer(res.player);

          if (res.activeQuestion) {
            setCurrentQuestionData(res.activeQuestion);
            setCurrentView("arena");
          } else if (res.room.status === "LOBBY") {
            setCurrentView("lobby");
          } else if (res.room.status === "ROUND_REVIEW") {
            setCurrentView("review");
          } else if (res.room.status === "GAME_OVER") {
            setCurrentView("game_over");
          }
        }
      });
    }

    // Global Socket Listeners for Active Match
    const onQuestionStart = (data) => {
      setCurrentQuestionData(data);
      setCurrentView("arena");
    };

    const onRoundResolved = (result) => {
      setRoundResultData(result);
      setCurrentView("review");
    };

    const onGameOver = (data) => {
      setGameOverData(data);
      setCurrentView("game_over");
    };

    socket.on("question_start", onQuestionStart);
    socket.on("round_resolved", onRoundResolved);
    socket.on("game_over", onGameOver);

    return () => {
      socket.off("question_start", onQuestionStart);
      socket.off("round_resolved", onRoundResolved);
      socket.off("game_over", onGameOver);
    };
  }, []);

  const handleJoinedRoom = ({ room, player, isHost: hostFlag }) => {
    setActiveRoom(room);
    setCurrentPlayer(player);
    setIsHost(hostFlag);
    setCurrentView("lobby");
  };

  const handleRoomCreated = ({ room, isHost: hostFlag }) => {
    setActiveRoom(room);
    setIsHost(hostFlag);
    setCurrentView("lobby");
  };

  const handleResetMatch = () => {
    localStorage.removeItem("aptiquiz_room_code");
    setActiveRoom(null);
    setCurrentPlayer(null);
    setCurrentQuestionData(null);
    setRoundResultData(null);
    setGameOverData(null);
    setCurrentView("home");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar (hidden in full-screen spectator mode) */}
      {currentView !== "spectator" && (
        <Navbar
          currentView={currentView}
          setView={setCurrentView}
          onOpenRules={() => setShowRules(true)}
          activeRoomCode={activeRoom?.code}
        />
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentView === "home" && (
          <JoinScreen
            onJoined={handleJoinedRoom}
            presetRoomCode={activeRoom?.code || ""}
          />
        )}

        {currentView === "host" && (
          <HostStudio
            onRoomCreated={handleRoomCreated}
          />
        )}

        {currentView === "lobby" && activeRoom && (
          <LobbyView
            room={activeRoom}
            player={currentPlayer}
            isHost={isHost}
            onGameStarted={(data) => {
              setCurrentQuestionData(data);
              setCurrentView("arena");
            }}
          />
        )}

        {currentView === "arena" && currentQuestionData && activeRoom && (
          <ArenaView
            questionData={currentQuestionData}
            room={activeRoom}
            player={currentPlayer}
            onRoundResolved={(result) => {
              setRoundResultData(result);
              setCurrentView("review");
            }}
          />
        )}

        {currentView === "review" && roundResultData && activeRoom && (
          <RoundReviewView
            result={roundResultData}
            room={activeRoom}
            player={currentPlayer}
            isHost={isHost}
            onNextQuestion={() => {}}
          />
        )}

        {currentView === "game_over" && gameOverData && activeRoom && (
          <GameOverView
            gameOverData={gameOverData}
            room={activeRoom}
            player={currentPlayer}
            onPlayAgain={handleResetMatch}
            onViewLeague={() => setCurrentView("league")}
          />
        )}

        {currentView === "spectator" && activeRoom && (
          <SpectatorArena
            room={activeRoom}
            onExit={() => setCurrentView(isHost ? "host" : "home")}
          />
        )}

        {currentView === "league" && (
          <CollegeLeagueView />
        )}
      </main>

      {/* Official Rules & Scoring Modal */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />

      {/* Footer */}
      {currentView !== "spectator" && (
        <footer style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "24px 20px",
          textAlign: "center",
          color: "var(--text-dim)",
          fontSize: "0.85rem",
          marginTop: "60px"
        }}>
          <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span>
              <strong>AptiQuiz</strong> • Problem Statement 3: Aptitude practice as a live multiplayer game
            </span>
            <span style={{ display: "flex", gap: "16px" }}>
              <button 
                onClick={() => setShowRules(true)} 
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                Scoring Formula & Network Delay Fairness
              </button>
              <span>Built for Code2Career Placement Hackathon</span>
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}
