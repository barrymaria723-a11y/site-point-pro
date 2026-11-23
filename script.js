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
