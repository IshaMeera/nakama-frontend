import { useRef, useEffect, useState } from "react";
import { Client } from "@heroiclabs/nakama-js";
import "./index.css";
const client = new Client("defaultkey", import.meta.env.VITE_BASE_URL, "443", true);

export default function Game() {
  const [socket, setSocket] = useState(null);
  const [matchId, setMatchId] = useState("");
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [turn, setTurn] = useState("");
  const [winner, setWinner] = useState("");
  const [mySymbol, setMySymbol] = useState("");
  const [myUserId, setMyUserId] = useState("");
  const [winningLine, setWinningLine] = useState([]);
  const [screen, setScreen] = useState("lobby");
  const [session, setSession] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const hasInitialized = useRef(false);
  const myUserIdRef = useRef("");
  const isMyTurn = turn === mySymbol && !winner;

  const getLineStyle = () => {
    if (!winningLine.length) return {};

    const [[x1, y1], [x2, y2]] = winningLine;

    if (x1 === x2) {
      return {
        top: x1 * 80 + 40,
        left: 0,
        width: 240,
        height: 4,
        transform: "scaleX(1)",
      };
    }

    if (y1 === y2) {
      return {
        left: y1 * 80 + 40,
        top: 0,
        width: 4,
        height: 240,
        transform: "scaleY(1)",
      };
    }

    if (x1 === 0 && y1 === 0) {
      return {
        top: 0,
        left: 0,
        width: 240,
        height: 4,
        transform: "rotate(45deg)",
      };
    }

    return {
      top: 0,
      left: 0,
      width: 240,
      height: 4,
      transform: "rotate(-45deg)",
    };
  };

  useEffect(()=>{
    return()=>{
      if(socket && matchId){
        console.log("Leaving match:", matchId);
        socket.leaveMatch(matchId);
        //socket.disconnect();
      }
    }
  },[socket, matchId]);

  useEffect(() => {
 
    if(hasInitialized.current) return;
    hasInitialized.current = true;
    async function init() {
      // auth
      const session = await client.authenticateDevice(
        "device_" + Math.random()
      );

      // socket connect
      const socket = client.createSocket(true);
      await socket.connect(session, true);

      setSocket(socket);
      setSession(session);

      // listen updates
      socket.onmatchdata = (data) => { //runs after every move n after player joins
        const state = JSON.parse(
          new TextDecoder().decode(data.data)
        );
        console.log("Received match update:", state);
        if (state.players && state.players.length > 0) {
          const me = state.players.find(
            p => p.userId === myUserIdRef.current
          );
          console.log("Me:", me);
          if (me) {
            console.log("ME found:", me);
            setMySymbol(me.symbol);
          }
        }

        setBoard([...state.board.map(row => [...row])]);
        setTurn(state.turn);
        setWinner(state.winner);
        setWinningLine(state.winningLine || []);
      };
    }

    init();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const joinMatch = async (matchId) =>{
    if(!socket) return;
    const cleanId = matchId.trim().replace(/\s/g, "");

    const match = await socket.joinMatch(cleanId);
    setMatchId(cleanId);

    myUserIdRef.current = match.self.user_id; //useRef prevent stale closure, [userId "",me not found]
    setMyUserId(match.self.user_id);

    setScreen("game");
  }

  const handleCreateMatch = async () => {
    if(!socket || !session) return;

    const res = await client.rpc(session, "create_match", "");
    const parsed = typeof res.payload === "string"
            ? JSON.parse(res.payload)
            : res.payload;
    setRoomCode(parsed.code);
    setShowModal(true);
    await joinMatch(parsed.matchId);
  }

  const handleFindMatch = async () => {
    if(!socket || !session) return;

    const res = await client.rpc(session, "find_match", "");
    const parsed = typeof res.payload === "string"
            ? JSON.parse(res.payload)
            : res.payload;

    await joinMatch(parsed.matchId);
  }

  const handleJoinByCode = async() => {
  if (!socket || !session || !inputCode) return;

  const cleanCode = inputCode.trim().replace(/\s/g, "");

  console.log("Joining with cleaned code:", cleanCode);

  // const res = await client.rpc(
  //   session,
  //   "join_by_code",
  //   JSON.stringify({ code: cleanCode })
  // );

  // const parsed =
  //   typeof res.payload === "string"
  //     ? JSON.parse(res.payload)
  //     : res.payload;

  // if (parsed.error) {
  //   alert("Invalid code");
  //   return;
  // }

  await joinMatch(cleanCode);
};

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    backgroundImage: "url('/bgg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    position: "relative",
  },

  left: {
    position: "relative",
    zIndex: 1,
    maxWidth: "500px",
    width: "100%",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 30,
    alignItems: "center",
    textAlign: "center",
  },

  // right: {
  //   flex: 1,
  //   backgroundImage: "url('/bgg.png')",
  //   backgroundSize: "cover",
  //   backgroundPosition: "center",
  //   display: isMobile ? "none" : "block"
  // },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(2, 6, 23, 0.8)",
  },
  title: {
    color: "white",
    fontSize: "3rem",
    fontWeight: "600",
    letterSpacing: "1px"
  },

  buttonRow: {
    display: "flex",
    gap: 16
  },

  primaryBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "12px 22px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
    transition: "all 0.2s ease"
  },

  secondaryBtn: {
    background: "transparent",
    color: "white",
    border: "1px solid #334155",
    padding: "12px 22px",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },

  joinSection: {
    display: "flex",
    gap: 10,
    alignItems: "center"
  },

  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    background: "rgba(255,255,255,0.03)",
    color: "white",
    outline: "none",
    width: 200,
    backdropFilter: "blur(6px)"
  },

  joinBtn: {
    background: "#22c55e",
    border: "none",
    padding: "12px 18px",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  },
  
  gameContainer: {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617"
},

gameCard: {
  background: "#111827",
  padding: "30px",
  borderRadius: "16px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  minWidth: "320px"
},

backBtn: {
  marginBottom: 15,
  background: "transparent",
  color: "#94a3b8",
  border: "none",
  cursor: "pointer",
  fontSize: "14px"
}
};

   if (screen === "lobby") {
  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.left}>
        <h1 style={styles.title}>Tic Tac Toe</h1>

        <div style={styles.buttonRow}>
          <button style={styles.primaryBtn} onClick={handleCreateMatch}>
            Create Room
          </button>

          <button style={styles.secondaryBtn} onClick={handleFindMatch}>
            Quick Match
          </button>
        </div>

        <div style={styles.joinSection}>
          <input
            style={styles.input}
            placeholder="Enter Room Code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />

          <button style={styles.joinBtn} onClick={handleJoinByCode}>
            Join
          </button>
        </div>
      </div>
      <div style={styles.right}></div>
    </div>
  );
}

  const handleClick = (x, y) => {
    console.log("clicked", x,y);
    if (!socket || !matchId){
         console.log("Socket or match not ready yet");
         return;
    };
    if(turn !== mySymbol){
      console.log("Not your turn");
      return;
    }
    socket.sendMatchState(matchId, 1, JSON.stringify({ x, y }));
  };

  if(screen === "game") {
  return (
    <>
  {showModal && (
  <div
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowModal(false);
    }}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "linear-gradient(to right, rgba(2,6,23,0.9), rgba(2,6,23,0.6))",
        padding: "30px 40px",
        borderRadius: "16px",
        textAlign: "center",
        width: "420px",
        maxWidth: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
      }}
    >
      <h2 style={{ marginBottom: 10 }}>Invite a friend 🎮</h2>

      <p style={{ color: "#9ca3af", marginBottom: 20 }}>
        Share this code
      </p>

      <div
        style={{
          background: "#020617",
          padding: "12px",
          borderRadius: "8px",
          wordBreak: "break-all",
          fontSize: "14px",
          marginBottom: 20
        }}
      >
        {roomCode}
      </div>

      <button
        onClick={() => navigator.clipboard.writeText(roomCode)}
        style={{
          background: "#6366f1",
          border: "none",
          padding: "10px 16px",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer",
          marginRight: 10
        }}
      >
        Copy
      </button>

      <button
        onClick={() => setShowModal(false)}
        style={{
          background: "#1f2937",
          border: "1px solid #374151",
          padding: "10px 16px",
          borderRadius: "8px",
          color: "white",
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

  <div style={styles.gameContainer}>
      <div style={styles.gameCard}>

        <button
          onClick={() => {
            if (socket && matchId) {
              socket.leaveMatch(matchId);
            }
            setMatchId("");
            setScreen("lobby");
          }}
          style={styles.backBtn}
        >
          ← Back
        </button>
    <h1>Tic Tac Toe</h1>
    <h3>You are: {mySymbol || "..."}</h3>

    <h3>
      {winner
        ? "Game Over"
        : turn === mySymbol
        ? "Your Turn"
        : "Opponent's Turn"}
    </h3>

    {winner && (
      <h2 style={{ color: "#d4edda", marginTop: 10 }}>
         {winner === "draw" ? "It's a Draw!" : winner === mySymbol ? "You Win!" : "You Lose!"}
      </h2>
    )}
    {winningLine.length > 0 && (
    <div
      style={{
        className: "strike-line",
        position: "absolute",
        background: "red",
        transformOrigin: "left",
        transition: "all 0.5s ease",
        ...getLineStyle(),
      }}
    />
  )}

    <div style={{ display: "inline-block", position: "relative" }}>
      {board.map((row, i) => (
        <div key={i} style={{ display: "flex" }}>
          {row.map((cell, j) => {
            const isWinningCell = winningLine.some(
              ([x, y]) => x === i && y === j
            );

            return (
              <div
                key={j}
                onClick={() => handleClick(i, j)}
                style={{
                  width: 80,
                  height: 80,
                  border: "1px solid black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  backgroundColor: isWinningCell ? "#d4edda" : "",
                  transition: "all 0.3s ease",

                  cursor: isMyTurn ? "pointer" : "not-allowed",
                  opacity: isMyTurn ? 1 : 0.6,

                  backgroundColor: isWinningCell ? "#d4edda" : "",

                  transition: "all 0.3s ease",

                  color: cell === "X" ? "#ff0000" : "#fdfdfd",
                  fontWeight: "bold",
                }}
              >
                {cell}
              </div>
            );
          })}
        </div>
      ))}
    </div>
    </div>
  </div>
  </>
  );}}