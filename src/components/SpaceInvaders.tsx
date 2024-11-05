import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Rocket } from 'lucide-react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSound } from '../hooks/useSound';
import { SPRITES } from '../constants/sprites';

const INVADER_ROWS = 5;
const INVADERS_PER_ROW = 11;
const INITIAL_SPEED = 0.5; // Reduced initial speed by 50%
const SPEED_INCREASE = 0.1; // Reduced speed increase
const MOVE_DOWN_DISTANCE = 30;

export default function SpaceInvaders() {
  // ... rest of the component remains the same until useGameLoop

  const { 
    gameState,
    startGame,
    movePlayer,
    shoot,
    isGameOver,
    soundToggle
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
    onShoot: () => playShoot(),
    onInvaderMove: () => playInvaderMove(soundToggle),
    onGameOver: () => {
      playGameOver();
      setGameStarted(false);
    },
    initialSpeed: INITIAL_SPEED,
    speedIncrease: SPEED_INCREASE,
    moveDownDistance: MOVE_DOWN_DISTANCE,
    invaderRows: INVADER_ROWS,
    invadersPerRow: INVADERS_PER_ROW
  });

  // Rest of the component remains the same
}