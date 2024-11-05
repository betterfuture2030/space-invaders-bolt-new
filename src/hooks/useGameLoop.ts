import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState, GameLoopProps } from '../types/game';
import { SPRITES, SPRITE_SIZE } from '../constants/sprites';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  MISSILE_WIDTH,
  MISSILE_HEIGHT,
  MISSILE_SPEED,
  INVADER_WIDTH,
  INVADER_HEIGHT,
  INVADER_COLS,
  INVADER_ROWS,
  INVADER_SPACING_X,
  INVADER_SPACING_Y,
  INVADER_START_Y,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  SHOOT_COOLDOWN,
  INVADER_SHOOT_COOLDOWN,
} from '../components/constants';

const createInitialState = (level: number = 1): GameState => ({
  player: {
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_HEIGHT - PLAYER_HEIGHT - 10,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
  },
  invaders: Array.from({ length: INVADER_ROWS * INVADER_COLS }, (_, i) => ({
    x: (i % INVADER_COLS) * (INVADER_WIDTH + INVADER_SPACING_X),
    y: Math.floor(i / INVADER_COLS) * (INVADER_HEIGHT + INVADER_SPACING_Y) + INVADER_START_Y,
    width: INVADER_WIDTH,
    height: INVADER_HEIGHT,
    isAlive: true,
  })),
  missiles: [],
  direction: 1,
  speed: INITIAL_SPEED + (level - 1) * SPEED_INCREMENT,
  lastShot: 0,
  lastInvaderShot: 0,
  level,
});

export const useGameLoop = ({
  canvasRef,
  onScore,
  onShoot,
  onInvaderMove,
  onGameOver,
  onLevelUp,
}: GameLoopProps) => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isGameRunning, setIsGameRunning] = useState(false);
  const animationFrameId = useRef<number>();
  const lastTime = useRef<number>(0);
  const soundToggle = useRef<boolean>(true);

  const startNextLevel = useCallback(() => {
    setGameState(prev => createInitialState(prev.level + 1));
    onLevelUp();
  }, [onLevelUp]);

  const startGame = useCallback(() => {
    setGameState(createInitialState());
    setIsGameRunning(true);
    lastTime.current = 0;
  }, []);

  const movePlayer = useCallback((direction: number, isStarting: boolean) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        moving: {
          left: direction === -1 ? isStarting : prev.player.moving?.left,
          right: direction === 1 ? isStarting : prev.player.moving?.right,
        },
      },
    }));
  }, []);

  const shoot = useCallback(() => {
    const now = Date.now();
    setGameState(prev => {
      if (now - prev.lastShot < SHOOT_COOLDOWN) return prev;
      onShoot();
      return {
        ...prev,
        missiles: [
          ...prev.missiles,
          {
            x: prev.player.x + PLAYER_WIDTH / 2 - MISSILE_WIDTH / 2,
            y: prev.player.y,
            width: MISSILE_WIDTH,
            height: MISSILE_HEIGHT,
            speed: MISSILE_SPEED,
            isEnemy: false,
          },
        ],
        lastShot: now,
      };
    });
  }, [onShoot]);

  const update = useCallback(() => {
    if (!isGameRunning) return;

    setGameState(prev => {
      const now = Date.now();
      let newState = { ...prev };

      // Update player position based on movement
      if (prev.player.moving?.left) {
        newState.player.x = Math.max(0, prev.player.x - prev.player.speed);
      }
      if (prev.player.moving?.right) {
        newState.player.x = Math.min(GAME_WIDTH - PLAYER_WIDTH, prev.player.x + prev.player.speed);
      }

      // Update invaders
      let shouldChangeDirection = false;
      const aliveInvaders = prev.invaders.filter(inv => inv.isAlive);

      if (aliveInvaders.length === 0) {
        startNextLevel();
        return prev;
      }

      aliveInvaders.forEach(invader => {
        if (
          (invader.x + INVADER_WIDTH >= GAME_WIDTH && prev.direction > 0) ||
          (invader.x <= 0 && prev.direction < 0)
        ) {
          shouldChangeDirection = true;
        }
      });

      if (shouldChangeDirection) {
        newState.direction *= -1;
        newState.invaders = newState.invaders.map(inv => ({
          ...inv,
          y: inv.y + INVADER_HEIGHT,
        }));
        onInvaderMove(soundToggle.current);
        soundToggle.current = !soundToggle.current;
      } else {
        newState.invaders = newState.invaders.map(inv => ({
          ...inv,
          x: inv.x + prev.direction * prev.speed,
        }));
      }

      // Check if invaders reached bottom
      if (aliveInvaders.some(inv => inv.y + INVADER_HEIGHT >= prev.player.y)) {
        onGameOver();
        setIsGameRunning(false);
        return prev;
      }

      // Invader shooting
      if (now - prev.lastInvaderShot > INVADER_SHOOT_COOLDOWN && aliveInvaders.length > 0) {
        const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
        newState.missiles.push({
          x: shooter.x + INVADER_WIDTH / 2,
          y: shooter.y + INVADER_HEIGHT,
          width: MISSILE_WIDTH,
          height: MISSILE_HEIGHT,
          speed: MISSILE_SPEED * 0.5,
          isEnemy: true,
        });
        newState.lastInvaderShot = now;
      }

      // Update missiles and handle collisions
      newState.missiles = newState.missiles.filter(missile => {
        const newY = missile.y + (missile.isEnemy ? missile.speed : -missile.speed);

        // Remove if off screen
        if (newY < 0 || newY > GAME_HEIGHT) return false;

        // Update missile position
        missile.y = newY;

        if (missile.isEnemy) {
          // Check player collision
          if (
            missile.x < prev.player.x + PLAYER_WIDTH &&
            missile.x + MISSILE_WIDTH > prev.player.x &&
            missile.y < prev.player.y + PLAYER_HEIGHT &&
            missile.y + MISSILE_HEIGHT > prev.player.y
          ) {
            onGameOver();
            setIsGameRunning(false);
            return false;
          }
        } else {
          // Check invader collisions
          for (let i = 0; i < newState.invaders.length; i++) {
            const invader = newState.invaders[i];
            if (
              invader.isAlive &&
              missile.x < invader.x + INVADER_WIDTH &&
              missile.x + MISSILE_WIDTH > invader.x &&
              missile.y < invader.y + INVADER_HEIGHT &&
              missile.y + MISSILE_HEIGHT > invader.y
            ) {
              newState.invaders[i] = { ...invader, isAlive: false };
              onScore(10 * prev.level); // Score increases with level
              return false;
            }
          }
        }
        return true;
      });

      return newState;
    });
  }, [isGameRunning, onScore, onGameOver, onInvaderMove, startNextLevel]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw player
    drawSprite(ctx, SPRITES.PLAYER, gameState.player.x, gameState.player.y, '#0f0');

    // Draw invaders
    gameState.invaders.forEach((invader, index) => {
      if (invader.isAlive) {
        const frame = Math.floor(Date.now() / 500) % 2;
        const type = Math.floor(index / INVADER_COLS);
        const sprite = type === 0 ? SPRITES.INVADER_SQUID :
                      type <= 2 ? SPRITES.INVADER_CRAB :
                      SPRITES.INVADER_OCTOPUS;
        drawSprite(ctx, sprite[frame], invader.x, invader.y, '#fff');
      }
    });

    // Draw missiles
    gameState.missiles.forEach(missile => {
      ctx.fillStyle = missile.isEnemy ? 'red' : '#0f0';
      ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
    });
  }, [gameState]);

  const drawSprite = useCallback((
    ctx: CanvasRenderingContext2D,
    sprite: string[],
    x: number,
    y: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    sprite.forEach((row, i) => {
      row.split('').forEach((pixel, j) => {
        if (pixel === '█') {
          ctx.fillRect(x + j * SPRITE_SIZE, y + i * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE);
        }
      });
    });
  }, []);

  const animate = useCallback((time: number) => {
    if (!lastTime.current) lastTime.current = time;
    const deltaTime = time - lastTime.current;

    if (deltaTime >= 16) {  // Cap at ~60 FPS
      update();
      draw();
      lastTime.current = time;
    }

    animationFrameId.current = requestAnimationFrame(animate);
  }, [update, draw]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate]);

  return {
    gameState,
    startGame,
    movePlayer,
    shoot,
    isGameOver: !isGameRunning,
  };
};