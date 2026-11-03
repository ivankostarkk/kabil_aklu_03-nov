/* ==============================================================================
   PROJECT KABI & AKLU (03-Nov): JAVASCRIPT RECURSIVE DROSTE ZOOM ENGINE
   Zero Scroll • 3D Matrix Perspective Depth • Audio Synthesizer • Secret Vault
   ============================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE CONFIGURATION ---
  const state = {
    currentDepth: 0,
    maxDepth: 4,
    isUnlocked: false,
    isTouring: false,
    tourInterval: null,
    isPlayingMusic: false
  };

  // Accepted secret passwords (case-insensitive & trimmed)
  const VALID_PASSWORDS = [
    'aklu', 'akluu', 'akalu', 'akalya', 'dii', 'di', 'love', 'kabi', 'kabil', 'daa', 'sweetheart'
  ];

  // Playful wrong password responses
  const WRONG_PASS_MESSAGES = [
    "You forgot me already, dii? 🥺 Try again!",
    "Why wrong password? Did Kabi not teach you? 🙈",
    "Aiyo Aklu, how can you forget our secret word! 💔",
    "Wrong! Are you really my sweet Aklu? Prove it! 🤨❤️",
    "Think about what Kabi calls you... or check the hint below! 💡"
  ];
  let wrongAttemptCount = 0;

  // DOM Elements
  const lockOverlay = document.getElementById('lockOverlay');
  const lockForm = document.getElementById('lockForm');
  const passcodeInput = document.getElementById('passcodeInput');
  const unlockBtn = document.getElementById('unlockBtn');
  const errorMsg = document.getElementById('errorMsg');
  const hintTrigger = document.getElementById('hintTrigger');
  const hintBox = document.getElementById('hintBox');
  const toggleEye = document.getElementById('toggleEye');
  const eyeIcon = document.getElementById('eyeIcon');

  const zoomUniverse = document.getElementById('zoomUniverse');
  const layers = [
    document.getElementById('layer-0'),
    document.getElementById('layer-1'),
    document.getElementById('layer-2'),
    document.getElementById('layer-3'),
    document.getElementById('layer-4')
  ];

  const stepDots = document.querySelectorAll('.step-dot');
  const depthSlider = document.getElementById('depthSlider');
  const depthLabel = document.getElementById('depthLabel');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const autoTourBtn = document.getElementById('autoTourBtn');
  const tourIcon = document.getElementById('tourIcon');
  const tourText = document.getElementById('tourText');

  const bgAudio = document.getElementById('bg-audio');
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');

  const sealVowBtn = document.getElementById('sealVowBtn');
  const loopBackBtn = document.getElementById('loopBackBtn');

  /* ==========================================================================
     1. SOUND SYNTHESIZER (Dimensional Whoosh & Soft Harmonic Chimes)
     Web Audio API - No external asset dependencies for sound effects!
     ========================================================================== */
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudioCtx() {
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch (e) {}
  }

  // Play magical dimensional dive swoosh sound
  function playDiveSound(direction = 'in') {
    try {
      initAudioCtx();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      const now = audioCtx.currentTime;

      if (direction === 'in') {
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.35);
      } else {
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);
      }

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  // Play gentle chime on card reveal
  function playChimeSound() {
    try {
      initAudioCtx();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (e) {}
  }


  /* ==========================================================================
     2. PASSWORD LOCK SCREEN CONTROLLER
     ========================================================================== */
  // Toggle Eye Visibility
  if (toggleEye) {
    toggleEye.addEventListener('click', (e) => {
      e.preventDefault();
      if (passcodeInput.type === 'password') {
        passcodeInput.type = 'text';
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        passcodeInput.type = 'password';
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  }

  // Toggle Hint
  if (hintTrigger) {
    hintTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      hintBox.classList.toggle('active');
    });
  }

  // Validate and Unlock
  function attemptUnlock() {
    const rawVal = (passcodeInput.value || '').trim().toLowerCase();
    
    // Check if passcode matches any accepted words
    const isCorrect = VALID_PASSWORDS.some(pw => rawVal.includes(pw));

    if (isCorrect) {
      // Success!
      errorMsg.textContent = '';
      state.isUnlocked = true;

      // Unlock animation
      lockOverlay.classList.add('unlocked');
      initAudioCtx();
      playChimeSound();

      // Launch golden burst
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#e2a8b6', '#ffffff', '#ff4d6d']
        });
      }

      // Try playing background melody gently
      tryPlayMusic();
    } else {
      // Pick funny / loving reaction message
      const randomMsg = WRONG_PASS_MESSAGES[wrongAttemptCount % WRONG_PASS_MESSAGES.length];
      wrongAttemptCount++;

      errorMsg.textContent = randomMsg;
      errorMsg.style.color = '#ff6b81';
      errorMsg.style.animation = 'none';
      errorMsg.offsetHeight; // trigger reflow
      errorMsg.style.animation = 'shakeInput 0.4s ease';

      passcodeInput.classList.remove('shake');
      passcodeInput.offsetHeight; // trigger reflow
      passcodeInput.classList.add('shake');
      
      // Auto open hint box after 2 wrong tries to assist her
      if (wrongAttemptCount >= 2 && !hintBox.classList.contains('active')) {
        hintBox.classList.add('active');
      }

      passcodeInput.focus();
      passcodeInput.select();
    }
  }

  // Bind to form submission & button clicks
  if (lockForm) {
    lockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      attemptUnlock();
    });
  }

  if (unlockBtn) {
    unlockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      attemptUnlock();
    });
  }

  // Also unlock immediately on Enter keypress inside the input
  if (passcodeInput) {
    passcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        attemptUnlock();
      }
    });
  }


  /* ==========================================================================
     3. 3D RECURSIVE ZOOM & DROSTE ENGINE
     Zero scroll: mathematical 3D scale/translateZ layering
     ========================================================================== */
  function applyLayerClasses(targetDepth, direction = 'in') {
    layers.forEach((layer, index) => {
      if (!layer) return;
      layer.classList.remove('is-active', 'is-prev', 'is-next');

      if (index === targetDepth) {
        layer.classList.add('is-active');
      } else if (index < targetDepth) {
        layer.classList.add('is-prev');
      } else {
        layer.classList.add('is-next');
      }
    });

    // Update Breadcrumbs
    stepDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === targetDepth);
    });

    // Update Slider & Labels
    if (depthSlider) depthSlider.value = targetDepth;
    if (depthLabel) depthLabel.textContent = `${targetDepth + 1} / ${state.maxDepth + 1}`;

    // Update button states
    if (zoomOutBtn) zoomOutBtn.disabled = targetDepth === 0;
    if (zoomInBtn) {
      zoomInBtn.disabled = targetDepth === state.maxDepth;
      if (targetDepth === state.maxDepth) {
        zoomInBtn.innerHTML = `<span>Completed</span> <i class="fa-solid fa-check"></i>`;
      } else {
        zoomInBtn.innerHTML = `<span>Dive Deeper</span> <i class="fa-solid fa-arrow-right"></i>`;
      }
    }
  }

  function setDepth(newDepth, triggerSound = true) {
    if (newDepth < 0 || newDepth > state.maxDepth) return;
    const direction = newDepth >= state.currentDepth ? 'in' : 'out';

    state.currentDepth = newDepth;
    applyLayerClasses(newDepth, direction);

    if (triggerSound) {
      playDiveSound(direction);
    }

    if (zoomUniverse) {
      zoomUniverse.style.transform = `scale(1.02) translateZ(10px)`;
      setTimeout(() => {
        zoomUniverse.style.transform = `scale(1) translateZ(0px)`;
      }, 400);
    }
  }

  // Initial State Setup
  applyLayerClasses(0, 'in');

  // Next / Prev Button Clicks
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (state.currentDepth < state.maxDepth) {
        setDepth(state.currentDepth + 1);
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (state.currentDepth > 0) {
        setDepth(state.currentDepth - 1);
      }
    });
  }

  // Slider Scrubbing
  if (depthSlider) {
    depthSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      setDepth(val);
    });
  }

  // Stepper Dot Clicks
  stepDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.getAttribute('data-step'), 10);
      setDepth(step);
    });
  });

  // Portals on each page (Direct dive on click)
  const portal0 = document.getElementById('portal-0');
  const portal1 = document.getElementById('portal-1');
  const portal2 = document.getElementById('portal-2');
  const portal3 = document.getElementById('portal-3');

  if (portal0) portal0.addEventListener('click', () => setDepth(1));
  if (portal1) portal1.addEventListener('click', () => setDepth(2));
  if (portal2) portal2.addEventListener('click', () => setDepth(3));
  if (portal3) portal3.addEventListener('click', () => setDepth(4));


  /* ==========================================================================
     4. GYROSCOPE & MOUSE 3D TILT EFFECT
     Tilted in 3D space for tangible physical depth feel
     ========================================================================== */
  let mouseX = 0;
  let mouseY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Touch tilt support for mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  }, { passive: true });

  function renderTilt() {
    if (zoomUniverse) {
      currentTiltX += (mouseX * 5.5 - currentTiltX) * 0.08;
      currentTiltY += (-mouseY * 5.5 - currentTiltY) * 0.08;
      zoomUniverse.style.transform = `rotateY(${currentTiltX}deg) rotateX(${currentTiltY}deg)`;
    }
    requestAnimationFrame(renderTilt);
  }
  requestAnimationFrame(renderTilt);


  /* ==========================================================================
     5. INTERACTIVE TOUCHES: SECRETS REVEAL & VOW SEALING
     ========================================================================== */
  // 4 Secret Cards Flip
  const secretCards = document.querySelectorAll('.secret-card');
  secretCards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      playChimeSound();

      if (typeof confetti === 'function' && card.classList.contains('flipped')) {
        const rect = card.getBoundingClientRect();
        confetti({
          particleCount: 15,
          spread: 40,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          colors: ['#d4af37', '#ff6b81', '#fff']
        });
      }
    });
  });

  // Seal The Vow Celebration
  if (sealVowBtn) {
    sealVowBtn.addEventListener('click', () => {
      playChimeSound();
      sealVowBtn.innerHTML = `<i class="fa-solid fa-heart"></i> Sealed In Our Hearts Forever!`;
      sealVowBtn.style.background = 'linear-gradient(135deg, #1b7a43 0%, #0d4625 100%)';

      if (typeof confetti === 'function') {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio, opts) {
          confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
          }));
        }

        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#ff4d6d', '#d4af37'] });
        fire(0.2, { spread: 60, colors: ['#ffffff', '#e2a8b6'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      }
    });
  }


  /* ==========================================================================
     5B. 50-CLICK BROKEN HEART HEALING ACTIVITY CONTROLLER
     ========================================================================== */
  const mendHeartBtn = document.getElementById('mendHeartBtn');
  const mendBtnText = document.getElementById('mendBtnText');
  const heartHalfLeft = document.getElementById('heartHalfLeft');
  const heartHalfRight = document.getElementById('heartHalfRight');
  const heartCrack = document.getElementById('heartCrack');
  const heartPulseGlow = document.getElementById('heartPulseGlow');
  const healingProgressFill = document.getElementById('healingProgressFill');
  const clickCounter = document.getElementById('clickCounter');
  const healingPercent = document.getElementById('healingPercent');
  const healedSurpriseCard = document.getElementById('healedSurpriseCard');
  const sparksContainer = document.getElementById('sparksContainer');

  let heartClicks = 0;
  const TOTAL_TARGET_CLICKS = 50;

  function spawnTapSparkle() {
    if (!sparksContainer) return;
    const spark = document.createElement('div');
    spark.className = 'tap-sparkle';
    spark.innerHTML = ['✨', '❤️', '💖', '⭐'][Math.floor(Math.random() * 4)];

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 45 + 25;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    spark.style.setProperty('--tx', `${tx}px`);
    spark.style.setProperty('--ty', `${ty}px`);
    spark.style.left = '50%';
    spark.style.top = '50%';

    sparksContainer.appendChild(spark);
    setTimeout(() => spark.remove(), 750);
  }

  if (mendHeartBtn) {
    mendHeartBtn.addEventListener('click', () => {
      if (heartClicks >= TOTAL_TARGET_CLICKS) return;

      heartClicks++;
      initAudioCtx();

      if (audioCtx) {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const now = audioCtx.currentTime;
          
          const baseFreq = 220 + (heartClicks / TOTAL_TARGET_CLICKS) * 550;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, now);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
        } catch (err) {}
      }

      const ratio = heartClicks / TOTAL_TARGET_CLICKS;
      const percent = Math.floor(ratio * 100);

      if (clickCounter) clickCounter.textContent = `${heartClicks} / ${TOTAL_TARGET_CLICKS} Taps`;
      if (healingPercent) healingPercent.textContent = `${percent}% Mended`;
      if (healingProgressFill) healingProgressFill.style.width = `${percent}%`;

      const currentOffset = (1 - ratio) * 34;
      const currentRotate = (1 - ratio) * 16;
      
      if (heartHalfLeft) heartHalfLeft.style.transform = `translateX(-${currentOffset}px) rotate(-${currentRotate}deg)`;
      if (heartHalfRight) heartHalfRight.style.transform = `translateX(${currentOffset}px) rotate(${currentRotate}deg)`;
      if (heartCrack) heartCrack.style.opacity = `${(1 - ratio) * 0.85}`;

      if (heartPulseGlow) {
        heartPulseGlow.style.transform = `scale(${1 + ratio * 0.4})`;
        heartPulseGlow.style.opacity = `${0.4 + ratio * 0.6}`;
      }

      spawnTapSparkle();

      if (mendBtnText) {
        if (heartClicks === 10) {
          mendBtnText.textContent = "Keep going dii! It's pulling closer!";
        } else if (heartClicks === 25) {
          mendBtnText.textContent = "Halfway there! My heart is feeling your love!";
        } else if (heartClicks === 40) {
          mendBtnText.textContent = "Almost complete! Only 10 taps left!";
        } else if (heartClicks === 49) {
          mendBtnText.textContent = "One final tap to make us whole! ❤️";
        }
      }

      if (heartClicks === TOTAL_TARGET_CLICKS) {
        mendHeartBtn.disabled = true;
        mendHeartBtn.classList.add('completed');
        mendHeartBtn.innerHTML = `<i class="fa-solid fa-heart-circle-check"></i> My Heart Is 100% Whole!`;

        if (heartHalfLeft) heartHalfLeft.style.transform = `translateX(0px) rotate(0deg)`;
        if (heartHalfRight) heartHalfRight.style.transform = `translateX(0px) rotate(0deg)`;
        if (heartCrack) heartCrack.style.opacity = '0';

        if (heartHalfLeft && heartHalfLeft.parentElement) {
          heartHalfLeft.parentElement.style.animation = 'heartPulse 1.1s infinite';
        }

        if (healedSurpriseCard) {
          healedSurpriseCard.classList.add('show');
          healedSurpriseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        playChimeSound();
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#ff4d6d', '#d4af37', '#ffffff', '#c9184a']
          });
        }
      }
    });
  }

  // Restart Loop Back to Cover
  if (loopBackBtn) {
    loopBackBtn.addEventListener('click', () => {
      setDepth(0);
    });
  }


  /* ==========================================================================
     6. AUTO TOUR / AUTOPLAY RECURSIVE JOURNEY
     ========================================================================== */
  function toggleAutoTour() {
    if (state.isTouring) {
      clearInterval(state.tourInterval);
      state.isTouring = false;
      if (autoTourBtn) autoTourBtn.classList.remove('active');
      if (tourIcon) tourIcon.className = 'fa-solid fa-play';
      if (tourText) tourText.textContent = 'Auto Tour';
    } else {
      state.isTouring = true;
      if (autoTourBtn) autoTourBtn.classList.add('active');
      if (tourIcon) tourIcon.className = 'fa-solid fa-pause';
      if (tourText) tourText.textContent = 'Pause';

      state.tourInterval = setInterval(() => {
        let next = state.currentDepth + 1;
        if (next > state.maxDepth) {
          next = 0;
        }
        setDepth(next);
      }, 4500);
    }
  }

  if (autoTourBtn) {
    autoTourBtn.addEventListener('click', toggleAutoTour);
  }


  /* ==========================================================================
     7. ROMANTIC MUSIC PLAYER CONTROLLER
     ========================================================================== */
  function tryPlayMusic() {
    if (!bgAudio) return;
    bgAudio.play().then(() => {
      state.isPlayingMusic = true;
      if (soundToggle) soundToggle.classList.add('playing');
      if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high';
      if (soundText) soundText.textContent = 'Playing';
    }).catch(() => {});
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      initAudioCtx();
      if (!bgAudio) return;
      if (state.isPlayingMusic) {
        bgAudio.pause();
        state.isPlayingMusic = false;
        soundToggle.classList.remove('playing');
        if (soundIcon) soundIcon.className = 'fa-solid fa-music';
        if (soundText) soundText.textContent = 'Play Music';
      } else {
        bgAudio.play().then(() => {
          state.isPlayingMusic = true;
          soundToggle.classList.add('playing');
          if (soundIcon) soundIcon.className = 'fa-solid fa-volume-high';
          if (soundText) soundText.textContent = 'Playing';
        });
      }
    });
  }


  /* ==========================================================================
     8. AMBIENT ROSE-GOLD & EMBER CANVAS PARTICLES
     ========================================================================== */
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Ember {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedY = -(Math.random() * 0.45 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.4 ? 'rgba(212, 175, 55,' : 'rgba(226, 168, 182,';
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < -10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${this.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#d4af37';
        ctx.fill();
      }
    }

    const particleCount = window.innerWidth < 768 ? 35 : 65;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Ember());
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
  }

});
