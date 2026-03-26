// ════════════════════════════════════
// LOADER
// ════════════════════════════════════
(function () {
  const fill = document.getElementById("ldfill"),
    num = document.getElementById("ldnum");
  const loaderEl = document.getElementById("loader");
  let progress = 0;
  let target = 0;
  let raf = 0;
  let done = false;
  const startedAt = performance.now();
  const minVisibleMs = 700;

  function finishLoader() {
    if (done) return;
    done = true;
    loaderEl.classList.add("out");
    document.body.style.overflow = "";
    setTimeout(() => document.getElementById("nav").classList.add("ready"), 200);
  }

  function tick(now) {
    // Before full page load, approach 92% smoothly.
    if (target < 92) {
      const elapsed = now - startedAt;
      const t = Math.min(elapsed / 1200, 1);
      target = 92 * (1 - Math.pow(1 - t, 3));
    }

    // Smoothly approach the current target.
    progress += (target - progress) * 0.12;
    if (target >= 100 && progress > 99.6) progress = 100;

    fill.style.width = progress.toFixed(2) + "%";
    num.textContent = Math.floor(progress) + "%";

    if (progress >= 100) {
      const waitedEnough = now - startedAt >= minVisibleMs;
      if (waitedEnough) {
        finishLoader();
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  if (document.readyState === "complete") {
    target = 100;
  } else {
    window.addEventListener(
      "load",
      () => {
        target = 100;
      },
      { once: true }
    );
  }

  raf = requestAnimationFrame(tick);
})();
document.body.style.overflow = "hidden";

// ════════════════════════════════════
// FLOATING PILL NAV - animated active indicator (Monofactor-style)
// ════════════════════════════════════
(function () {
  const npi = document.getElementById("npi");
  const navEl = document.getElementById("nav");
  const navToggle = document.getElementById("nav-toggle");
  const navLinksEl = document.getElementById("nav-links");
  const links = document.querySelectorAll(".nav-links a[data-section]");
  let activeLink = null;
  let lastCur = null;
  const secs = [
    "about",
    "services",
    "projects",
    "ai",
    "comparison",
    "testimonials",
    "pricing",
    "why",
    "contact",
  ];
  let sectionTops = [];

  function setIndicator(el) {
    const parent = el.closest("ul");
    const pRect = parent.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    npi.style.width = eRect.width + "px";
    npi.style.height = eRect.height + "px";
    npi.style.left = eRect.left - pRect.left + "px";
    npi.style.top = eRect.top - pRect.top + "px";
    npi.style.opacity = "1";
    links.forEach((a) => a.classList.remove("active"));
    el.classList.add("active");
    activeLink = el;
  }
  function clearIndicator() {
    npi.style.opacity = "0";
    links.forEach((a) => a.classList.remove("active"));
    if (activeLink) {
      // restore scroll-based active
      updateScrollActive();
    }
    activeLink = null;
  }

  // Hover
  navEl.addEventListener("mouseleave", clearIndicator);
  links.forEach((a) => {
    a.addEventListener("mouseenter", () => setIndicator(a));
  });

  function closeMenu() {
    navEl.classList.remove("menu-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
  }

  if (navToggle && navLinksEl) {
    navToggle.addEventListener("click", () => {
      const isOpen = navEl.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    navLinksEl.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 768px)").matches) closeMenu();
      }),
    );
    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 768px)").matches) closeMenu();
    });
  }

  function refreshSectionTops() {
    sectionTops = secs
      .map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return { id, top: el.getBoundingClientRect().top + window.scrollY };
      })
      .filter(Boolean);
  }

  // Scroll-based active section
  function updateScrollActive() {
    const y = window.scrollY + 120;
    let cur = null;
    for (let i = 0; i < sectionTops.length; i++) {
      if (sectionTops[i].top <= y) cur = sectionTops[i].id;
      else break;
    }

    if (cur === lastCur) return;
    lastCur = cur;

    links.forEach((a) => {
      const active = a.dataset.section === cur;
      if (active && !a.matches(":hover")) {
        setIndicator(a);
        return;
      }
    });
    if (!cur) {
      npi.style.opacity = "0";
      links.forEach((a) => a.classList.remove("active"));
    }
  }

  const navWrap = document.getElementById("nav").parentElement;
  let scrollRaf = 0;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      updateScrollActive();
      navWrap.style.setProperty("--sh", scrollY > 60 ? "1" : "0");
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // Nav pill position needs recalc on resize
  window.addEventListener("resize", () => {
    refreshSectionTops();
    const act = document.querySelector(".nav-links a.active");
    if (act) setIndicator(act);
  });
  window.addEventListener("load", refreshSectionTops);
  refreshSectionTops();
  updateScrollActive();
})();

// ════════════════════════════════════
// CURSOR FX - only on interactive elements
// ════════════════════════════════════
(function () {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(hover: none), (pointer: coarse)").matches
  ) {
    const fx = document.getElementById("curFx");
    if (fx) fx.style.display = "none";
    return;
  }
  const fx = document.getElementById("curFx");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;
  let rafId = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  function tick() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    fx.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(tick);
  }
  function start() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      start();
    }
  });
  start();
  // Only show on links/buttons
  const SELECTORS = "a,button,.pc,.sc,.tcard,.wcard";
  document.querySelectorAll(SELECTORS).forEach((el) => {
    el.addEventListener("mouseenter", () => fx.classList.add("active"));
    el.addEventListener("mouseleave", () => fx.classList.remove("active"));
    el.addEventListener("mousedown", () => fx.classList.add("clicking"));
    el.addEventListener("mouseup", () => fx.classList.remove("clicking"));
  });
})();

// ════════════════════════════════════
// HERO WebGL SHADER
// ════════════════════════════════════
(function () {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const c = document.getElementById("hero-canvas");
  const gl = c.getContext("webgl");
  if (!gl) return;
  function r() {
    c.width = innerWidth;
    c.height = innerHeight;
    gl.viewport(0, 0, c.width, c.height);
  }
  r();
  window.addEventListener("resize", r);

  const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const FS = `precision highp float;
    uniform float t;uniform vec2 res;uniform vec2 mo;
    /* Darker emerald (same hue family as brand green) */
    vec3 g=vec3(0.,.42,.30);
    vec3 ink=vec3(.06,.07,.08);
    float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<7;i++){v+=a*noise(p);p=p*2.1+vec2(.3,.7);a*=.5;}return v;}
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*res)/min(res.x,res.y);
      vec2 m=(mo/res-.5)*2.;m.y*=-1.;
      float d=length(uv-m*.25);
      float w=sin(d*14.-t*2.2)*exp(-d*3.2)*.12;
      vec2 q=vec2(fbm(uv+t*.08),fbm(uv+vec2(1.9,9.4)+t*.06));
      vec2 rr=vec2(fbm(uv+1.7*q+vec2(1.7,9.2)+t*.09),fbm(uv+1.7*q+vec2(8.3,2.8)+t*.07));
      float f=fbm(uv+1.7*rr)+w;
      f=f+.45*fbm(uv*2.1+t*.04);
      float glow=smoothstep(.22,.88,f)*.38+f*.12;
      vec3 col=ink+g*glow;
      col=mix(col,col*1.22,smoothstep(.3,.75,f));
      float vg=1.-dot(uv*1.1,uv*1.1);
      col*=clamp(vg*1.4,.0,1.);
      col+=g*.09*(1.-smoothstep(.5,.9,length(uv)))*smoothstep(.45,.8,f);
      gl_FragColor=vec4(col,1.);
    }`;
  function sh(tp, src) {
    const s = gl.createShader(tp);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  gl.useProgram(pr);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const loc = gl.getAttribLocation(pr, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uT = gl.getUniformLocation(pr, "t"),
    uR = gl.getUniformLocation(pr, "res"),
    uM = gl.getUniformLocation(pr, "mo");
  let mx = 0,
    my = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  const t0 = performance.now();
  const heroEl = document.getElementById("hero");
  let heroInView = false;
  let raf = 0;
  function shouldRun() {
    return !document.hidden && heroInView;
  }
  function frame(now) {
    if (!shouldRun()) {
      raf = 0;
      return;
    }
    gl.uniform1f(uT, (now - t0) * 0.001);
    gl.uniform2f(uR, c.width, c.height);
    gl.uniform2f(uM, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  }
  const io = new IntersectionObserver(
    (entries) => {
      heroInView = !!entries[0]?.isIntersecting;
      if (shouldRun() && !raf) raf = requestAnimationFrame(frame);
      else if (!shouldRun()) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { threshold: 0, rootMargin: "0px 0px 48px 0px" },
  );
  io.observe(heroEl);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (shouldRun() && !raf) {
      raf = requestAnimationFrame(frame);
    }
  });
})();

// ════════════════════════════════════
// ABOUT - load background video when near viewport (saves bandwidth)
// ════════════════════════════════════
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const v = document.getElementById("about-visual-vid");
  if (!v) return;
  const wrap = v.closest(".about-visual");
  if (!wrap) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();
      v.load();
      v.play().catch(() => {});
    },
    { rootMargin: "160px 0px", threshold: 0.01 },
  );
  io.observe(wrap);
})();

// ════════════════════════════════════
// AI Terminal typewriter animation
// ════════════════════════════════════
(function () {
  const sequences = [
    {
      cmd: 'analyzeProject("dice-media")',
      out: "✓ Brend analiziran · UX audit · 3 preporuke generisane",
    },
    {
      cmd: 'generateHero({style:"editorial",ai:true})',
      out: "✓ AI vizual kreiran · Integrisan u Webflow · Live",
    },
    {
      cmd: 'optimizeSEO({target:"beograd",schema:true})',
      out: "✓ 12 ključnih reči · Schema markup · Score: 98",
    },
    {
      cmd: 'deployAgent({crm:"pipedrive",mode:"24/7"})',
      out: "✓ Lead agent aktivan · 3 ponude poslate danas",
    },
    {
      cmd: 'connectTools(["make","webflow","slack"])',
      out: "✓ Automatizacija aktivna · 0 manuelnih koraka",
    },
    {
      cmd: "buildLanding({convert:true,cms:true})",
      out: "✓ 7 sekcija · CMS spreman · Isporuka: 8 dana",
    },
  ];
  let si = 0;
  function type(el, text, speed, cb) {
    el.textContent = "";
    let i = 0;
    const iv = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(iv);
        cb && setTimeout(cb, 700);
      }
    }, speed);
  }
  function run() {
    const s = sequences[si % sequences.length];
    si++;
    const c1 = document.getElementById("at-cmd1"),
      o1 = document.getElementById("at-out1");
    const c2 = document.getElementById("at-cmd2"),
      o2 = document.getElementById("at-out2");
    if (!c1) return;
    c1.textContent = c2.textContent;
    o1.textContent = o2.textContent;
    c2.textContent = "";
    o2.textContent = "";
    type(c2, s.cmd, 26, () => type(o2, s.out, 16, () => setTimeout(run, 2400)));
  }
  setTimeout(run, 1000);
})();

// ════════════════════════════════════
// SERVICE CARD MOUSE GLOW
// ════════════════════════════════════
const scGlowState = new WeakMap();
function scGlow(el, e) {
  let st = scGlowState.get(el);
  if (!st) {
    st = { raf: 0, x: 0, y: 0 };
    scGlowState.set(el, st);
  }
  st.x = e.clientX;
  st.y = e.clientY;
  if (st.raf) return;
  st.raf = requestAnimationFrame(() => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((st.x - r.left) / r.width) * 100 + "%");
    el.style.setProperty("--my", ((st.y - r.top) / r.height) * 100 + "%");
    st.raf = 0;
  });
}

// ════════════════════════════════════
// PROJECTS - carousel (bounded), drag + arrows
// ════════════════════════════════════
(function initProjectsCarousel() {
  const track = document.getElementById("pt");
  if (!track) return;

  function observeVideoInCard(card, video) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && en.intersectionRatio > 0.22) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.22, 0.5, 1] },
    );
    io.observe(card);
  }

  function initPortfolioGrid(grid) {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    grid.querySelectorAll(".pc--portfolio").forEach((card) => {
      const viewport = card.querySelector(".pc-port-viewport[data-carousel]");
      if (!viewport) {
        card.querySelectorAll("video").forEach((v) =>
          observeVideoInCard(card, v),
        );
        return;
      }

      const slides = [...viewport.querySelectorAll(".pc-port-slide")];
      const trackEl = viewport.querySelector(".pc-port-track");
      const prev = card.querySelector(".pc-port-prev");
      const next = card.querySelector(".pc-port-next");
      if (!trackEl || slides.length < 2) return;

      let idx = 0;
      let isCardVisible = false;
      let scrollSyncRaf = 0;
      let dragStartX = null;
      let dragScrollStart = 0;

      function syncSlideVideos() {
        slides.forEach((slide, i) => {
          const v = slide.querySelector("video");
          if (!v) return;
          if (i === idx && isCardVisible) v.play().catch(() => {});
          else v.pause();
        });
      }

      function activeIndexFromScroll() {
        const vr = viewport.getBoundingClientRect();
        const mid = vr.left + vr.width / 2;
        let best = 0;
        let bestDist = Infinity;
        slides.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          const c = (r.left + r.right) / 2;
          const d = Math.abs(c - mid);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        return best;
      }

      function scrollToSlide(i, smooth) {
        const slide = slides[i];
        if (!slide) return;
        const vr = viewport.getBoundingClientRect();
        const sr = slide.getBoundingClientRect();
        const delta =
          sr.left + sr.width / 2 - (vr.left + vr.width / 2);
        const target = viewport.scrollLeft + delta;
        const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const left = Math.max(0, Math.min(max, target));
        viewport.scrollTo({
          left,
          behavior: smooth && !reducedMotion ? "smooth" : "auto",
        });
      }

      function onScroll() {
        cancelAnimationFrame(scrollSyncRaf);
        scrollSyncRaf = requestAnimationFrame(() => {
          idx = activeIndexFromScroll();
          syncSlideVideos();
        });
      }

      const ioCard = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (!e) return;
          isCardVisible = e.isIntersecting && e.intersectionRatio > 0.12;
          syncSlideVideos();
        },
        { threshold: [0, 0.12, 0.25, 0.5] },
      );
      ioCard.observe(card);

      viewport.addEventListener("scroll", onScroll, { passive: true });
      viewport.addEventListener(
        "scrollend",
        () => {
          idx = activeIndexFromScroll();
          syncSlideVideos();
        },
        { passive: true },
      );

      function goPrev() {
        idx = (idx - 1 + slides.length) % slides.length;
        scrollToSlide(idx, true);
      }

      function goNext() {
        idx = (idx + 1) % slides.length;
        scrollToSlide(idx, true);
      }

      if (prev) prev.addEventListener("click", goPrev);
      if (next) next.addEventListener("click", goNext);

      viewport.addEventListener(
        "pointerdown",
        (e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          if (e.target.closest("a, button")) return;
          dragStartX = e.clientX;
          dragScrollStart = viewport.scrollLeft;
          viewport.classList.add("is-dragging");
          try {
            viewport.setPointerCapture(e.pointerId);
          } catch (_) {}
        },
        { passive: true },
      );

      function endPointerDrag(e) {
        if (dragStartX === null) return;
        dragStartX = null;
        viewport.classList.remove("is-dragging");
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch (_) {}
        idx = activeIndexFromScroll();
        syncSlideVideos();
      }

      viewport.addEventListener(
        "pointermove",
        (e) => {
          if (dragStartX === null || e.pointerType !== "mouse") return;
          const dx = e.clientX - dragStartX;
          viewport.scrollLeft = dragScrollStart - dx;
        },
        { passive: true },
      );

      viewport.addEventListener("pointerup", endPointerDrag);
      viewport.addEventListener("pointercancel", endPointerDrag);

      let resizeRaf = 0;
      function onResize() {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          scrollToSlide(idx, false);
        });
      }
      window.addEventListener("resize", onResize);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          idx = activeIndexFromScroll();
          scrollToSlide(idx, false);
          syncSlideVideos();
        });
      });
    });
  }

  const navPrev = document.querySelector(".proj-nav .pnb:first-of-type");
  const navNext = document.querySelector(".proj-nav .pnb:last-of-type");

  if (track.classList.contains("proj-featured-grid")) {
    if (navPrev) navPrev.style.display = "none";
    if (navNext) navNext.style.display = "none";
    initPortfolioGrid(track);
    return;
  }

  const scroll = document.getElementById("proj-scroll");
  if (!scroll) return;

  const slides = [...track.querySelectorAll(".pc[data-slide]")];
  const n = slides.length;
  if (!n) return;

  let idx = 0;
  let step = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragBase = 0;
  let trans = 0;
  let animating = false;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const durationMs = 720;

  function getGap() {
    const g = getComputedStyle(track).gap;
    return parseFloat(g) || 28;
  }

  function measure() {
    const card = track.querySelector(".pc[data-slide]");
    if (!card) return;
    step = card.offsetWidth + getGap();
    if (!step) step = 1;
  }

  function minTrans() {
    return n <= 1 ? 0 : -(n - 1) * step;
  }

  function clampTrans(px) {
    const lo = minTrans();
    return Math.max(lo, Math.min(0, px));
  }

  function setTranslate(px, instant) {
    trans = clampTrans(px);
    const noAnim = instant || reducedMotion;
    track.style.transition = noAnim
      ? "none"
      : `transform ${durationMs}ms ${ease}`;
    track.style.transform = `translate3d(${trans}px,0,0)`;
    animating = !noAnim;
  }

  function updateNav() {
    if (!navPrev || !navNext) return;
    const atStart = idx <= 0;
    const atEnd = idx >= n - 1;
    navPrev.disabled = atStart;
    navNext.disabled = atEnd;
    navPrev.setAttribute("aria-disabled", atStart ? "true" : "false");
    navNext.setAttribute("aria-disabled", atEnd ? "true" : "false");
  }

  function onTransitionEnd(e) {
    if (e.target !== track || e.propertyName !== "transform" || dragging)
      return;
    animating = false;
  }

  track.addEventListener("transitionend", onTransitionEnd);

  window.ps = function (dir) {
    if (animating || dragging || n < 2) return;
    const next = idx + dir;
    if (next < 0 || next > n - 1) return;
    measure();
    idx = next;
    setTranslate(-idx * step, false);
    updateNav();
  };

  function snapAfterDrag() {
    measure();
    let nearest = Math.round(-trans / step);
    nearest = Math.max(0, Math.min(n - 1, nearest));
    idx = nearest;
    setTranslate(-idx * step, false);
    updateNav();
  }

  scroll.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0) return;
      if (e.target.closest("a, button")) return;
      dragging = true;
      scroll.classList.add("is-dragging");
      measure();
      dragStartX = e.clientX;
      dragBase = trans;
      track.style.transition = "none";
      animating = false;
      scroll.setPointerCapture(e.pointerId);
    },
    { passive: true },
  );

  scroll.addEventListener(
    "pointermove",
    (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      setTranslate(dragBase + dx, true);
    },
    { passive: true },
  );

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    scroll.classList.remove("is-dragging");
    try {
      scroll.releasePointerCapture(e.pointerId);
    } catch (_) {}
    snapAfterDrag();
  }

  scroll.addEventListener("pointerup", endDrag);
  scroll.addEventListener("pointercancel", endDrag);

  function layout() {
    measure();
    idx = Math.max(0, Math.min(n - 1, idx));
    setTranslate(-idx * step, true);
    updateNav();
  }

  requestAnimationFrame(() => requestAnimationFrame(layout));
  window.addEventListener("resize", layout);

  track.querySelectorAll(".pc[data-slide] video").forEach((v) => {
    const card = v.closest(".pc");
    if (!card) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && en.intersectionRatio > 0.25) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 1] },
    );
    io.observe(card);
  });
})();

const ro = new IntersectionObserver(
  (en) =>
    en.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        ro.unobserve(e.target);
      }
    }),
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);
document.querySelectorAll(".reveal,.reveal-l").forEach((el) => ro.observe(el));

// Stagger children removed to avoid hover transition-delay bugs

// ════════════════════════════════════
// SMOOTH LINKS
// ════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const h = a.getAttribute("href");
    if (h === "#") return;
    e.preventDefault();
    document.querySelector(h)?.scrollIntoView({ behavior: "smooth" });
  }),
);

// ════════════════════════════════════
// ACCORDION TOGGLE
// ════════════════════════════════════
function toggleTalk(el) {
  const isOpen = el.classList.contains("open");
  const accordion = el.closest(".talk-accordion");
  const items = accordion
    ? accordion.querySelectorAll(".talk-item")
    : document.querySelectorAll(".talk-item");
  items.forEach((item) => item.classList.remove("open"));
  if (!isOpen) {
    el.classList.add("open");
  }
}
