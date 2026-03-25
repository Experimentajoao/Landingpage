/* ================================================
   @experimenta — main.js
   ================================================ */

// ---- Scroll Reveal ----
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

// ---- Product Filter (produtos.html) ----
const initFilter = () => {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.product-card');
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

// ---- Contact Form ----
const initForm = () => {
  const form = document.querySelector('.contact__form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    // Simulate async send
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

// ---- Navbar shadow on scroll ----
const initNavbar = () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 4px 24px rgba(0,0,0,.35)'
      : 'none';
  }, { passive: true });
};

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  revealElements();
  initFilter();
  initForm();
  initNavbar();
});

// Expose for inline usage
function handleFormSubmit(e) {
  e.preventDefault();
}
