(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id){ return document.getElementById(id); }

  // Menu mobile
  var mb = $('menuBtn'), nav = $('navlinks');
  if (mb && nav) {
    var setMenu = function(o){ nav.classList.toggle('open', o); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); mb.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu'); };
    mb.addEventListener('click', function(){ setMenu(!nav.classList.contains('open')); });
    [].forEach.call(nav.querySelectorAll('a'), function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  }

  // Machine à écrire (accueil)
  var typed = $('typed');
  if (typed) {
    var words = ['vos parpaings', 'vos engins', 'votre ciment', 'vos ambitions'], wi = 0, ci = 0, del = false, pause = 0;
    if (reduce) typed.textContent = words[3];
    else setInterval(function(){
      if (pause) { pause--; return; }
      var w = words[wi];
      if (!del) { if (ci < w.length) ci++; else { del = true; pause = 22; } }
      else { if (ci > 0) ci--; else { del = false; pause = 4; wi = (wi + 1) % words.length; } }
      typed.textContent = w.slice(0, ci);
    }, 85);
  }

  // Bandeau défilant
  var track = $('track');
  if (track) {
    var mq = ['BRIQUETERIE', 'MATÉRIAUX', 'TRANSPORT', 'LOCATION D’ENGINS', 'CONAKRY', 'MAMOU', 'KINDIA', 'ON CONSTRUIT VOS AMBITIONS'];
    track.innerHTML = mq.concat(mq).map(function(x){ return '<span>' + x + '</span>'; }).join('');
  }

  // Apparition au défilement et compteurs
  function countUp(el){
    var to = +el.dataset.to, start = performance.now();
    function f(now){ var p = Math.min(1, (now - start) / 1800), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e).toLocaleString('fr-FR'); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  var targets = document.querySelectorAll('.reveal, .count');
  if (reduce || !('IntersectionObserver' in window)) [].forEach.call(targets, function(el){ el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.classList.contains('count')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    [].forEach.call(targets, function(el){ io.observe(el); });
  }

  // Onglets du catalogue (tarifs)
  var tabs = document.querySelectorAll('.tab');
  [].forEach.call(tabs, function(t, k){
    t.addEventListener('click', function(){ [].forEach.call(tabs, function(o){ var on = o === t; o.setAttribute('aria-selected', on ? 'true' : 'false'); var pnl = $(o.getAttribute('aria-controls')); pnl.hidden = !on; if (on) pnl.classList.add('in'); }); });
    t.addEventListener('keydown', function(e){ if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; var n = tabs[(k + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); n.click(); });
  });

  // Formulaire de devis (contact)
  var form = $('devis');
  if (form) {
    var cf = $('companyField'), company = $('company');
    [].forEach.call(document.querySelectorAll('input[name="who"]'), function(r){
      r.addEventListener('change', function(){ var ent = r.value === 'Entreprise' && r.checked; cf.hidden = !ent; company.required = ent; form.classList.toggle('is-ent', ent); if (ent) company.focus(); });
    });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = function(id){ return $(id).value.trim(); };
      var who = document.querySelector('input[name="who"]:checked').value;
      var msg = 'Bonjour POINT PRO GUINÉE, je souhaite un devis.\nClient : ' + who + (who === 'Entreprise' ? ' (' + v('company') + ')' : '') + '\nNom : ' + v('name') + '\nTéléphone : ' + v('phone') + '\nService : ' + v('service') + '\nVille : ' + v('city') + '\nBesoin : ' + v('need');
      window.open('https://wa.me/224620776222?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }
})();

// ===== Effets =====
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Barre de progression + en-tête resserré + retour en haut
  var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  var top = document.createElement('button'); top.className = 'to-top'; top.type = 'button'; top.setAttribute('aria-label', 'Revenir en haut de la page');
  top.innerHTML = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
  top.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  document.body.appendChild(top);
  var nav = document.querySelector('.nav'), ticking = false;
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 40);
    top.classList.toggle('show', y > 600);
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Titre des pages intérieures : mots qui montent un par un
  var h1 = document.querySelector('.page-hero h1');
  if (h1 && !reduce) {
    var text = h1.textContent;
    h1.setAttribute('aria-label', text);
    h1.innerHTML = text.split(' ').map(function(w, i){ return '<span class="w" aria-hidden="true" style="animation-delay:' + (0.1 + i * 0.12) + 's">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>'; }).join(' ');
  }

  // Halo qui suit la souris dans les en-têtes
  [].forEach.call(document.querySelectorAll('.page-hero, .hero'), function(hero){
    var g = document.createElement('div'); g.className = 'glow'; g.setAttribute('aria-hidden', 'true');
    hero.insertBefore(g, hero.querySelector('.page-hero-inner, .hero-inner'));
    if (!fine || reduce) return;
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      g.style.left = (e.clientX - r.left) + 'px'; g.style.top = (e.clientY - r.top) + 'px';
    });
  });

  // Apparition en cascade des cartes et photos
  var groups = '.services, .equipment-grid, .brick-gallery, .gallery, .stats, .fleet, .cat-docs, .pave-card, .brick-points, .footer-grid, .ticks';
  var items = [];
  [].forEach.call(document.querySelectorAll(groups), function(g){
    [].forEach.call(g.children, function(c, i){
      c.classList.remove('reveal'); c.classList.add('stagger'); c.style.transitionDelay = (i * 90) + 'ms'; items.push(c);
    });
  });
  if (reduce || !('IntersectionObserver' in window)) items.forEach(function(c){ c.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        setTimeout(function(){ en.target.style.transitionDelay = ''; en.target.classList.remove('stagger'); }, 1400);
        io.unobserve(en.target);
      });
    }, { threshold: 0.1 });
    items.forEach(function(c){ io.observe(c); });
  }

  // Cartes en relief qui suivent la souris
  if (fine && !reduce) {
    [].forEach.call(document.querySelectorAll('.service, .equip'), function(card){
      card.classList.add('tilt');
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });
  }
})();

// ===== Effets, suite =====
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Onde au clic et boutons « aimantés »
  [].forEach.call(document.querySelectorAll('.btn, .wa'), function(b){
    b.addEventListener('click', function(e){
      if (reduce) return;
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement('span');
      d.className = 'ripple'; d.style.width = d.style.height = s + 'px';
      d.style.left = (e.clientX - r.left - s / 2) + 'px'; d.style.top = (e.clientY - r.top - s / 2) + 'px';
      b.appendChild(d); setTimeout(function(){ d.remove(); }, 650);
    });
    if (!fine || reduce || !b.classList.contains('btn')) return;
    b.addEventListener('mousemove', function(e){
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
  });

  // Parallaxe du texte des en-têtes
  var heads = document.querySelectorAll('.page-hero-inner, .hero-inner');
  if (heads.length && !reduce) {
    var t = false;
    window.addEventListener('scroll', function(){
      if (t) return; t = true;
      requestAnimationFrame(function(){
        var y = window.scrollY;
        [].forEach.call(heads, function(h){ if (y < 900) { h.style.transform = 'translateY(' + (y * 0.25).toFixed(1) + 'px)'; h.style.opacity = Math.max(0, 1 - y / 700).toFixed(2); } });
        t = false;
      });
    }, { passive: true });
  }

  // Poussière de chantier dans la bannière d'accueil
  var hero = document.querySelector('.hero');
  if (hero && !reduce) {
    var c = document.createElement('canvas'); c.className = 'dust'; c.setAttribute('aria-hidden', 'true');
    hero.insertBefore(c, hero.querySelector('.hero-inner'));
    var ctx = c.getContext('2d'), W, H, dpr = Math.min(2, window.devicePixelRatio || 1), parts = [];
    function size(){ W = hero.clientWidth; H = hero.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < 46; i++) parts.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.6, s: 0.15 + Math.random() * 0.45, a: 0.25 + Math.random() * 0.5, o: Math.random() < 0.35 });
    var running = true;
    new IntersectionObserver(function(en){ running = en[0].isIntersecting; if (running) requestAnimationFrame(draw); }).observe(hero);
    function draw(){
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function(p){
        p.y -= p.s / H * 1.4; p.x += Math.sin((p.y + p.r) * 12) * 0.0004;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.283);
        ctx.fillStyle = p.o ? 'rgba(232,137,43,' + p.a + ')' : 'rgba(255,255,255,' + (p.a * 0.6) + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // Visionneuse photo pour les galeries
  var shots = [].slice.call(document.querySelectorAll('.brick-gallery a, .gallery figure, .gallery a, .fleet figure, .brick-photo, .cat-doc'));
  if (shots.length) {
    var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Visionneuse de photos');
    lb.innerHTML = '<span class="lb-count"></span><figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-close" type="button" aria-label="Fermer"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button class="lb-prev" type="button" aria-label="Photo précédente"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button class="lb-next" type="button" aria-label="Photo suivante"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), cnt = lb.querySelector('.lb-count'), cur = 0, last = null;
    var data = shots.map(function(el){
      var im = el.querySelector('img'), txt = el.querySelector('figcaption') || el.querySelector('b') || el.querySelector('span');
      return { src: (el.getAttribute('href') || im.getAttribute('src')).split('?')[0], alt: im.getAttribute('alt') || '', cap: txt ? txt.textContent.replace('↗', '').trim() : (im.getAttribute('alt') || '') };
    });
    function show(i){ cur = (i + data.length) % data.length; img.src = data[cur].src; img.alt = data[cur].alt; cap.textContent = data[cur].cap; cnt.textContent = (cur + 1) + ' / ' + data.length; }
    function open(i){ last = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
    function close(){ lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
    shots.forEach(function(el, i){
      el.classList.add('zoomable');
      if (!el.matches('a')) { el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Agrandir : ' + data[i].cap); }
      el.addEventListener('click', function(e){ e.preventDefault(); open(i); });
      el.addEventListener('keydown', function(e){ if (!el.matches('a') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(i); } });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function(){ show(cur - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function(){ show(cur + 1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
      else if (e.key === 'Tab') { var f = lb.querySelectorAll('button'), first = f[0], end = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); } else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); } }
    });
    var sx = 0; lb.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function(e){ var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });
  }
})();
