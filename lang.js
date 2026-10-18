/* Sprachumschalter DE / EN für die ganze Website.
   Englisch steht direkt im HTML, die deutsche Übersetzung im Attribut data-de
   (für Bedienelemente data-de-aria).
   Die gewählte Sprache wird
   1) im Browser gemerkt (localStorage) und
   2) zusätzlich an alle internen Links als ?lang=de angehängt,
   damit sie auf jeder Seite gilt – auch beim Zurückgehen und wenn der Browser
   localStorage blockiert (z. B. lokal geöffnete Dateien oder privater Modus). */
(function () {
  var KEY = 'werquet-lang';
  // Zweiter Speicher: window.name bleibt im selben Browser-Tab über alle Seiten erhalten,
  // auch wenn localStorage gesperrt ist (z. B. lokal geöffnete Dateien)
  function fromName() { var m = /(?:^|;)werquet-lang=(de|en)/.exec(window.name || ''); return m ? m[1] : null; }
  function load() {
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    return (v === 'de' || v === 'en') ? v : fromName();
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    try { window.name = (window.name || '').replace(/(?:^|;)werquet-lang=(de|en)/, '') + ';werquet-lang=' + v; } catch (e) {}
  }
  function fromUrl() { var m = location.search.match(/[?&]lang=(de|en)\b/); return m ? m[1] : null; }

  // Link um ?lang=de ergänzen (bzw. bei Englisch entfernen)
  function withLang(href, lang) {
    if (!href || /^(https?:|mailto:|tel:|javascript:|#)/i.test(href)) return href;
    var hash = '', i = href.indexOf('#');
    if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
    var q = '', j = href.indexOf('?');
    if (j >= 0) { q = href.slice(j + 1); href = href.slice(0, j); }
    var params = q.split('&').filter(function (p) { return p && !/^lang=/.test(p); });
    if (lang === 'de') params.push('lang=de');
    return href + (params.length ? '?' + params.join('&') : '') + hash;
  }

  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-de]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'de' ? el.dataset.de : el.dataset.en;
    });
    document.querySelectorAll('[data-de-aria]').forEach(function (el) {
      if (el.dataset.enAria === undefined) el.dataset.enAria = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'de' ? el.dataset.deAria : el.dataset.enAria);
    });
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    // interne Links und die eigene Adresse mit der Sprache versehen
    document.querySelectorAll('a[href]').forEach(function (a) {
      a.setAttribute('href', withLang(a.getAttribute('href'), lang));
    });
    try { history.replaceState(history.state, '', withLang(location.pathname + location.search + location.hash, lang)); } catch (e) {}
  }

  function current() { return load() || fromUrl() || 'en'; }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.lang-switch button');
    if (b) { save(b.dataset.lang); apply(b.dataset.lang); return; }
    var back = e.target.closest('[data-back]');
    if (back) { e.preventDefault(); location.href = withLang(back.getAttribute('data-back'), current()); }
  });

  // Beim Zurückgehen (Seite aus dem Browser-Cache) Sprache erneut anwenden
  window.addEventListener('pageshow', function (e) { if (e.persisted) apply(current()); });

  var start = current();
  save(start);
  apply(start);
})();
