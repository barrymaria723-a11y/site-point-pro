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
