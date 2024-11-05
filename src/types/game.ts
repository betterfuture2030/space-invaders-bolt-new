export interface GameState {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
  };
  invaders: {
    x: number;
    y: number;
    width: number;
    height: number;
    isAlive: boolean;
  }[];
  missiles: {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    isEnemy: boolean;
  }[];
  direction: number;
  speed: number;
  lastShot: number;
  lastInvaderShot: number;
  level: number;
}

export interface GameLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onScore: (points: number) => void;
  onShoot: () => void;
  onInvaderMove: (isFirstSound: boolean) => void;
  onGameOver: () => void;
  onLevelUp: () => void;
}