/* Sprachumschalter DE / EN für die ganze Website.
   Englisch steht direkt im HTML, die deutsche Übersetzung im Attribut data-de
   (für Bedienelemente data-de-aria). Die Wahl wird im Browser gemerkt. */
(function () {
  var KEY = 'werquet-lang';
  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

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
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.lang-switch button');
    if (!b) return;
    save(b.dataset.lang);
    apply(b.dataset.lang);
  });

  apply(load() === 'de' ? 'de' : 'en');
})();
