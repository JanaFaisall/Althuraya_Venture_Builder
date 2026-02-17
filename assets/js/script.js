// script.js
(() => {
  "use strict";

  const SELECTORS = {
    langToggle: ".lang-toggle",
    hamburger: ".hamburger",
    navMenu: ".nav-menu",
    navLinks: ".nav-link",
    heroTitle: ".hero-title",
    i18nText: "[data-ar][data-en]",
    i18nPlaceholder: "[data-ar-placeholder][data-en-placeholder]",
    i18nImgAlt: "img[data-alt-ar][data-alt-en]",
    projectsBtn: ".main-btn",
    contactBtn: ".secondary-btn",
    navbar: ".navbar"
  };

  const STORAGE_KEY = "language";

  const state = {
    lang: "ar"
  };

  const el = {
    html: document.documentElement,
    langToggle: document.querySelector(SELECTORS.langToggle),
    hamburger: document.querySelector(SELECTORS.hamburger),
    navMenu: document.querySelector(SELECTORS.navMenu),
    navLinks: Array.from(document.querySelectorAll(SELECTORS.navLinks)),
    projectsBtn: document.querySelector(SELECTORS.projectsBtn),
    contactBtn: document.querySelector(SELECTORS.contactBtn),
    navbar: document.querySelector(SELECTORS.navbar)
  };

  /* =========================
     Helpers (Smooth scrolling with navbar offset)
     ========================= */
  function getNavbarOffset() {
    // Use real navbar height if found, fallback to known heights
    const h = el.navbar?.offsetHeight;
    if (typeof h === "number" && h > 0) return h;

    // fallback: based on your CSS
    return window.matchMedia("(max-width: 480px)").matches ? 64 : 72;
  }

  function smoothScrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;

    const offset = getNavbarOffset();
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top,
      behavior: "smooth"
    });
  }

  /* =========================
     Language
     ========================= */
  function renderHeroTitle(lang) {
    document.querySelectorAll(SELECTORS.heroTitle).forEach((node) => {
      const brand = lang === "ar" ? node.dataset.arBrand : node.dataset.enBrand;
      const rest = lang === "ar" ? node.dataset.arRest : node.dataset.enRest;
      node.innerHTML = `<span class="brand-gradient">${brand}</span> ${rest}`;
    });
  }

  function renderText(lang) {
    document.querySelectorAll(SELECTORS.i18nText).forEach((node) => {
      node.textContent = lang === "ar" ? node.dataset.ar : node.dataset.en;
    });
  }

  function renderPlaceholders(lang) {
    document.querySelectorAll(SELECTORS.i18nPlaceholder).forEach((node) => {
      const val = lang === "ar" ? node.dataset.arPlaceholder : node.dataset.enPlaceholder;
      node.setAttribute("placeholder", val);
    });
  }

  function renderImgAlts(lang) {
    document.querySelectorAll(SELECTORS.i18nImgAlt).forEach((img) => {
      img.alt = lang === "ar" ? img.dataset.altAr : img.dataset.altEn;
    });
  }

  function renderLangToggle(lang) {
    if (!el.langToggle) return;

    const opts = el.langToggle.querySelectorAll(".lang-option");
    opts.forEach((opt) => {
      const t = opt.textContent.trim();
      opt.classList.toggle("active", (t === "AR" && lang === "ar") || (t === "EN" && lang === "en"));
    });

    el.langToggle.dataset.lang = lang;
  }

  function setLanguage(lang) {
    state.lang = lang;
    el.html.setAttribute("lang", lang);
    el.html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    renderText(lang);
    renderHeroTitle(lang);
    renderImgAlts(lang);
    renderPlaceholders(lang);
    renderLangToggle(lang);

    localStorage.setItem(STORAGE_KEY, lang);
    updateActiveOnScroll();
  }

  function initLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    setLanguage(saved === "en" ? "en" : "ar");
  }

  /* =========================
     Navbar active link
     ========================= */
  function setActiveLinkById(id) {
    el.navLinks.forEach((link) => {
      const targetId = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", targetId === id);
    });
  }

  function updateActiveOnScroll() {
    const sections = document.querySelectorAll("section[id]");
    const probe = window.scrollY + window.innerHeight * 0.35;

    let currentId = sections[0]?.id || "home";

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (probe >= top && probe < top + height) currentId = sec.id;
    });

    setActiveLinkById(currentId);
  }

  /* =========================
     Mobile menu
     ========================= */
  function closeMobileMenu() {
    if (!el.hamburger || !el.navMenu) return;
    el.hamburger.classList.remove("active");
    el.navMenu.classList.remove("active");
    el.hamburger.setAttribute("aria-expanded", "false");
  }

  function toggleMobileMenu() {
    if (!el.hamburger || !el.navMenu) return;
    const isOpen = el.hamburger.classList.toggle("active");
    el.navMenu.classList.toggle("active", isOpen);
    el.hamburger.setAttribute("aria-expanded", String(isOpen));
  }

  function bindUI() {
    // Language toggle
    if (el.langToggle) {
      el.langToggle.addEventListener("click", () => {
        setLanguage(state.lang === "ar" ? "en" : "ar");
      });
    }

    // Navbar links -> smooth + offset
    el.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const id = link.getAttribute("href").replace("#", "");
        setActiveLinkById(id);
        smoothScrollToId(id);
        closeMobileMenu();
      });
    });

    // Hero buttons -> smooth + offset
    el.projectsBtn?.addEventListener("click", () => smoothScrollToId("projects"));
    el.contactBtn?.addEventListener("click", () => smoothScrollToId("contact"));

    // Hamburger
    if (el.hamburger) {
      el.hamburger.addEventListener("click", toggleMobileMenu);
      el.hamburger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") toggleMobileMenu();
      });
    }

    // Click outside closes menu
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-container")) closeMobileMenu();
    });

    // Active on scroll (throttled)
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          updateActiveOnScroll();
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* =========================
     Stars canvas
     ========================= */
  function initStars() {
    const canvas = document.getElementById("stars-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = 1;

    let stars = [];
    let tick = 0;
    let shooting = null;

    const cfg = {
      density: 0.00018,
      minR: 0.35,
      maxR: 1.6,
      driftX: 0.08,
      driftY: 0.15,
      twinkle: 0.02,
      violetChance: 0.5,
      shootingChance: 0.003
    };

    const rand = (a, b) => a + Math.random() * (b - a);
    const ang = rand(0, Math.PI * 2);

    function build() {
      const count = Math.floor(w * h * cfg.density);
      stars = Array.from({ length: count }, () => {
        const z = rand(0.2, 1);
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(cfg.minR, cfg.maxR) * (0.65 + z * 0.75),
          a: rand(0.2, 0.95),
          z,
          ph: rand(0, Math.PI * 2),
          sp: rand(0.7, 1.6),
          vio: Math.random() < cfg.violetChance && z > 0.6,
          dx: Math.cos(ang),
          dy: Math.sin(ang)
        };
      });
    }

    function resize() {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = window.innerWidth;
      h = window.innerHeight;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      build();
    }

    function spawnShooting() {
      shooting = {
        x: rand(w * 0.15, w * 0.85),
        y: rand(h * 0.05, h * 0.35),
        vx: rand(12, 18),
        vy: rand(12, 18) * 0.35,
        len: rand(220, 380),
        life: 0
      };
    }

    function drawShooting() {
      if (!shooting) return;

      shooting.life += 1;
      shooting.x += shooting.vx;
      shooting.y += shooting.vy;

      const gx = shooting.x;
      const gy = shooting.y;

      const grad = ctx.createLinearGradient(gx, gy, gx - shooting.len, gy - shooting.len * 0.35);
      grad.addColorStop(0, "rgba(255,255,255,.85)");
      grad.addColorStop(0.35, "rgba(184,150,247,.35)");
      grad.addColorStop(1, "rgba(255,255,255,0)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx - shooting.len, gy - shooting.len * 0.35);
      ctx.stroke();

      if (shooting.life > 28 || shooting.x > w + 200 || shooting.y > h + 200) shooting = null;
    }

    function draw() {
      tick += 1;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const tw = Math.sin(tick * 0.02 * s.sp + s.ph) * cfg.twinkle;
        const a = Math.max(0, Math.min(1, s.a + tw));

        s.x += cfg.driftX * s.dx * s.z;
        s.y += cfg.driftY * s.dy * s.z;

        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10;
        if (s.y > h + 10) s.y = -10;

        ctx.fillStyle = s.vio ? `rgba(184,150,247,${a})` : `rgba(255,255,255,${a})`;

        if (s.z > 0.85 && s.r > 1.1) {
          ctx.shadowColor = s.vio ? "rgba(184,150,247,.35)" : "rgba(255,255,255,.25)";
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      if (!shooting && Math.random() < cfg.shootingChance) spawnShooting();
      drawShooting();

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();
  }

  /* =========================
     Glass parallax
     ========================= */
  function initGlassParallax() {
    const rects = Array.from(document.querySelectorAll(".glass-rect"));
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || rects.length === 0) return;

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (x, y) => {
      tx = x / window.innerWidth - 0.5;
      ty = y / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches?.[0];
        if (t) onMove(t.clientX, t.clientY);
      },
      { passive: true }
    );

    function tick() {
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;

      rects.forEach((node, i) => {
        const depth = (i + 1) * 10;
        node.style.setProperty("--px", `${mx * depth}px`);
        node.style.setProperty("--py", `${my * depth}px`);
      });

      requestAnimationFrame(tick);
    }

    tick();
  }

  /* =========================
     Init
     ========================= */
  function init() {
    initLanguage();
    bindUI();
    updateActiveOnScroll();
    initStars();
    initGlassParallax();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
// Featured projects carousel ----------------------------------------------------------------------
(() => {
  const stack = document.getElementById('fp2Stack');
  if (!stack) return;

  const cards = [...stack.querySelectorAll('.fp2-card')];
  const titleEl = document.getElementById('fp2Title');
  const descEl  = document.getElementById('fp2Desc');
  const dotsWrap = document.getElementById('fp2Dots');

  const moreEl = document.getElementById('fp2ViewProjectBtn'); //  views the project button

  const isArabic = () => (document.documentElement.getAttribute('dir') || 'rtl') === 'rtl';

  // dots
  if (dotsWrap) {
    dotsWrap.innerHTML = cards.map((_, i) =>
      `<span class="fp2-dot ${i===0?'is-active':''}"></span>`
    ).join('');
  }
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll('.fp2-dot')] : [];

  let idx = 0;

  function setInfo(card){
    const ar = isArabic();
    titleEl.textContent = ar ? card.dataset.arTitle : card.dataset.enTitle;
    descEl.textContent  = ar ? card.dataset.arDesc  : card.dataset.enDesc;

    // ✅ تحديث رابط الزر حسب المشروع
    if (moreEl) {
      const link = card.dataset.link || '#contact';
      moreEl.href = link;

      const external = /^https?:\/\//i.test(link);
      moreEl.target = external ? '_blank' : '_self';
      moreEl.rel = external ? 'noopener' : '';
    }
  }

  function applyPositions(i){
    idx = i;

    cards.forEach(c => c.classList.remove('is-active','is-p1','is-p2','is-p3'));

    const active = cards[idx];
    const p1 = cards[(idx + 1) % cards.length];
    const p2 = cards[(idx + 2) % cards.length];
    const p3 = cards[(idx + 3) % cards.length];

    active.classList.add('is-active');
    p1.classList.add('is-p1');
    p2.classList.add('is-p2');
    p3.classList.add('is-p3');

    dots.forEach((d, di) => d.classList.toggle('is-active', di === idx));
    setInfo(active);
  }

  // interactions
  cards.forEach((c, i) => c.addEventListener('click', () => applyPositions(i)));

  document.querySelector('.fp2-prev')?.addEventListener('click', () => {
    applyPositions((idx - 1 + cards.length) % cards.length);
  });

  document.querySelector('.fp2-next')?.addEventListener('click', () => {
    applyPositions((idx + 1) % cards.length);
  });

  // refresh text when language dir changes
  new MutationObserver(() => applyPositions(idx))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });

  applyPositions(0);
})();


// Impact counters animation ----------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".impact-number");
  let started = false;

  const animateCounters = () => {
    if (started) return;
    started = true;

    counters.forEach(counter => {
      const target = +counter.dataset.target;
      const suffix = counter.dataset.suffix || "";
      const prefix = counter.textContent.trim().startsWith("$") ? "$" : "";
      let current = 0;

      const duration = 500; // سرعة الحركة (ms)
      const stepTime = Math.max(Math.floor(duration / target), 20);

      const timer = setInterval(() => {
        current++;
        counter.textContent = `${prefix}${current}${suffix}`;
        if (current >= target) {
          counter.textContent = `${prefix}${target}${suffix}`;
          clearInterval(timer);
        }
      }, stepTime);
    });
  };

  const impactSection = document.querySelector("#impact");

  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) {
        animateCounters();
      }
    },
    { threshold: 0.4 }
  );

  if (impactSection) observer.observe(impactSection);
});

// Contact form -> mailto --------------------------------------------------------------------------
function sendMail(e) {
  e.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  const lang = document.documentElement.getAttribute("lang") || "ar";

  // Direction marks
  const LTR = "\u200E"; // left-to-right mark
  const RTL = "\u200F"; // right-to-left mark

  const isAr = lang === "ar";

  const subject = encodeURIComponent(isAr ? "رسالة من موقع الثريا" : "Message from Althuraya Website");

  const bodyText = isAr
    ? (
        `${RTL}رسالة من موقع الثريا\n\n` +
        `${RTL}الاسم: ${name}\n` +
        `${RTL}البريد الإلكتروني: ${LTR}${email}\n\n` +
        `${RTL}الرسالة:\n${message}\n`
      )
    : (
        `${LTR}Message from Althuraya Website\n\n` +
        `${LTR}Full Name: ${name}\n` +
        `${LTR}Email: ${email}\n\n` +
        `${LTR}Message:\n${message}\n`
      );

  const body = encodeURIComponent(bodyText);

  window.location.href = `mailto:info@althuraya.com?subject=${subject}&body=${body}`;
}




