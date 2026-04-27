import React, { useState, useEffect } from "react";

const Monkypolin = () => {
  const [birdPos, setBirdPos] = useState(40);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState([]);

  // Fungsi untuk reset game
  const resetGame = () => {
    setBirdPos(40);
    setScore(0);
    setPipes([]);
    setGameOver(false);
    setGameStarted(true);
  };

  // Logic Gravitasi
  useEffect(() => {
    let gravity;
    if (gameStarted && !gameOver && birdPos < 90) {
      gravity = setInterval(() => {
        setBirdPos((pos) => pos + 0.6);
      }, 20);
    }
    return () => clearInterval(gravity);
  }, [gameStarted, gameOver, birdPos]);

  // Logic Pergerakan Pohon, Score, dan Tabrakan
  useEffect(() => {
    let pipeGenerator;
    if (gameStarted && !gameOver) {
      pipeGenerator = setInterval(() => {
        setPipes((currPipes) => {
          const movedPipes = currPipes.map((p) => ({ ...p, left: p.left - 1 }));
          const filteredPipes = movedPipes.filter((p) => p.left > -20);

          // --- LOGIC TABRAKAN (COLLISION) ---
          const hitPipe = filteredPipes.find((p) => {
            const isInsidePipeX = p.left < 25 && p.left + 10 > 15;
            const hitTopPipe = birdPos < p.topHeight;
            // Celah dilebarin sedikit (25) agar lebih bersahabat bagi pemain
            const hitBottomPipe = birdPos > p.topHeight + 25;
            return isInsidePipeX && (hitTopPipe || hitBottomPipe);
          });

          if (hitPipe || birdPos > 88 || birdPos < 0) {
            setGameOver(true);
          }

          // Update Score
          filteredPipes.forEach((p) => {
            if (p.left < 15 && !p.passed) {
              p.passed = true;
              setScore((s) => s + 1);
            }
          });

          // --- LOGIC SPAWN POHON ---
          // Jarak diset ke 40 agar antar pohon lebih lega
          if (
            filteredPipes.length === 0 ||
            filteredPipes[filteredPipes.length - 1].left < 40
          ) {
            const randomHeight = Math.floor(Math.random() * 40) + 15;
            filteredPipes.push({
              left: 100,
              topHeight: randomHeight,
              id: Math.random(),
              passed: false,
            });
          }

          return filteredPipes;
        });
      }, 20);
    }
    return () => clearInterval(pipeGenerator);
  }, [gameStarted, gameOver, birdPos]);

  const handleJump = () => {
    if (gameOver) return;
    if (!gameStarted) setGameStarted(true);
    setBirdPos((pos) => {
      const newPos = pos - 8;
      return newPos > 0 ? newPos : 0;
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-zinc-900">
      <div
        className="relative w-full max-w-[450px] h-full bg-gradient-to-b from-sky-300 to-sky-500 overflow-hidden touch-none select-none shadow-2xl"
        onTouchStart={handleJump}
        onClick={handleJump}
      >
        {/* Score Board */}
        <div className="absolute top-10 w-full text-center z-10">
          <h1 className="text-white text-6xl font-black drop-shadow-lg">
            {score}
          </h1>
          {!gameStarted && !gameOver && (
            <p className="text-white font-bold animate-pulse mt-4 text-xl tracking-widest">
              TAP TO START
            </p>
          )}
        </div>

        {/* --- OBSTACLES: POHON HUTAN --- */}
        {pipes.map((pipe) => (
          <React.Fragment key={pipe.id}>
            {/* POHON ATAS */}
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: `${pipe.left}%`,
                top: 0,
                height: `${pipe.topHeight}%`,
                width: "64px",
              }}
            >
              <div className="w-6 h-full bg-[#5D2E0A] border-x-2 border-[#3d1e07]" />
              <div className="relative w-20 h-16 bg-emerald-600 rounded-full -mt-2 border-b-4 border-emerald-800 shadow-lg flex flex-col items-center justify-end pb-1">
                <div className="absolute -left-2 top-2 w-10 h-10 bg-emerald-600 rounded-full" />
                <div className="absolute -right-2 top-2 w-10 h-10 bg-emerald-600 rounded-full" />
              </div>
            </div>

            {/* POHON BAWAH */}
            <div
              className="absolute flex flex-col items-center justify-end"
              style={{
                left: `${pipe.left}%`,
                bottom: "10%",
                height: `${65 - pipe.topHeight}%`, // Disesuaikan dengan lebar celah (hitbox)
                width: "64px",
              }}
            >
              <div className="relative w-20 h-16 bg-emerald-600 rounded-full -mb-2 border-t-4 border-emerald-500 shadow-lg">
                <div className="absolute -left-2 bottom-2 w-10 h-10 bg-emerald-600 rounded-full" />
                <div className="absolute -right-2 bottom-2 w-10 h-10 bg-emerald-600 rounded-full" />
              </div>
              <div className="w-6 h-full bg-[#5D2E0A] border-x-2 border-[#3d1e07]" />
            </div>
          </React.Fragment>
        ))}

        {/* --- KARAKTER MONKYPOLIN (CHIBI MONKEY) --- */}
        <div
          className="absolute left-[15%] w-14 h-14 z-20 transition-transform duration-75 flex items-center justify-center"
          style={{
            top: `${birdPos}%`,
            transform: gameOver
              ? "rotate(110deg)"
              : gameStarted
                ? "rotate(0deg)"
                : "rotate(-15deg)",
          }}
        >
          <div className="absolute w-full h-full bg-[#8B4513] rounded-full shadow-lg border-2 border-[#5D2E0A]">
            {/* Telinga */}
            <div className="absolute -left-3 top-2 w-6 h-6 bg-[#8B4513] rounded-full border-2 border-[#5D2E0A]">
              <div className="absolute inset-1 bg-[#DEB887] rounded-full"></div>
            </div>
            <div className="absolute -right-3 top-2 w-6 h-6 bg-[#8B4513] rounded-full border-2 border-[#5D2E0A]">
              <div className="absolute inset-1 bg-[#DEB887] rounded-full"></div>
            </div>
            {/* Area Wajah */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[85%] h-[70%] bg-[#DEB887] rounded-b-full rounded-t-lg">
              <div className="absolute top-3 left-3 w-2.5 h-4 bg-zinc-900 rounded-full flex justify-center">
                <div className="w-1 h-1 bg-white rounded-full mt-0.5 ml-0.5"></div>
              </div>
              <div className="absolute top-3 right-3 w-2.5 h-4 bg-zinc-900 rounded-full flex justify-center">
                <div className="w-1 h-1 bg-white rounded-full mt-0.5 ml-0.5"></div>
              </div>
              <div className="absolute top-7 left-1/2 -translate-x-1/2 w-3 h-2 bg-[#5D2E0A] rounded-full"></div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 border-b-2 border-[#5D2E0A] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Lantai Rumput & Tanah */}
        <div className="absolute bottom-0 w-full h-[10%] bg-orange-800 border-t-8 border-green-500 z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]" />

        {/* Layar Game Over */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50 text-white backdrop-blur-sm">
            <h2 className="text-5xl font-black mb-2 animate-bounce text-yellow-400 drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">
              GAME OVER
            </h2>
            <p className="text-2xl mb-8 font-bold text-center px-4">
              MONYET HIDEUNG Terjatuh!
              <br />
              <span className="text-4xl text-white block mt-2">{score}</span>
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
              className="px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl rounded-full shadow-2xl transition-transform active:scale-95"
            >
              MAIN LAGI
            </button>
          </div>
        )}

        {/* Dekorasi Awan */}
        <div className="absolute top-20 right-10 w-20 h-8 bg-white/50 rounded-full blur-sm" />
        <div className="absolute top-40 left-5 w-16 h-6 bg-white/40 rounded-full blur-sm" />
      </div>
    </div>
  );
};

export default Monkypolin;
