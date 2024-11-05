export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Bullet extends GameObject {
  active: boolean;
  isEnemy?: boolean;
}

export interface Enemy extends GameObject {
  type: 'squid' | 'crab' | 'octopus';
  frame: number;
}