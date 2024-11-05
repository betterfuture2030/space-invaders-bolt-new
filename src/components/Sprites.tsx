// Previous imports and code remain the same

const PLAYER_SPRITE = [
  [6,0],
  [5,1], [6,1], [7,1],
  [4,2], [5,2], [6,2], [7,2], [8,2],
  [3,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3],
  [2,4], [3,4], [4,4], [5,4], [6,4], [7,4], [8,4], [9,4], [10,4],
  [1,5], [2,5], [3,5], [4,5], [5,5], [6,5], [7,5], [8,5], [9,5], [10,5], [11,5],
  [0,6], [1,6], [2,6], [3,6], [4,6], [5,6], [6,6], [7,6], [8,6], [9,6], [10,6], [11,6], [12,6]
];

export const createSprites = () => {
  // Previous sprite creation code remains the same

  // Create player sprite
  const playerCanvas = document.createElement('canvas');
  playerCanvas.width = 26;
  playerCanvas.height = 14;
  const playerCtx = playerCanvas.getContext('2d')!;
  createSprite(playerCtx, '#0f0', PLAYER_SPRITE);

  return {
    ...sprites,
    player: playerCanvas
  };
};