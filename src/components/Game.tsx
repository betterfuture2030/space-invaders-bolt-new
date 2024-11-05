import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSound } from '../hooks/useSound';
import { GAME_WIDTH, GAME_HEIGHT, SCORE_TEXT_CONFIG } from './constants';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    playShoot,
    playExplosion,
    playInvaderMove,
    playInvaderShoot,
    playGameOver,
    playLevelUp
  } = useSound(isMuted);

  const {
    gameState,
    startGame,
    movePlayer,
    shoot,
    isGameOver
  } = useGameLoop({
    canvasRef,
    onScore: (points) => {
      const newScore = score + points;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      playExplosion();
    },
    onShoot: () => {
      playShoot();
      playInvaderShoot();
    },
    onInvaderMove: (isFirstSound) => playInvaderMove(isFirstSound),
    onGameOver: () => {
      playGameOver();
      setIsPlaying(false);
      setHasStarted(true);
      setLevel(1);
    },
    onLevelUp: () => {
      playLevelUp();
      setLevel(prev => prev + 1);
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') movePlayer(-1, true);
      if (e.code === 'ArrowRight') movePlayer(1, true);
      if (e.code === 'Space') shoot();
      if (e.code === 'Enter' && !isPlaying) {
        setIsPlaying(true);
        setScore(0);
        setLevel(1);
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') movePlayer(-1, false);
      if (e.code === 'ArrowRight') movePlayer(1, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [movePlayer, shoot, startGame, isPlaying]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="text-center mb-4 font-mono text-lg">
        <div className="text-white">
          SCORE<span className="text-xs">&lt;1&gt;</span>{' '}
          <span className="text-red-500">{score.toString().padStart(4, '0')}</span>
          <span className="mx-4">HI-SCORE</span>
          SCORE<span className="text-xs">&lt;2&gt;</span>{' '}
          <span className="text-red-500">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-4 border-white"
          style={{ imageRendering: 'pixelated' }}
        />
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 text-white hover:text-green-500 transition-colors"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
            <h2 className="font-mono text-3xl text-white mb-4">
              {hasStarted ? 'GAME OVER' : 'SPACE INVADERS'}
            </h2>
            <p className="font-mono text-white text-xl mb-4">
              PRESS ENTER TO {hasStarted ? 'PLAY AGAIN' : 'START'}
            </p>
            <div className="font-mono text-gray-400 text-center">
              <p>CREDIT 00</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}