// Asteroides engine: owns its canvas, loop, input and state, and tells React
// only what changed (score, lives, level, pause, game over). No React here.
// Ported from references/started-games/02-asteroids/game.js, minus its
// "GAME OVER / ESPACIO PARA REINICIAR" overlay: the platform dialog replaces it.

import {
  Asteroid,
  Bullet,
  COLORS,
  H,
  POINTS,
  POWERUP_DROP_CHANCE,
  POWERUP_DURATION,
  Particle,
  PowerUp,
  Ship,
  W,
  dist,
  rand,
} from "./entities";

export type AsteroidsSnapshot = {
  score: number;
  lives: number; // 3 at start
  level: number; // 1 at start
};

export type AsteroidsEvents = {
  onChange: (snap: AsteroidsSnapshot) => void; // only when a value changes, never per frame
  onPauseChange: (paused: boolean) => void;
  onGameOver: (finalScore: number) => void;
};

export type AsteroidsAction = "left" | "right" | "thrust" | "fire";

export type AsteroidsGame = {
  pause(): void;
  resume(): void;
  togglePause(): void;
  end(): void; // FIN button: stops and fires onGameOver
  restart(): void; // JUGAR DE NUEVO
  setAction(action: AsteroidsAction, down: boolean): void; // touch controls
  destroy(): void; // cancels rAF and removes listeners
};

type State = "playing" | "dead" | "paused" | "gameover";

const KEY_ACTIONS: Record<string, AsteroidsAction> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "thrust",
  KeyW: "thrust",
  Space: "fire",
};
const PAUSE_KEYS = new Set(["KeyP", "Escape"]);

const MAX_DT = 0.05; // s, as in the original

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable)
  );
}

export function createAsteroidsGame(
  canvas: HTMLCanvasElement,
  events: AsteroidsEvents,
): AsteroidsGame {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D no disponible");
  const ctx: CanvasRenderingContext2D = context; // typed const: stays narrowed inside hoisted functions
  canvas.width = W;
  canvas.height = H;

  // ── Game state (all in this closure, no globals) ──────────────────────────
  let ship = new Ship();
  let bullets: Bullet[] = [];
  let asteroids: Asteroid[] = [];
  let particles: Particle[] = [];
  let powerUps: PowerUp[] = [];
  let score = 0;
  let lives = 3;
  let level = 1;
  let state: State = "playing";
  let resumeTo: "playing" | "dead" = "playing";
  let deadTimer = 0;
  let powerUpSpawned = false;
  let killsSinceSpawn = 0;

  // ── Input: keyboard codes held + touch actions held ───────────────────────
  const keysDown = new Set<string>();
  const touchDown = new Set<AsteroidsAction>();
  let firePressed = false; // one shot per press, like the original `pressed('Space')`

  const held = (action: AsteroidsAction) => {
    if (touchDown.has(action)) return true;
    for (const code of keysDown) if (KEY_ACTIONS[code] === action) return true;
    return false;
  };

  const clearInput = () => {
    keysDown.clear();
    touchDown.clear();
    firePressed = false;
  };

  // ── Loop bookkeeping ──────────────────────────────────────────────────────
  let rafId: number | null = null;
  let lastTime: number | null = null;
  let destroyed = false;
  let lastSnap: AsteroidsSnapshot | null = null;

  const emitChange = () => {
    if (lastSnap && lastSnap.score === score && lastSnap.lives === lives && lastSnap.level === level) {
      return;
    }
    lastSnap = { score, lives, level };
    events.onChange(lastSnap);
  };

  // ── Game flow ─────────────────────────────────────────────────────────────
  function spawnAsteroids(count: number) {
    const SAFE_DIST = 130;
    for (let i = 0; i < count; i++) {
      let x: number;
      let y: number;
      do {
        x = rand(0, W);
        y = rand(0, H);
      } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
      asteroids.push(new Asteroid(x, y, 3));
    }
  }

  function initGame() {
    ship = new Ship();
    bullets = [];
    asteroids = [];
    particles = [];
    powerUps = [];
    powerUpSpawned = false;
    killsSinceSpawn = 0;
    score = 0;
    lives = 3;
    level = 1;
    state = "playing";
    resumeTo = "playing";
    spawnAsteroids(4);
  }

  function nextLevel() {
    level++;
    bullets = [];
    particles = [];
    powerUps = [];
    powerUpSpawned = false;
    killsSinceSpawn = 0;
    ship.reset();
    spawnAsteroids(3 + level);
  }

  function explode(x: number, y: number, count = 8) {
    for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
  }

  function gameOver() {
    state = "gameover";
    clearInput();
    emitChange(); // final lives/score reach React before the dialog opens
    events.onGameOver(score);
  }

  function killShip() {
    explode(ship.x, ship.y, 14);
    ship.dead = true;
    lives--;
    if (lives <= 0) {
      gameOver();
    } else {
      state = "dead";
      deadTimer = 2;
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────
  function updateParticles(dt: number) {
    particles.forEach((p) => p.update(dt));
    particles = particles.filter((p) => !p.dead);
  }

  function update(dt: number) {
    if (state === "gameover") {
      updateParticles(dt);
      return;
    }

    if (state === "dead") {
      deadTimer -= dt;
      updateParticles(dt);
      asteroids.forEach((a) => a.update(dt));
      if (deadTimer <= 0) {
        state = "playing";
        ship.reset();
      }
      return;
    }

    if (state !== "playing") return;

    // Fire
    if (firePressed) {
      firePressed = false;
      bullets.push(...ship.tryShoot());
    }

    ship.update(dt, { left: held("left"), right: held("right"), thrust: held("thrust") });
    bullets.forEach((b) => b.update(dt));
    asteroids.forEach((a) => a.update(dt));
    particles.forEach((p) => p.update(dt));
    powerUps.forEach((p) => p.update(dt));

    bullets = bullets.filter((b) => !b.dead);
    particles = particles.filter((p) => !p.dead);
    powerUps = powerUps.filter((p) => !p.dead);

    for (const p of powerUps) {
      if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
        p.dead = true;
        ship.tripleShot = POWERUP_DURATION;
      }
    }

    // Bullet vs asteroid
    const newAsteroids: Asteroid[] = [];
    for (const b of bullets) {
      for (const a of asteroids) {
        if (!a.dead && !b.dead && dist(b, a) < a.radius) {
          b.dead = true;
          a.dead = true;
          score += POINTS[a.size];
          explode(a.x, a.y, a.size * 5);
          newAsteroids.push(...a.split());
          if (!powerUpSpawned) {
            killsSinceSpawn++;
            const guaranteed = killsSinceSpawn >= 5;
            if (guaranteed || Math.random() < POWERUP_DROP_CHANCE) {
              powerUps.push(new PowerUp(a.x, a.y));
              powerUpSpawned = true;
            }
          }
        }
      }
    }
    asteroids = asteroids.filter((a) => !a.dead).concat(newAsteroids);
    bullets = bullets.filter((b) => !b.dead);

    // Ship vs asteroid
    if (ship.invincible <= 0) {
      for (const a of asteroids) {
        if (dist(ship, a) < ship.radius + a.radius * 0.82) {
          killShip();
          break;
        }
      }
    }

    // Level cleared
    if (asteroids.length === 0) nextLevel();
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function drawLifeIcon(c: CanvasRenderingContext2D, x: number, y: number) {
    c.save();
    c.translate(x, y);
    c.rotate(-Math.PI / 2);
    c.strokeStyle = COLORS.cyan;
    c.lineWidth = 1.2;
    c.lineJoin = "round";
    c.beginPath();
    c.moveTo(9, 0);
    c.lineTo(-6, -5);
    c.lineTo(-3, 0);
    c.lineTo(-6, 5);
    c.closePath();
    c.stroke();
    c.restore();
  }

  function drawHUD(c: CanvasRenderingContext2D) {
    c.fillStyle = COLORS.white;
    c.font = "15px monospace";
    c.textBaseline = "alphabetic";

    c.textAlign = "left";
    c.fillText(`SCORE  ${score}`, 14, 26);

    c.textAlign = "center";
    c.fillText(`NIVEL ${level}`, W / 2, 26);

    for (let i = 0; i < lives; i++) drawLifeIcon(c, W - 16 - i * 22, 18);

    if (ship.tripleShot > 0) {
      c.textAlign = "left";
      c.fillStyle = COLORS.green;
      c.fillText(`3x  ${ship.tripleShot.toFixed(1)}s`, 14, 46);
    }
  }

  function draw(c: CanvasRenderingContext2D, now: number) {
    c.fillStyle = COLORS.background;
    c.fillRect(0, 0, W, H);

    particles.forEach((p) => p.draw(c));
    asteroids.forEach((a) => a.draw(c));
    powerUps.forEach((p) => p.draw(c, now));
    bullets.forEach((b) => b.draw(c));
    ship.draw(c);

    drawHUD(c);
  }

  // ── Loop ──────────────────────────────────────────────────────────────────
  // Runs while playing or dying; after game over only until the last particles
  // fade, so the dialog doesn't sit on top of a busy loop. Paused = no loop.
  function frame(ts: number) {
    rafId = null;
    const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, MAX_DT);
    lastTime = ts;
    update(dt);
    draw(ctx, ts);
    emitChange();
    if (state === "paused" || (state === "gameover" && particles.length === 0)) return;
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (destroyed || rafId !== null) return;
    lastTime = null; // no dt jump after a pause or a hidden tab
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  function pause() {
    if (destroyed || (state !== "playing" && state !== "dead")) return;
    resumeTo = state;
    state = "paused";
    stopLoop();
    clearInput();
    events.onPauseChange(true);
  }

  function resume() {
    if (destroyed || state !== "paused") return;
    state = resumeTo;
    events.onPauseChange(false);
    startLoop();
  }

  function togglePause() {
    if (state === "paused") resume();
    else pause();
  }

  function end() {
    if (destroyed || state === "gameover") return;
    const wasPaused = state === "paused";
    gameOver();
    if (wasPaused) events.onPauseChange(false);
    startLoop();
  }

  function restart() {
    if (destroyed) return;
    const wasPaused = state === "paused";
    stopLoop();
    clearInput();
    initGame();
    if (wasPaused) events.onPauseChange(false);
    emitChange();
    startLoop();
  }

  function setAction(action: AsteroidsAction, down: boolean) {
    if (destroyed || (state !== "playing" && state !== "dead")) return;
    if (down) {
      if (action === "fire" && !touchDown.has("fire")) firePressed = true;
      touchDown.add(action);
    } else {
      touchDown.delete(action);
    }
  }

  // ── Listeners ─────────────────────────────────────────────────────────────
  function onKeyDown(e: KeyboardEvent) {
    if (isTypingTarget(e.target)) return;
    // Game over belongs to the dialog; paused only listens for P/Esc, so
    // Space/arrows still work on the focused buttons.
    if (state === "gameover") return;

    if (PAUSE_KEYS.has(e.code)) {
      e.preventDefault();
      if (!e.repeat) togglePause();
      return;
    }

    const action = KEY_ACTIONS[e.code];
    if (!action || state === "paused") return;
    e.preventDefault();
    if (action === "fire" && !keysDown.has(e.code)) firePressed = true;
    keysDown.add(e.code);
  }

  function onKeyUp(e: KeyboardEvent) {
    if (KEY_ACTIONS[e.code]) keysDown.delete(e.code);
  }

  function onBlur() {
    clearInput();
  }

  function onVisibilityChange() {
    if (document.hidden) pause();
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibilityChange);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stopLoop();
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    clearInput();
  }

  initGame();
  emitChange();
  startLoop();

  return { pause, resume, togglePause, end, restart, setAction, destroy };
}
