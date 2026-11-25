(function() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const scoreLabel = document.getElementById('scoreLabel');

  const W = canvas.width, H = canvas.height;

  // ---- Assets (loaded from local files in /assets) ----
  const imgBird = new Image(); imgBird.src = "assets/bird.png";
  const imgPipeTop = new Image(); imgPipeTop.src = "assets/pipe_top.png";
  const imgPipeBottom = new Image(); imgPipeBottom.src = "assets/pipe_bottom.png";
  const imgBg = new Image(); imgBg.src = "assets/background.jpg";

  let assetsLoaded = 0;
  const totalAssets = 4;
  [imgBird, imgPipeTop, imgPipeBottom, imgBg].forEach(img => {
    img.onload = () => { assetsLoaded++; };
  });

  // ---- Constants ----
  const GROUND_RATIO = 0.847; // fraction of canvas height where solid ground begins (from bg art)
  const GROUND_Y = H * GROUND_RATIO;
  const GRAVITY = 1500;          // px/s^2
  const FLAP_VELOCITY = -430;    // px/s
  const MAX_FALL_SPEED = 620;
  const PIPE_SPEED = 165;        // px/s
  const PIPE_GAP = 165;
  const PIPE_WIDTH = 64;
  const PIPE_INTERVAL = 1450;    // ms between pipe spawns
  const BIRD_W = 44;
  const BIRD_X = 95;

  // bird image natural aspect (width / height of the cropped sprite)
  let birdAspect = 676 / 664;

  // ---- State ----
  let state = 'start'; // start | playing | gameover
  let bird = { y: H * 0.42, vy: 0, rot: 0 };
  let pipes = [];
  let score = 0;
  let best = 0;
  let lastTime = 0;
  let pipeTimer = 0;
  let bgX = 0;
  let flapAnim = 0;

  function resetGame() {
    bird.y = H * 0.42;
    bird.vy = 0;
    bird.rot = 0;
    pipes = [];
    score = 0;
    pipeTimer = 0;
    scoreLabel.textContent = '0';
  }

  function flap() {
    if (state === 'start') {
      state = 'playing';
      overlay.classList.add('hidden');
      scoreLabel.classList.remove('hidden');
      resetGame();
      bird.vy = FLAP_VELOCITY;
    } else if (state === 'playing') {
      bird.vy = FLAP_VELOCITY;
      flapAnim = 1;
    } else if (state === 'gameover') {
      state = 'start';
      overlay.classList.remove('hidden');
      scoreLabel.classList.add('hidden');
      buildStartOverlay();
    }
  }

  function spawnPipe() {
    const margin = 60;
    const minTop = margin;
    const maxTop = GROUND_Y - margin - PIPE_GAP;
    const gapTop = Math.random() * (maxTop - minTop) + minTop;
    pipes.push({ x: W + PIPE_WIDTH, gapTop: gapTop, gapBottom: gapTop + PIPE_GAP, passed: false });
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function update(dt) {
    if (state !== 'playing') return;

    bird.vy += GRAVITY * dt;
    if (bird.vy > MAX_FALL_SPEED) bird.vy = MAX_FALL_SPEED;
    bird.y += bird.vy * dt;

    const targetRot = Math.max(-25, Math.min(85, bird.vy * 0.09));
    bird.rot += (targetRot - bird.rot) * Math.min(1, dt * 12);

    if (flapAnim > 0) flapAnim -= dt * 4;

    bgX -= PIPE_SPEED * 0.25 * dt;

    pipeTimer += dt * 1000;
    if (pipeTimer >= PIPE_INTERVAL) {
      pipeTimer = 0;
      spawnPipe();
    }

    const bw = BIRD_W, bh = BIRD_W / birdAspect;
    const birdBoxX = BIRD_X - bw / 2 + 6;
    const birdBoxY = bird.y - bh / 2 + 4;
    const birdBoxW = bw - 12;
    const birdBoxH = bh - 8;

    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= PIPE_SPEED * dt;

      if (!p.passed && p.x + PIPE_WIDTH / 2 < BIRD_X) {
        p.passed = true;
        score++;
        scoreLabel.textContent = score;
      }

      if (rectsOverlap(birdBoxX, birdBoxY, birdBoxW, birdBoxH, p.x - PIPE_WIDTH / 2, 0, PIPE_WIDTH, p.gapTop) ||
          rectsOverlap(birdBoxX, birdBoxY, birdBoxW, birdBoxH, p.x - PIPE_WIDTH / 2, p.gapBottom, PIPE_WIDTH, GROUND_Y - p.gapBottom)) {
        gameOver();
      }

      if (p.x < -PIPE_WIDTH) pipes.splice(i, 1);
    }

    if (bird.y + bh / 2 - 6 >= GROUND_Y || bird.y - bh / 2 <= 0) {
      gameOver();
    }
  }

  function gameOver() {
    if (state !== 'playing') return;
    state = 'gameover';
    if (score > best) best = score;
    showGameOverOverlay();
  }

  function buildStartOverlay() {
    overlay.innerHTML = `
      <h1>🐦 Flappy Bird</h1>
      <p>Tap, click, or press Space to flap</p>
      <div class="big" id="startBtn">Tap to Start</div>
    `;
  }

  function showGameOverOverlay() {
    overlay.classList.remove('hidden');
    scoreLabel.classList.add('hidden');
    overlay.innerHTML = `
      <h1>💥 Game Over</h1>
      <div id="statsRow">
        <div>SCORE<b>${score}</b></div>
        <div>BEST<b>${best}</b></div>
      </div>
      <div class="big">Tap to Retry</div>
    `;
  }

  function drawBackground() {
    const iw = imgBg.width, ih = imgBg.height;
    const scale = H / ih;
    const drawW = iw * scale;
    let x = bgX % drawW;
    if (x > 0) x -= drawW;
    for (let dx = x; dx < W; dx += drawW) {
      ctx.drawImage(imgBg, dx, 0, drawW, H);
    }
  }

  function drawPipes() {
    for (const p of pipes) {
      const topH = p.gapTop;
      ctx.drawImage(imgPipeTop, p.x - PIPE_WIDTH / 2, 0, PIPE_WIDTH, topH);
      const botH = GROUND_Y - p.gapBottom;
      ctx.drawImage(imgPipeBottom, p.x - PIPE_WIDTH / 2, p.gapBottom, PIPE_WIDTH, botH);
    }
  }

  function drawBird() {
    const bw = BIRD_W, bh = BIRD_W / birdAspect;
    ctx.save();
    ctx.translate(BIRD_X, bird.y);
    ctx.rotate(bird.rot * Math.PI / 180);
    const bob = state === 'start' ? Math.sin(Date.now() / 180) * 4 : 0;
    ctx.drawImage(imgBird, -bw / 2, -bh / 2 + bob, bw, bh);
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (assetsLoaded < totalAssets) {
      ctx.fillStyle = '#4ec0ca';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading...', W / 2, H / 2);
      return;
    }
    drawBackground();
    drawPipes();
    drawBird();
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    let dt = (ts - lastTime) / 1000;
    if (dt > 0.05) dt = 0.05;
    lastTime = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // ---- Input ----
  function handleInput(e) {
    e.preventDefault();
    flap();
  }
  canvas.addEventListener('pointerdown', handleInput);
  overlay.addEventListener('pointerdown', handleInput);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      flap();
    }
  });

  requestAnimationFrame(loop);
})();
