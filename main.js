/* ================================================
   @experimentajoao — main.js
   ================================================ */

// ================================================
// STARFIELD CANVAS ANIMATION
// ================================================
const initStarfield = () => {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars, constellationEdges, comets, animId;

  // ---- Config ----
  const STAR_COUNT       = 220;
  const COMET_INTERVAL   = 3200;   // ms between new comets
  const CONSTELLATION_R  = 140;    // max dist for constellation lines
  const BRIGHT_COUNT     = 18;     // stars that form constellations

  // ---- Resize ----
  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildScene();
  };

  // ---- Build Stars ----
  const buildScene = () => {
    stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
      x:           Math.random() * W,
      y:           Math.random() * H,
      r:           Math.random() * 1.6 + 0.3,
      baseAlpha:   Math.random() * 0.6 + 0.3,
      alpha:       0,
      speed:       Math.random() * 0.008 + 0.004,
      phase:       Math.random() * Math.PI * 2,
      // ~15% warm-coloured (brand amber), rest cool white
      warm:        Math.random() < 0.15,
      bright:      i < BRIGHT_COUNT,
    }));

    // Constellation edges — connect bright stars within radius
    constellationEdges = [];
    const bright = stars.filter(s => s.bright);
    bright.forEach((a, i) => {
      bright.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < CONSTELLATION_R) constellationEdges.push([a, b]);
      });
    });

    comets = [];
  };

  // ---- Comet factory ----
  const spawnComet = () => {
    // Start from a random edge
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * W; y = -20; }
    else if (side === 1) { x = W + 20; y = Math.random() * H * 0.6; }
    else if (side === 2) { x = Math.random() * W; y = -20; }
    else { x = -20; y = Math.random() * H * 0.5; }

    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.6;
    const speed = Math.random() * 5 + 6;

    comets.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len:   Math.random() * 140 + 80,
      alpha: Math.random() * 0.6 + 0.4,
      dead: false,
    });
  };

  // ---- Draw Stars ----
  const drawStars = (t) => {
    stars.forEach(s => {
      s.alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);

      if (s.warm) {
        ctx.fillStyle = `rgba(255, 195, 90, ${s.alpha})`;
      } else if (s.bright) {
        ctx.fillStyle = `rgba(220, 235, 255, ${Math.min(s.alpha + 0.15, 1)})`;
      } else {
        ctx.fillStyle = `rgba(200, 215, 255, ${s.alpha})`;
      }
      ctx.fill();

      // Subtle cross-glint for bright stars
      if (s.bright && s.r > 1.2) {
        const g = s.alpha * 0.35;
        ctx.strokeStyle = `rgba(255, 255, 255, ${g})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 3, s.y);
        ctx.lineTo(s.x + s.r * 3, s.y);
        ctx.moveTo(s.x, s.y - s.r * 3);
        ctx.lineTo(s.x, s.y + s.r * 3);
        ctx.stroke();
      }
    });
  };

  // ---- Draw Constellation Lines ----
  const drawConstellations = () => {
    constellationEdges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(249, 140, 40, ${0.09 + a.alpha * 0.04})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });
  };

  // ---- Draw Comets ----
  const drawComets = () => {
    comets.forEach(c => {
      if (c.dead) return;

      // Tail direction is opposite to velocity
      const tx = c.x - (c.vx / Math.hypot(c.vx, c.vy)) * c.len;
      const ty = c.y - (c.vy / Math.hypot(c.vx, c.vy)) * c.len;

      const grad = ctx.createLinearGradient(tx, ty, c.x, c.y);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(0.6, `rgba(255, 200, 100, ${c.alpha * 0.3})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${c.alpha})`);

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(c.x, c.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Bright head
      const headGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 4);
      headGrad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
      headGrad.addColorStop(1, `rgba(255, 200, 100, 0)`);
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = headGrad;
      ctx.fill();

      // Move
      c.x += c.vx;
      c.y += c.vy;

      // Mark dead when off screen
      if (c.x > W + 80 || c.y > H + 80 || c.x < -80 || c.y < -80) {
        c.dead = true;
      }
    });

    // Clean up
    comets = comets.filter(c => !c.dead);
  };

  // ---- Animation Loop ----
  let lastComet = 0;
  const draw = (t) => {
    animId = requestAnimationFrame(draw);

    ctx.clearRect(0, 0, W, H);

    drawConstellations();
    drawStars(t * 0.001);
    drawComets();

    // Spawn comets periodically
    if (t - lastComet > COMET_INTERVAL) {
      spawnComet();
      lastComet = t;
    }
  };

  // ---- Init ----
  resize();
  window.addEventListener('resize', resize, { passive: true });
  // Fire first comet immediately
  setTimeout(spawnComet, 800);
  animId = requestAnimationFrame(draw);
};

// ================================================
// SCROLL REVEAL
// ================================================
const revealElements = () => {
  const elements = document.querySelectorAll(
    '.hiw-item, .order-card, .pillar, .compare__card, .product-card, .cta-free__inner > *'
  );
  elements.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-delay-1');
    if (i % 3 === 2) el.classList.add('reveal-delay-2');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

// ================================================
// PRODUCT FILTER (produtos.html)
// ================================================
const initFilter = () => {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.product-card');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
};

// ================================================
// CONTACT FORM
// ================================================
const initForm = () => {
  const form    = document.querySelector('.contact__form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.textContent = 'Enviar Mensagem';
      btn.disabled = false;
      if (success) {
        success.style.display = 'block';
        setTimeout(() => { success.style.display = 'none'; }, 5000);
      }
    }, 1200);
  });
};

// ================================================
// NAVBAR SHADOW
// ================================================
const initNavbar = () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 4px 24px rgba(0,0,0,.45)'
      : 'none';
  }, { passive: true });
};

// ================================================
// INIT
// ================================================
document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  revealElements();
  initFilter();
  initForm();
  initNavbar();
});
