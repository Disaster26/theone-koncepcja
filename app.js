(function () {
  'use strict';
  var P = window.PRODUKTY || [];
  var TEL = '48572641457', MAIL = 'biuro@theone.pl';
  var KAT = { zar: 'Pierścionki zaręczynowe', pie: 'Pierścionki', kol: 'Kolczyki', nas: 'Naszyjniki', bra: 'Bransoletki', zaw: 'Zawieszki i krzyżyki', cha: 'Charms i beads' };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var zl = function (n) { return n.toLocaleString('pl-PL', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' zł'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pierscionek = function (p) { return p && (p.kat === 'zar' || p.kat === 'pie'); };

  /* ---------- menu ---------- */
  var burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otw');
    burger.setAttribute('aria-expanded', o);
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('otw'); burger.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- dolny pasek po przewinięciu za CTA ---------- */
  var mob = $('#mob'), heroCta = $('.hero-cta');
  if ('IntersectionObserver' in window && heroCta) {
    new IntersectionObserver(function (e) {
      var r = e[0].boundingClientRect;
      mob.classList.toggle('widac', !e[0].isIntersecting && r.top < 0);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(heroCta);
  }

  /* ---------- stan ---------- */
  var st = { dla: '', ok: '', met: '', max: '', kat: '' };
  var lista = [];      // {id, roz} lub {bon: 500}
  var dzien = '';
  try { var z = JSON.parse(localStorage.getItem('theone_lista') || '[]'); if (Array.isArray(z)) lista = z.filter(function (x) { return x.bon || P.some(function (p) { return p.id === x.id; }); }); } catch (e) {}
  var zapisz = function () { try { localStorage.setItem('theone_lista', JSON.stringify(lista)); } catch (e) {} };
  var naLiscie = function (id) { return lista.some(function (x) { return x.id === id; }); };

  /* ---------- filtry ---------- */
  $$('#filtry .chipy').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', g).forEach(function (c) { c.classList.toggle('on', c === b); });
      st[g.dataset.f] = b.dataset.v;
      if (g.dataset.f === 'ok' && b.dataset.v && b.dataset.v !== 'zar' && st.kat === 'zar') st.kat = '';
      rysuj();
    });
  });
  $('#katReset').addEventListener('click', function () { st.kat = ''; rysuj(); });

  function ustawKat(k) {
    st = { dla: '', ok: '', met: '', max: '', kat: k };
    $$('#filtry .chipy').forEach(function (g) { $$('.chip', g).forEach(function (c, i) { c.classList.toggle('on', i === 0); }); });
    rysuj();
    $('#doradca').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  $$('[data-kat]').forEach(function (b) { b.addEventListener('click', function () { ustawKat(b.dataset.kat); }); });

  function pasuje(p) {
    if (st.kat && p.kat !== st.kat) return false;
    if (st.dla && p.dla !== st.dla) return false;
    if (st.ok && p.ok.indexOf(st.ok) < 0) return false;
    if (st.met && p.met !== st.met) return false;
    if (st.max && p.c > +st.max) return false;
    return true;
  }

  var wyn = $('#wyniki');
  function rysuj() {
    var w = P.filter(pasuje);
    var n = w.length;
    $('#ileWyn').textContent = n === 1 ? '1 model' : n + (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? ' modele' : ' modeli');
    var kr = $('#katReset');
    if (st.kat) { kr.hidden = false; kr.textContent = KAT[st.kat] + '  ×'; } else kr.hidden = true;
    if (!n) {
      wyn.innerHTML = '<div class="brak">Nie mamy tu modelu dla tak wąskich kryteriów.<br>W salonie wybór jest dużo większy niż w tej próbce.<br><button class="btn btn-ob" id="wyczysc">Wyczyść filtry</button></div>';
      $('#wyczysc').addEventListener('click', function () { ustawKat(''); });
      return;
    }
    wyn.innerHTML = w.map(function (p) {
      var on = naLiscie(p.id);
      var rabat = p.s ? Math.round((1 - p.c / p.s) * 100) : 0;
      return '<article class="prod">' +
        '<div class="prod-img"><img src="img/p/' + p.id + '.webp" alt="' + esc(p.t + ' - ' + p.d) + '" loading="lazy" width="512" height="512">' +
        '</div>' +
        '<div class="prod-b"><h3>' + esc(p.t) + '</h3><p class="prod-d">' + esc(p.d) + '</p>' +
        '<p class="prod-cena"><b>' + zl(p.c) + '</b>' + (p.s ? '<s>' + zl(p.s) + '</s>' + (rabat ? '<span class="prod-rab">-' + rabat + '%</span>' : '') : '') + '</p>' +
        '<div class="prod-akc"><button class="odloz' + (on ? ' on' : '') + '" data-id="' + p.id + '" aria-pressed="' + on + '">' + (on ? 'Na liście ✓' : 'Odłóż<span class="nm"> w salonie</span>') + '</button>' +
        '<a class="prod-sklep" href="' + p.u + '" target="_blank" rel="noopener" aria-label="Zobacz w sklepie online" title="Zobacz w sklepie online"><svg><use href="#i-strz"/></svg></a></div>' +
        '</div></article>';
    }).join('');
  }
  wyn.addEventListener('click', function (e) {
    var b = e.target.closest('.odloz'); if (!b) return;
    var id = b.dataset.id;
    if (naLiscie(id)) lista = lista.filter(function (x) { return x.id !== id; });
    else lista.push({ id: id, roz: '' });
    var on = naLiscie(id);
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.innerHTML = on ? 'Na liście ✓' : 'Odłóż<span class="nm"> w salonie</span>';
    zapisz(); rysujListe();
  });

  /* ---------- bon ---------- */
  $('#bonKarty').addEventListener('click', function (e) {
    var b = e.target.closest('.bon-k'); if (!b) return;
    var n = +b.dataset.n;
    var i = lista.findIndex(function (x) { return x.bon === n; });
    if (i >= 0) lista.splice(i, 1); else lista.push({ bon: n });
    zapisz(); rysujListe();
  });

  /* ---------- dni wizyty (godziny salonu) ---------- */
  var DNI = ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'];
  function godz(d) { var w = d.getDay(); return w === 0 ? null : (w === 6 ? [9, 14] : [9, 18]); }
  function dniWizyty() {
    var out = [], d = new Date(), teraz = d.getHours() + d.getMinutes() / 60;
    for (var i = 0; out.length < 4 && i < 10; i++) {
      var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      var g = godz(x); if (!g) continue;
      if (i === 0 && teraz > g[1] - 1) continue;
      var et = i === 0 ? 'dziś' : i === 1 ? 'jutro' : DNI[x.getDay()] + ' ' + ('0' + x.getDate()).slice(-2) + '.' + ('0' + (x.getMonth() + 1)).slice(-2);
      out.push(et + ' (' + g[0] + '-' + g[1] + ')');
    }
    out.push('jeszcze nie wiem');
    return out;
  }
  var dniBox = $('#dni');
  dniBox.innerHTML = dniWizyty().map(function (t, i) { return '<button class="chip' + (i === 0 ? ' on' : '') + '">' + t + '</button>'; }).join('');
  dzien = dniBox.firstChild ? dniBox.firstChild.textContent : '';
  dniBox.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', dniBox).forEach(function (c) { c.classList.toggle('on', c === b); });
    dzien = b.textContent; wiadomosc();
  });

  /* ---------- lista ---------- */
  var ROZ = []; for (var r = 5; r <= 32; r++) ROZ.push(r);
  function rysujListe() {
    var poz = $('#listaPoz'), n = lista.length;
    $('#liczLista').textContent = n; $('#liczMob').textContent = n;
    $('#listaPusta').hidden = n > 0; $('#listaDalej').hidden = n === 0;
    $$('.bon-k').forEach(function (b) { b.classList.toggle('on', lista.some(function (x) { return x.bon === +b.dataset.n; })); });
    var suma = 0, ring = false;
    poz.innerHTML = lista.map(function (x, i) {
      if (x.bon) { suma += x.bon; return '<li class="lp"><span class="lp-bon">' + x.bon + '</span><div><div class="lp-t">Prezent Jubilerski ' + zl(x.bon) + '</div><div class="lp-c">bon ważny 12 miesięcy</div></div><button class="lp-x" data-i="' + i + '" aria-label="Usuń">×</button></li>'; }
      var p = P.find(function (q) { return q.id === x.id; }); suma += p.c;
      var sel = '';
      if (pierscionek(p)) {
        ring = true;
        sel = '<select data-i="' + i + '" aria-label="Rozmiar pierścionka"><option value="">Rozmiar: dobierzemy w salonie</option>' +
          ROZ.map(function (r) { return '<option' + (String(r) === String(x.roz) ? ' selected' : '') + ' value="' + r + '">Rozmiar ' + r + '</option>'; }).join('') + '</select>';
      }
      return '<li class="lp"><img src="img/p/' + p.id + '.webp" alt=""><div><div class="lp-t">' + esc(p.t) + '</div><div class="lp-c">' + esc(p.d) + ' · ' + zl(p.c) + '</div>' + sel + '</div><button class="lp-x" data-i="' + i + '" aria-label="Usuń ' + esc(p.t) + '">×</button></li>';
    }).join('');
    $('#suma').textContent = zl(Math.round(suma * 100) / 100);
    $('#rozmiarBox').hidden = !ring;
    $$('.odloz').forEach(function (b) { var on = naLiscie(b.dataset.id); b.classList.toggle('on', on); b.innerHTML = on ? 'Na liście ✓' : 'Odłóż<span class="nm"> w salonie</span>'; });
    wiadomosc();
  }
  $('#listaPoz').addEventListener('click', function (e) {
    var b = e.target.closest('.lp-x'); if (!b) return;
    lista.splice(+b.dataset.i, 1); zapisz(); rysujListe();
  });
  $('#listaPoz').addEventListener('change', function (e) {
    if (e.target.tagName !== 'SELECT') return;
    lista[+e.target.dataset.i].roz = e.target.value; zapisz(); wiadomosc();
  });

  /* ---------- kalkulator rozmiaru (orientacyjny: rozmiar PL ≈ obwód w mm - 41) ---------- */
  var rSr = $('#rozSr'), rOb = $('#rozOb'), rW = $('#rozWyn');
  function przelicz(src) {
    var ob;
    if (src === 'sr') { var s = parseFloat(String(rSr.value).replace(',', '.')); rOb.value = ''; if (s >= 12 && s <= 25) ob = Math.PI * s; }
    else { var o = parseFloat(String(rOb.value).replace(',', '.')); rSr.value = ''; if (o >= 40 && o <= 80) ob = o; }
    if (!ob) { rW.textContent = 'Wpisz jeden z wymiarów (średnica 12-25 mm lub obwód 40-80 mm).'; return; }
    var roz = Math.round(ob - 41);
    roz = Math.max(5, Math.min(32, roz));
    rW.textContent = 'Orientacyjnie rozmiar ' + roz + ' (obwód ok. ' + ob.toFixed(1).replace('.', ',') + ' mm). W salonie sprawdzimy go miarką.';
    lista.forEach(function (x) { if (!x.bon && pierscionek(P.find(function (q) { return q.id === x.id; })) && !x.roz) x.roz = String(roz); });
    zapisz(); rysujListe();
  }
  rSr.addEventListener('input', function () { przelicz('sr'); });
  rOb.addEventListener('input', function () { przelicz('ob'); });

  /* ---------- wiadomość ---------- */
  function wiadomosc() {
    if (!lista.length) return;
    var t = 'Dzień dobry, chcę obejrzeć w salonie theONE:\n';
    lista.forEach(function (x, i) {
      if (x.bon) { t += (i + 1) + '. Prezent Jubilerski ' + zl(x.bon) + '\n'; return; }
      var p = P.find(function (q) { return q.id === x.id; });
      t += (i + 1) + '. ' + p.t + ' - ' + p.d + ', ' + zl(p.c) + (pierscionek(p) ? (x.roz ? ', rozmiar ' + x.roz : ', rozmiar do dobrania') : '') + '\n';
    });
    t += 'Planuję przyjść: ' + (dzien || 'jeszcze nie wiem') + '.\nCzy te modele są dostępne na miejscu?';
    $('#wiad').textContent = t;
    var u = encodeURIComponent(t);
    $('#wWa').href = 'https://wa.me/' + TEL + '?text=' + u;
    $('#wSms').href = 'sms:+' + TEL + '?&body=' + u;
    $('#wMail').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Rezerwacja do obejrzenia w salonie') + '&body=' + u;
  }
  $('#wWa').target = '_blank'; $('#wWa').rel = 'noopener';

  /* ---------- otwarte teraz ---------- */
  (function () {
    var d = new Date(), w = d.getDay(), h = d.getHours() + d.getMinutes() / 60, g = godz(d), el = $('#teraz');
    $$('.godz tr').forEach(function (tr) { var k = +tr.dataset.d; if ((k === 1 && w >= 1 && w <= 5) || (k === w && k !== 1)) tr.classList.add('dzis'); });
    if (g && h >= g[0] && h < g[1]) { el.textContent = 'Teraz otwarte - zapraszamy do ' + g[1] + ':00'; el.style.setProperty('--kropka', '#7fb77e'); }
    else {
      var k = (g && h < g[0]) ? 0 : 1, x, gg;
      for (; k < 8; k++) { x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + k); gg = godz(x); if (gg) break; }
      var kiedy = k === 0 ? 'dziś' : k === 1 ? 'jutro' : 'w ' + ['niedzielę', 'poniedziałek', 'wtorek', 'środę', 'czwartek', 'piątek', 'sobotę'][x.getDay()];
      el.textContent = 'Teraz zamknięte - otwieramy ' + kiedy + ' o ' + gg[0] + ':00';
    }
  })();

  rysuj(); rysujListe();
})();
