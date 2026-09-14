/* =========================================================
   CERRAJERÍA 24/7 — Interacciones y animaciones
   ========================================================= */
(function () {
  'use strict';

  var WA_NUMBER = '525529211956';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. PANTALLA DE CARGA
     Progreso animado + salida en cortinas. Nunca se ve la
     página "armándose": el loader cubre todo hasta el final.
  --------------------------------------------------------- */
  (function loader() {
    var el = document.getElementById('loader');
    if (!el) return;
    document.body.classList.add('is-loading');

    var fill = el.querySelector('.ld-fill');
    var pct = el.querySelector('.ld-pct');
    var progress = 0;
    var pageReady = false;
    var MIN_TIME = reduceMotion ? 400 : 2200;   // transición pausada, no abrupta
    var started = Date.now();

    window.addEventListener('load', function () { pageReady = true; });
    setTimeout(function () { pageReady = true; }, 6000); // red de seguridad

    var timer = setInterval(function () {
      var elapsed = Date.now() - started;
      var target = pageReady && elapsed >= MIN_TIME ? 100 : Math.min(94, (elapsed / MIN_TIME) * 94);
      progress += (target - progress) * 0.16;
      if (target === 100 && progress > 99.3) progress = 100;

      if (fill) fill.style.width = progress.toFixed(1) + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(finish, 320);
      }
    }, 40);

    function finish() {
      el.classList.add('is-done');
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      setTimeout(function () { el.classList.add('is-hidden'); }, 1600);
    }
  })();

  /* ---------------------------------------------------------
     2. NAVEGACIÓN
  --------------------------------------------------------- */
  (function nav() {
    var navEl = document.getElementById('nav');
    var ham = document.getElementById('ham');
    var mob = document.getElementById('mob');
    var bar = document.getElementById('scrollBar');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    var backdrop = document.createElement('div');
    backdrop.className = 'mob-backdrop';
    document.body.appendChild(backdrop);

    function closeMenu() {
      if (!mob) return;
      mob.classList.remove('open');
      if (ham) { ham.classList.remove('open'); ham.setAttribute('aria-expanded', 'false'); }
      backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }

    if (ham && mob) {
      ham.addEventListener('click', function () {
        var open = mob.classList.toggle('open');
        ham.classList.toggle('open', open);
        ham.setAttribute('aria-expanded', String(open));
        backdrop.classList.toggle('show', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
      backdrop.addEventListener('click', closeMenu);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }

    var ticking = false;
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;

      if (navEl) navEl.classList.toggle('scrolled', y > 60);

      // Barra de progreso de lectura
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }

      // Enlace activo
      var current = null;
      sections.forEach(function (s) {
        if (s.getBoundingClientRect().top <= 140) current = s.id;
      });
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });

      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // Desplazamiento suave con compensación del encabezado fijo
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        closeMenu();
        var offset = window.innerWidth < 1080 ? 70 : 84;
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.pageYOffset - offset,
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
      });
    });
  })();

  /* ---------------------------------------------------------
     3. REVELADO AL SCROLL + BRILLO DE TÍTULOS
  --------------------------------------------------------- */
  (function reveal() {
    var items = document.querySelectorAll('.rev');
    var heads = document.querySelectorAll('.heading--shine, .heading--shine-dark');

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('in'); });
      heads.forEach(function (h) { h.classList.add('shone'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (i) { io.observe(i); });

    // Los títulos con degradado se "encienden" al entrar en pantalla
    var ioHead = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('shone'); ioHead.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    heads.forEach(function (h) { ioHead.observe(h); });
  })();

  /* ---------------------------------------------------------
     4. MÁQUINA DE ESCRIBIR DEL HERO
  --------------------------------------------------------- */
  (function typewriter() {
    var out = document.getElementById('twText');
    if (!out) return;

    var words = [
      'apertura de puertas sin daño',
      'apertura de vehículos',
      'cambio e instalación de chapas',
      'reparación de cerraduras dañadas',
      'copia de llaves con chip',
      'apertura de cajas fuertes',
      'venta e instalación de cerraduras digitales'
    ];

    if (reduceMotion) { out.textContent = words[0]; return; }

    var i = 0, c = 0, deleting = false;

    function tick() {
      var w = words[i];
      c += deleting ? -1 : 1;
      out.textContent = w.substring(0, c);

      var delay = deleting ? 34 : 62;
      if (!deleting && c === w.length) { delay = 1750; deleting = true; }
      else if (deleting && c === 0) { deleting = false; i = (i + 1) % words.length; delay = 320; }

      setTimeout(tick, delay);
    }
    setTimeout(tick, 1500);
  })();

  /* ---------------------------------------------------------
     5. CONTADORES ANIMADOS (de 0 al valor real)
  --------------------------------------------------------- */
  (function counters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;

    function run(el) {
      var end = parseFloat(el.getAttribute('data-count')) || 0;
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      var dur = 1700;
      var t0 = null;

      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);      // easeOutCubic
        el.textContent = pre + Math.round(end * eased) + suf;
        if (p < 1) requestAnimationFrame(step);
      }

      if (reduceMotion) { el.textContent = pre + end + suf; return; }
      requestAnimationFrame(step);
    }

    // Valor inicial visible: nunca se queda en blanco
    nodes.forEach(function (n) {
      n.textContent = (n.getAttribute('data-prefix') || '') + '0' + (n.getAttribute('data-suffix') || '');
    });

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          run(e.target); io.unobserve(e.target);
        } else if (e.boundingClientRect.top < 0) {
          // Si se saltó la sección (navegación por anclas), muestra el valor final
          var el = e.target;
          el.textContent = (el.getAttribute('data-prefix') || '') +
                           (parseFloat(el.getAttribute('data-count')) || 0) +
                           (el.getAttribute('data-suffix') || '');
          io.unobserve(el);
        }
      });
    }, { threshold: [0, 0.45] });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* ---------------------------------------------------------
     6. PARTÍCULAS (varias secciones)
     Puntos y líneas en azul/verde de marca, ligeros y pausados.
  --------------------------------------------------------- */
  (function particles() {
    if (reduceMotion) return;

    var canvases = ['pcanvas', 'pcanvasWhy', 'pcanvasProceso', 'pcanvasGaleria']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    canvases.forEach(function (cv) {
      var ctx = cv.getContext('2d');
      var parts = [];
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = 0, h = 0, visible = true, raf = null;

      function size() {
        var r = cv.getBoundingClientRect();
        w = r.width; h = r.height;
        cv.width = w * dpr; cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        build();
      }

      function build() {
        var count = Math.min(58, Math.round((w * h) / 19000));
        parts = [];
        for (var i = 0; i < count; i++) {
          parts.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            r: Math.random() * 1.7 + 0.7,
            g: Math.random() > 0.68           // verde de acento
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.g ? 'rgba(125,224,125,.55)' : 'rgba(140,196,255,.45)';
          ctx.fill();

          for (var j = i + 1; j < parts.length; j++) {
            var q = parts[j];
            var dx = p.x - q.x, dy = p.y - q.y;
            var d2 = dx * dx + dy * dy;
            if (d2 < 16900) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = 'rgba(125,180,255,' + (0.16 * (1 - d2 / 16900)).toFixed(3) + ')';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
        raf = requestAnimationFrame(draw);
      }

      // Solo se anima cuando la sección está a la vista (rendimiento en móvil)
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            visible = e.isIntersecting;
            if (visible && !raf) draw();
            if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
          });
        }, { threshold: 0 }).observe(cv);
      }

      size();
      if (visible) draw();

      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(size, 220);
      }, { passive: true });
    });
  })();

  /* ---------------------------------------------------------
     7. PARALLAX SUAVE DEL HERO
  --------------------------------------------------------- */
  (function heroParallax() {
    if (reduceMotion) return;
    var bg = document.querySelector('.hero-bg');
    var body = document.querySelector('.hero-body');
    if (!bg) return;
    if (window.innerWidth < 900) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          bg.style.transform = 'scale(1.08) translateY(' + (y * 0.16) + 'px)';
          if (body) {
            body.style.transform = 'translateY(' + (y * 0.07) + 'px)';
            body.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
          }
        }
        ticking = false;
      });
    }, { passive: true });
  })();

  /* ---------------------------------------------------------
     8. FORMULARIO → WHATSAPP
     Nunca envía correo ni se queda cargando: abre WhatsApp
     con el mensaje ya redactado.
  --------------------------------------------------------- */
  (function form() {
    var f = document.getElementById('cForm');
    if (!f) return;
    var errBox = document.getElementById('formErr');

    f.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre = f.nombre.value.trim();
      var tel = f.telefono.value.trim();
      var serv = f.servicio.value;
      var zona = f.zona.value.trim();
      var msj = f.mensaje.value.trim();

      var faltan = [];
      [['nombre', nombre], ['telefono', tel], ['servicio', serv], ['zona', zona]].forEach(function (p) {
        var input = f[p[0]];
        var ok = !!p[1];
        input.classList.toggle('err', !ok);
        if (!ok) faltan.push(input);
      });

      if (faltan.length) {
        if (errBox) {
          errBox.textContent = 'Completa los campos marcados para poder atenderte más rápido.';
          errBox.hidden = false;
        }
        faltan[0].focus();
        return;
      }
      if (errBox) errBox.hidden = true;

      var texto =
        'Hola, necesito un cerrajero de Cerrajería 24/7.\n\n' +
        'Nombre: ' + nombre + '\n' +
        'Teléfono: ' + tel + '\n' +
        'Servicio: ' + serv + '\n' +
        'Ubicación: ' + zona +
        (msj ? '\nDetalle: ' + msj : '');

      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });

    f.querySelectorAll('.fi').forEach(function (i) {
      i.addEventListener('input', function () { i.classList.remove('err'); });
      i.addEventListener('change', function () { i.classList.remove('err'); });
    });
  })();

  /* ---------------------------------------------------------
     9. DETALLES FINALES
  --------------------------------------------------------- */
  (function misc() {
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  })();

})();
