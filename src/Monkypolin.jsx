import React, { useState, useEffect } from "react";
import spongebobImg from "./spongebob.jpg";
import ambatukamImg from "./ambatukam.jpeg";
import windahImg from "./windah.jpeg";

const Monkypolin = () => {
  const [birdPos, setBirdPos] = useState(40);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [character, setCharacter] = useState(null);
  const [speed, setSpeed] = useState(1); // State baru untuk kecepatan

  const charList = [
    { id: "monkey", name: "Monyet" },
    { id: "spongebob", name: "Spongebob", img: spongebobImg },
    { id: "ambatukam", name: "Amba", img: ambatukamImg },
    { id: "windah", name: "Windut", img: windahImg },
  ];

  const resetGame = () => {
    setBirdPos(40);
    setScore(0);
    setPipes([]);
    setSpeed(1); // Reset kecepatan ke awal
    setGameOver(false);
    setGameStarted(true);
  };

  const handleJump = () => {
    if (gameOver || !character) return;
    if (!gameStarted) setGameStarted(true);
    setBirdPos((pos) => (pos - 8 > 0 ? pos - 8 : 0));
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

  // Logic Pergerakan dan Kesulitan Bertahap
  useEffect(() => {
    let pipeGenerator;
    if (gameStarted && !gameOver) {
      pipeGenerator = setInterval(() => {
        setPipes((currPipes) => {
          let scoreToIncr = 0;

          const movedPipes = currPipes.map((p) => {
            // Pipa bergerak sesuai dengan state speed
            const newLeft = p.left - speed;

            if (newLeft < 15 && !p.passed) {
              scoreToIncr = 1;
              return { ...p, left: newLeft, passed: true };
            }
            return { ...p, left: newLeft };
          });

          if (scoreToIncr > 0) {
            setScore((s) => {
              const newScore = s + 1;
              // Tingkatkan kecepatan setiap kelipatan 5 skor
              if (newScore % 5 === 0) setSpeed((prev) => prev + 0.15);
              return newScore;
            });
          }

          const filteredPipes = movedPipes.filter((p) => p.left > -20);

          // Cek Tabrakan
          const hitPipe = filteredPipes.find((p) => {
            const isInsidePipeX = p.left < 28 && p.left + 10 > 15;
            const hitTopPipe = birdPos < p.topHeight;
            const hitBottomPipe = birdPos > p.topHeight + 22;
            return isInsidePipeX && (hitTopPipe || hitBottomPipe);
          });

          if (hitPipe || birdPos > 88 || birdPos < 0) setGameOver(true);

          // Spawn pipa baru: Jaraknya menyesuaikan kecepatan agar tidak terlalu rapat
          const spawnThreshold = 55 - speed * 2; // Makin cepat, makin cepat spawn-nya
          if (
            filteredPipes.length === 0 ||
            filteredPipes[filteredPipes.length - 1].left <
              Math.max(spawnThreshold, 35)
          ) {
            const randomHeight = Math.floor(Math.random() * 40) + 15;
            filteredPipes.push({
              left: 100,
              topHeight: randomHeight,
              id: Date.now() + Math.random(),
              passed: false,
            });
          }

          return filteredPipes;
        });
      }, 20);
    }
    return () => clearInterval(pipeGenerator);
  }, [gameStarted, gameOver, birdPos, speed]); // Tambahkan speed di dependency array

  return (
    <div className="flex justify-center items-center h-screen bg-zinc-900">
      <div
        className="relative w-full max-w-[450px] h-full bg-gradient-to-b from-sky-300 to-sky-500 overflow-hidden touch-none select-none shadow-inner"
        onClick={handleJump}
      >
        {/* MODAL PILIH KARAKTER */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50 p-6 backdrop-blur-md text-center">
            <h2 className="text-white text-3xl font-black mb-8 italic tracking-tighter drop-shadow-lg">
              CHOOSE CHARACTER
            </h2>
            <div className="flex gap-4 mb-10 overflow-x-auto pb-4 max-w-full px-2">
              {charList.map((c) => (
                <div
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCharacter(c);
                  }}
                  className={`cursor-pointer p-4 rounded-2xl transition-all border-4 flex-shrink-0 ${character?.id === c.id ? "border-yellow-400 bg-white/30 scale-105 shadow-2xl" : "border-transparent bg-white/10 hover:bg-white/20"}`}
                >
                  {c.id === "monkey" ? (
                    <div className="w-16 h-16 bg-[#8B4513] rounded-full relative border-2 border-[#5D2E0A]">
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-[70%] bg-[#DEB887] rounded-b-full" />
                    </div>
                  ) : (
                    <img
                      src={c.img}
                      alt={c.name}
                      className="w-16 h-16 object-contain rounded-lg"
                    />
                  )}
                  <p className="text-white text-center mt-2 font-black text-xs uppercase">
                    {c.name}
                  </p>
                </div>
              ))}
            </div>
            {character && (
              <button
                onClick={resetGame}
                className="px-14 py-4 bg-yellow-500 text-black font-black text-xl rounded-full animate-bounce shadow-xl"
              >
                START GAME
              </button>
            )}
          </div>
        )}

        {/* SCORE & SPEED INDICATOR */}
        {gameStarted && (
          <div className="absolute top-10 w-full text-center z-10 pointer-events-none">
            <h1 className="text-white text-8xl font-black drop-shadow-2xl opacity-80">
              {score}
            </h1>
            <p className="text-white/50 font-bold text-xs tracking-widest mt-2 uppercase">
              Speed: {speed.toFixed(1)}x
            </p>
          </div>
        )}

        {/* PIPES */}
        {pipes.map((pipe) => (
          <React.Fragment key={pipe.id}>
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
              <div className="relative w-20 h-16 bg-emerald-600 rounded-full -mt-2 border-b-4 border-emerald-800 shadow-lg" />
            </div>
            <div
              className="absolute flex flex-col items-center justify-end"
              style={{
                left: `${pipe.left}%`,
                bottom: "10%",
                height: `${65 - pipe.topHeight}%`,
                width: "64px",
              }}
            >
              <div className="relative w-20 h-16 bg-emerald-600 rounded-full -mb-2 border-t-4 border-emerald-500 shadow-lg" />
              <div className="w-6 h-full bg-[#5D2E0A] border-x-2 border-[#3d1e07]" />
            </div>
          </React.Fragment>
        ))}

        {/* PLAYER */}
        {character && gameStarted && (
          <div
            className="absolute left-[15%] w-24 h-24 z-20 transition-transform duration-75 flex items-center justify-center"
            style={{
              top: `${birdPos}%`,
              transform: gameOver
                ? "rotate(110deg)"
                : `rotate(${(birdPos - 40) * 0.5}deg)`,
            }}
          >
            {character.id === "monkey" ? (
              <div className="w-20 h-20 bg-[#8B4513] rounded-full border-4 border-[#5D2E0A] relative shadow-2xl">
                <div className="absolute -left-3 top-2 w-6 h-6 bg-[#8B4513] rounded-full border-2 border-[#5D2E0A]">
                  <div className="absolute inset-1.5 bg-[#DEB887] rounded-full"></div>
                </div>
                <div className="absolute -right-3 top-2 w-6 h-6 bg-[#8B4513] rounded-full border-2 border-[#5D2E0A]">
                  <div className="absolute inset-1.5 bg-[#DEB887] rounded-full"></div>
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[85%] h-[75%] bg-[#DEB887] rounded-b-full rounded-t-xl">
                  <div className="absolute top-3 left-3 w-2 h-3 bg-zinc-900 rounded-full"></div>
                  <div className="absolute top-3 right-3 w-2 h-3 bg-zinc-900 rounded-full"></div>
                </div>
              </div>
            ) : (
              <img
                src={character.img}
                alt="player"
                className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] scale-110"
              />
            )}
          </div>
        )}

        <div className="absolute bottom-0 w-full h-[10%] bg-orange-950 border-t-8 border-green-600 z-30" />

        {/* GAME OVER SCREEN */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 text-white animate-fadeIn">
            <h2 className="text-6xl font-black mb-4 text-yellow-500 drop-shadow-2xl">
              KALAH!
            </h2>
            <p className="text-2xl mb-8 font-bold text-center px-4 leading-tight">
              {character?.name} Jatuh!
              <br />
              <span className="text-6xl text-white font-black">{score}</span>
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
              className="px-14 py-4 bg-yellow-500 text-black font-black text-xl rounded-full shadow-[0_10px_0_rgb(161,98,7)] active:translate-y-1 active:shadow-none transition-all"
            >
              COBA LAGI
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGameStarted(false);
                setGameOver(false);
                setCharacter(null);
              }}
              className="mt-8 text-white/70 hover:text-white underline font-bold text-sm tracking-widest"
            >
              GANTI KARAKTER
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Monkypolin;
