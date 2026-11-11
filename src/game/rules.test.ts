import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampBasketX,
  checkItemCollision,
  calculateFallSpeed,
  calculateSpawnInterval,
  calculateBombChance,
  applyStarCatch,
  applyBombHit,
  isGameOver,
  updateHighScore,
  BasketBox,
  FallingItemBox,
  GameStateData
} from './rules.ts';

test('clampBasketX keeps basket inside boundary limits', () => {
  const basketWidth = 80;
  const canvasWidth = 600;

  // Normal inside
  assert.equal(clampBasketX(200, basketWidth, canvasWidth), 200);

  // Left limit
  assert.equal(clampBasketX(-50, basketWidth, canvasWidth), 0);

  // Right limit (canvasWidth - basketWidth = 520)
  assert.equal(clampBasketX(700, basketWidth, canvasWidth), 520);
});

test('checkItemCollision detects valid catch and rejects misses', () => {
  const basket: BasketBox = {
    x: 100,
    y: 500,
    width: 80,
    height: 50,
  };

  // Direct hit in basket rim
  const caughtItem: FallingItemBox = {
    x: 140,
    y: 510,
    radius: 16,
    type: 'star',
  };
  assert.equal(checkItemCollision(basket, caughtItem), true);

  // Miss horizontally to left
  const missLeft: FallingItemBox = {
    x: 50,
    y: 510,
    radius: 16,
    type: 'star',
  };
  assert.equal(checkItemCollision(basket, missLeft), false);

  // Miss vertically far above
  const missHigh: FallingItemBox = {
    x: 140,
    y: 300,
    radius: 16,
    type: 'star',
  };
  assert.equal(checkItemCollision(basket, missHigh), false);

  // Miss vertically far below basket
  const missLow: FallingItemBox = {
    x: 140,
    y: 580,
    radius: 16,
    type: 'star',
  };
  assert.equal(checkItemCollision(basket, missLow), false);
});

test('difficulty formulas scale smoothly with score', () => {
  const speedAtZero = calculateFallSpeed(0);
  const speedAtTen = calculateFallSpeed(10);
  const speedAtFifty = calculateFallSpeed(50);

  assert.ok(speedAtTen > speedAtZero, 'Speed should increase as score increases');
  assert.ok(speedAtFifty >= speedAtTen, 'Speed should continue scaling or plateau smoothly');

  const intervalAtZero = calculateSpawnInterval(0);
  const intervalAtTen = calculateSpawnInterval(10);
  assert.ok(intervalAtTen <= intervalAtZero, 'Spawn interval should decrease with score');

  const bombChanceAtZero = calculateBombChance(0);
  const bombChanceAtThirty = calculateBombChance(30);
  assert.ok(bombChanceAtThirty >= bombChanceAtZero, 'Bomb chance should increase with score');
});

test('applyStarCatch increases score and updates high score', () => {
  const initial: GameStateData = {
    score: 5,
    lives: 3,
    isGameOver: false,
    highScore: 10,
  };

  const next1 = applyStarCatch(initial, 1);
  assert.equal(next1.score, 6);
  assert.equal(next1.highScore, 10);

  const next2 = applyStarCatch(next1, 5);
  assert.equal(next2.score, 11);
  assert.equal(next2.highScore, 11);
});

test('applyBombHit reduces lives and triggers game over at 0 lives', () => {
  const initial: GameStateData = {
    score: 12,
    lives: 3,
    isGameOver: false,
    highScore: 20,
  };

  const afterHit1 = applyBombHit(initial);
  assert.equal(afterHit1.lives, 2);
  assert.equal(afterHit1.isGameOver, false);

  const afterHit2 = applyBombHit(afterHit1);
  assert.equal(afterHit2.lives, 1);
  assert.equal(afterHit2.isGameOver, false);

  const afterHit3 = applyBombHit(afterHit2);
  assert.equal(afterHit3.lives, 0);
  assert.equal(afterHit3.isGameOver, true);

  // Additional hit does not drop below 0
  const afterHit4 = applyBombHit(afterHit3);
  assert.equal(afterHit4.lives, 0);
  assert.equal(afterHit4.isGameOver, true);
});

test('isGameOver verifies life threshold', () => {
  assert.equal(isGameOver(3), false);
  assert.equal(isGameOver(1), false);
  assert.equal(isGameOver(0), true);
  assert.equal(isGameOver(-1), true);
});

test('updateHighScore preserves max', () => {
  assert.equal(updateHighScore(15, 10), 15);
  assert.equal(updateHighScore(8, 20), 20);
});
