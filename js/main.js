// BORIS LEHMAN — JAPAN TOUR 2026

// Header: transparent over the top photo, frosted glass once the page scrolls.
// On phones it stays hidden until the photos have scrolled away.
(function () {
  var header = document.querySelector('.site-header');
  var bands = document.querySelector('.bands');
  var phone = window.matchMedia('(max-width: 720px)');
  if (!header) return;

  function update() {
    header.classList.toggle('is-solid', window.scrollY > 24);
    var pastPhotos = bands ? bands.getBoundingClientRect().bottom < header.offsetHeight : true;
    header.classList.toggle('is-visible', !phone.matches || pastPhotos);
  }

  ['scroll', 'scrollend', 'resize', 'pageshow'].forEach(function (ev) {
    window.addEventListener(ev, update, { passive: true });
  });
  update();
})();

// Films: filter by venue number (buttons carry data-filter, films carry data-venues="1 2")
(function () {
  var buttons = document.querySelectorAll('.filters button');
  var films = document.querySelectorAll('.film');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var venue = btn.getAttribute('data-filter');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      films.forEach(function (film) {
        var venues = film.getAttribute('data-venues').split(' ');
        film.hidden = !(venue === 'all' || venues.indexOf(venue) !== -1);
      });
    });
  });
})();

// Paragraph endings: glue the last few characters together so the final line
// is never just 2–3 characters (e.g. 「つき。」「する。」). Works in every browser.
(function () {
  var MIN = 6;
  document.querySelectorAll('.film p, .about p, .lead, .letter p').forEach(function (p) {
    var last = p.lastChild;
    while (last && last.nodeType === 3 && !last.textContent.trim()) last = last.previousSibling;   // skip trailing whitespace
    if (!last || last.nodeType !== 3) return;          // ends with an element (already protected)
    var text = last.textContent.replace(/\s+$/, '');
    if (text.length <= MIN) return;
    // never let the glued part start with punctuation / small kana / ー (no line may begin with them)
    var cut = text.length - MIN;
    while (cut > 0 && /[、。，．」』）】ー…ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/.test(text.charAt(cut))) cut--;
    var tail = document.createElement('span');
    tail.className = 'nb';
    tail.textContent = text.slice(cut);
    last.textContent = text.slice(0, cut);
    p.insertBefore(tail, last.nextSibling);
  });
})();
