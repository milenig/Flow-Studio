// ════════════════════════════════════
// LOADER
// ════════════════════════════════════
(function () {
  const fill = document.getElementById("ldfill"),
    num = document.getElementById("ldnum");
  let p = 0,
    iv = setInterval(() => {
      p += Math.random() * 15 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => {
          document.getElementById("loader").classList.add("out");
          document.body.style.overflow = "";
          setTimeout(
            () => document.getElementById("nav").classList.add("ready"),
            200,
          );
        }, 400);
      }
      fill.style.width = p + "%";
      num.textContent = Math.floor(p) + "%";
    }, 90);
})();
document.body.style.overflow = "hidden";

// ════════════════════════════════════
// FLOATING PILL NAV — animated active indicator (Monofactor-style)
// ════════════════════════════════════
(function () {
  const npi = document.getElementById("npi");
  const links = document.querySelectorAll(".nav-links a[data-section]");
  let activeLink = null;

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
  const navEl = document.getElementById("nav");
  navEl.addEventListener("mouseleave", clearIndicator);
  links.forEach((a) => {
    a.addEventListener("mouseenter", () => setIndicator(a));
  });

  // Scroll-based active section
  function updateScrollActive() {
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
    let cur = null;
    for (const id of secs) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= 120) cur = id;
    }
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
  window.addEventListener("scroll", updateScrollActive, { passive: true });

  // Nav pill position needs recalc on resize
  window.addEventListener("resize", () => {
    const act = document.querySelector(".nav-links a.active");
    if (act) setIndicator(act);
  });

  // Nav background on scroll
  window.addEventListener(
    "scroll",
    () => {
      document
        .getElementById("nav")
        .parentElement.style.setProperty("--sh", scrollY > 60 ? "1" : "0");
    },
    { passive: true },
  );
})();

// ════════════════════════════════════
// CURSOR FX — only on interactive elements
// ════════════════════════════════════
(function () {
  const fx = document.getElementById("curFx");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  (function tick() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    fx.style.left = rx + "px";
    fx.style.top = ry + "px";
    requestAnimationFrame(tick);
  })();
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
    vec3 pal(float t){
      return vec3(.08,.08,.11)+vec3(.07,.08,.05)*cos(6.283*(vec3(.06,.11,.07)*t+vec3(0.,.35,.6)));
    }
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
      vec3 col=pal(f+t*.04);
      col=mix(col,col*2.2,smoothstep(.3,.7,f));
      float vg=1.-dot(uv*1.1,uv*1.1);
      col*=clamp(vg*1.4,.0,1.);
      col+=vec3(0.,.14,.08)*(1.-smoothstep(.5,.9,length(uv)))*smoothstep(.45,.8,f);
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
  (function frame(now) {
    gl.uniform1f(uT, (now - t0) * 0.001);
    gl.uniform2f(uR, c.width, c.height);
    gl.uniform2f(uM, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  })(t0);
})();

// ════════════════════════════════════
// AI canvas — orbit bubble animation
// (swapped from agency section)
// ════════════════════════════════════
(function () {
  const c = document.getElementById("ai-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");

  function resize() {
    c.width = c.parentElement.offsetWidth;
    c.height = c.parentElement.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(c.parentElement);

  const orbits = [
    {
      label: "flowstudio",
      r: 0,
      speed: 0,
      col: "#00e5a0",
      size: 54,
      pulse: 0,
      angle: 0,
    },
    {
      label: "Webflow",
      r: 80,
      speed: 0.011,
      col: "#146EF5",
      size: 36,
      angle: 0.5,
    },
    {
      label: "Framer",
      r: 80,
      speed: 0.011,
      col: "#0055FF",
      size: 34,
      angle: 3.2,
    },
    {
      label: "Make",
      r: 125,
      speed: 0.008,
      col: "#6E30D9",
      size: 28,
      angle: 0.9,
    },
    {
      label: "GPT-4o",
      r: 125,
      speed: 0.008,
      col: "#10a37f",
      size: 28,
      angle: 3.0,
    },
    {
      label: "SEO",
      r: 125,
      speed: 0.008,
      col: "#2563eb",
      size: 26,
      angle: 5.2,
    },
    {
      label: "Cursor",
      r: 162,
      speed: 0.006,
      col: "#7c3aed",
      size: 22,
      angle: 1.5,
    },
    {
      label: "n8n",
      r: 162,
      speed: 0.006,
      col: "#ea4b71",
      size: 20,
      angle: 3.8,
    },
    {
      label: "Lottie",
      r: 162,
      speed: 0.006,
      col: "#00c48c",
      size: 20,
      angle: 5.8,
    },
    {
      label: "Figma",
      r: 162,
      speed: 0.006,
      col: "#f24e1e",
      size: 20,
      angle: 0.2,
    },
  ];

  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  function frame() {
    const W = c.width,
      H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#060810";
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2,
      cy = H / 2;

    // Rings
    [80, 125, 162].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,.05)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Ambient center glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
    glow.addColorStop(0, "rgba(0,229,160,.07)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    orbits.forEach((o) => {
      o.angle += o.speed;
      const nx = o.r === 0 ? cx : cx + Math.cos(o.angle) * o.r;
      const ny = o.r === 0 ? cy : cy + Math.sin(o.angle) * o.r;
      const s = o.size;
      const rgb =
        parseInt(o.col.slice(1, 3), 16) +
        "," +
        parseInt(o.col.slice(3, 5), 16) +
        "," +
        parseInt(o.col.slice(5, 7), 16);

      // Glow halo
      const gr = ctx.createRadialGradient(nx, ny, 0, nx, ny, s * 1.6);
      gr.addColorStop(0, `rgba(${rgb},.2)`);
      gr.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(nx, ny, s * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();

      // Circle
      ctx.beginPath();
      ctx.arc(nx, ny, s / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},.1)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb},.65)`;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Center pulsing dashes
      if (o.r === 0) {
        ctx.save();
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.arc(nx, ny, s / 2 + 9, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,229,160,.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Connector lines to orbit-1
      if (o.r === 80) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `rgba(${rgb},.12)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Label
      ctx.save();
      const fs = Math.max(9, s / 3.8);
      ctx.font = `600 ${fs.toFixed(0)}px "Inter",sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,.82)";
      ctx.fillText(o.label, nx, ny);
      ctx.restore();
    });

    requestAnimationFrame(frame);
  }
  frame();
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

// Project placeholder canvas
(function () {
  const c = document.getElementById("pc4");
  if (!c) return;
  const ctx = c.getContext("2d");
  let t = 0;
  function fr() {
    ctx.fillStyle = "rgba(12,12,14,.18)";
    ctx.fillRect(0, 0, c.width, c.height);
    [
      [200, 145, 0, "rgba(0,229,160,"],
      [80, 145, -1, "rgba(124,58,237,"],
      [380, 145, 0.7, "rgba(37,99,235,"],
    ].forEach(([x, y, d, col], i) => {
      const ax = x + Math.cos(t + i * 2.1) * 60,
        ay = y + Math.sin(t * 1.1 + i * 2.1) * 35;
      const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, 80);
      g.addColorStop(0, col + ".4)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ax, ay, 80, 0, Math.PI * 2);
      ctx.fill();
    });
    t += 0.009;
    requestAnimationFrame(fr);
  }
  fr();
})();

// ════════════════════════════════════
// SERVICE CARD MOUSE GLOW
// ════════════════════════════════════
function scGlow(el, e) {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
  el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
}

// ════════════════════════════════════
// PROJECT HORIZONTAL SCROLL
// ════════════════════════════════════
let pi = 0;
function ps(dir) {
  const track = document.getElementById("pt");
  const cards = track.querySelectorAll(".pc");
  const cw = cards[0].offsetWidth + 22;
  pi = Math.max(0, Math.min(cards.length - 2, pi + dir));
  track.style.transform = `translateX(-${pi * cw}px)`;
}

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
  document.querySelectorAll(".talk-item").forEach((item) => {
    item.classList.remove("open");
  });
  if (!isOpen) {
    el.classList.add("open");
  }
}
