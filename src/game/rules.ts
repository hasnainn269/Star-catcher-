/**
 * Star Catcher - Core Game Rules and Physics Logic
 * Decoupled pure functions for collision, difficulty scaling, scoring, and state rules.
 */

export interface BasketBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FallingItemBox {
  x: number;
  y: number;
  radius: number;
  type: 'star' | 'bonus_star' | 'bomb';
}

export interface GameStateData {
  score: number;
  lives: number;
  isGameOver: boolean;
  highScore: number;
}

/**
 * Clamps basket X coordinate within canvas boundaries.
 */
export function clampBasketX(x: number, basketWidth: number, canvasWidth: number): number {
  const minX = 0;
  const maxX = Math.max(0, canvasWidth - basketWidth);
  return Math.min(Math.max(x, minX), maxX);
}

/**
 * Checks if a falling item collides with the basket's catch zone (top rim aperture).
 */
export function checkItemCollision(basket: BasketBox, item: FallingItemBox): boolean {
  // Catch zone is the top rim of the basket
  const catchZoneYTop = basket.y - 6;
  const catchZoneYBottom = basket.y + basket.height * 0.55;

  // Horizontal overlap
  const horizontalOverlap =
    item.x + item.radius * 0.7 >= basket.x &&
    item.x - item.radius * 0.7 <= basket.x + basket.width;

  // Vertical overlap
  const verticalOverlap =
    item.y + item.radius >= catchZoneYTop &&
    item.y - item.radius <= catchZoneYBottom;

  return horizontalOverlap && verticalOverlap;
}

/**
 * Calculates item falling speed based on current score.
 * Starts approachable, speeds up smoothly with a fair cap.
 */
export function calculateFallSpeed(score: number, baseSpeed: number = 3.2): number {
  const speedIncrement = Math.min(score * 0.08, 5.5);
  return Number((baseSpeed + speedIncrement).toFixed(2));
}

/**
 * Calculates item spawn interval in frames or ms.
 * Gradually decreases as player scores higher.
 */
export function calculateSpawnInterval(score: number, baseInterval: number = 70): number {
  const reduction = Math.min(Math.floor(score * 0.5), 35);
  return Math.max(30, baseInterval - reduction);
}

/**
 * Probability of spawning a bomb instead of a star (between 0.20 and 0.40).
 */
export function calculateBombChance(score: number): number {
  const chance = 0.20 + Math.min(score * 0.003, 0.18);
  return Number(chance.toFixed(3));
}

/**
 * Updates state when a star is caught.
 */
export function applyStarCatch(state: GameStateData, starPoints: number = 1): GameStateData {
  const newScore = state.score + starPoints;
  const newHighScore = Math.max(state.highScore, newScore);
  return {
    ...state,
    score: newScore,
    highScore: newHighScore,
  };
}

/**
 * Updates state when a bomb is hit.
 * Reduces 1 life; triggers game over if lives drop to 0 or below.
 */
export function applyBombHit(state: GameStateData): GameStateData {
  const remainingLives = Math.max(0, state.lives - 1);
  return {
    ...state,
    lives: remainingLives,
    isGameOver: remainingLives <= 0,
  };
}

/**
 * Returns true if lives are depleted.
 */
export function isGameOver(lives: number): boolean {
  return lives <= 0;
}

/**
 * Returns the highest score between current and stored best.
 */
export function updateHighScore(currentScore: number, bestScore: number): number {
  return Math.max(currentScore, bestScore);
}
