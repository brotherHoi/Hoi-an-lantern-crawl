/* Sticky booking bar: tour name + price + a Book button that stays at the
   bottom of the screen once the guest scrolls past the top of the page.
   Hidden while the booking section itself is on screen. */
(function(){
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var onHome = page === 'index.html' || page === '';
  var BOOK = onHome ? '#dat-tour' : 'index.html#dat-tour';
  var WA = 'https://wa.me/84862627133';

  var T = {
    crawl:  { en:'The Lantern Crawl', vi:'The Lantern Crawl', fr:'The Lantern Crawl' },
    food:   { en:'Hội An Food Tour', vi:'Food Tour Hội An', fr:'Food Tour à Hội An' },
    bike:   { en:'Countryside Cycling', vi:'Đạp xe làng quê', fr:'Vélo à la campagne' },
    trip:   { en:'Mỹ Sơn / Bà Nà Hills', vi:'Mỹ Sơn / Bà Nà', fr:'Mỹ Sơn / Bà Nà Hills' },
    guest:  { en:'/ guest', vi:'/ khách', fr:'/ pers.' },
    ask:    { en:'Price on request', vi:'Giá liên hệ', fr:'Prix sur demande' },
    from:   { en:'From', vi:'Từ', fr:'Dès' },
    book:   { en:'Book now', vi:'Đặt ngay', fr:'Réserver' },
    night:  { en:'Book the Night', vi:'Đặt tour đêm', fr:'Réserver la soirée' },
    msg:    { en:'Message us', vi:'Nhắn tin', fr:'Écrivez-nous' }
  };
  var cfg = { name:T.crawl, price:'600K', old:'700K', btn:T.night, href:BOOK, icon:'🏮' };
  if (/food/.test(page) && !/blog/.test(page))             cfg = { name:T.food, price:'800K', btn:T.book, href:BOOK, icon:'🥖' };
  else if (page === 'countryside.html')                    cfg = { name:T.bike, price:'800K', btn:T.book, href:BOOK, icon:'🚲' };
  else if (page === 'myson-bana.html')                     cfg = { name:T.trip, price:null, btn:T.msg, href:WA, icon:'🛕', ext:true };

  var css = document.createElement('style');
  css.textContent =
    '.book-bar{position:fixed;left:50%;bottom:14px;z-index:70;width:min(560px,calc(100% - 24px));' +
      'display:flex;align-items:center;gap:12px;padding:10px 10px 10px 14px;border-radius:18px;' +
      'background:rgba(26,27,51,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);' +
      'border:1px solid rgba(232,163,61,.35);box-shadow:0 10px 30px rgba(0,0,0,.35);color:#F5EFE3;' +
      'transform:translate(-50%,140%);transition:transform .35s ease;font-family:inherit;}' +
    '.book-bar.show{transform:translate(-50%,0);}' +
    '.book-bar-ico{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:22px;background:rgba(245,239,227,.08);}' +
    '.book-bar-txt{flex:1;min-width:0;line-height:1.25;}' +
    '.book-bar-name{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.book-bar-price{font-size:18px;font-weight:800;color:#F6C46A;}' +
    '.book-bar-price s{font-size:12px;font-weight:600;color:#F5EFE3;opacity:.5;margin-right:6px;}' +
    '.book-bar-price small{font-size:12px;font-weight:500;color:#F5EFE3;opacity:.7;margin-left:4px;}' +
    '.book-bar-btn{flex:none;padding:12px 18px;border-radius:12px;background:#E8A33D;color:#12132A;font-weight:800;font-size:15px;text-decoration:none;white-space:nowrap;}' +
    '.book-bar-btn:hover{background:#F6C46A;}' +
    'body.has-book-bar{padding-bottom:84px;}' +
    '@media (max-width:420px){.book-bar-ico{display:none}.book-bar-btn{padding:11px 14px;font-size:14px}}';
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.className = 'book-bar';
  bar.innerHTML =
    '<div class="book-bar-ico" aria-hidden="true">' + cfg.icon + '</div>' +
    '<div class="book-bar-txt"><div class="book-bar-name"></div><div class="book-bar-price"></div></div>' +
    '<a class="book-bar-btn" href="' + cfg.href + '"' + (cfg.ext ? ' target="_blank" rel="noopener"' : '') + '></a>';
  document.body.appendChild(bar);
  document.body.classList.add('has-book-bar');

  function render(){
    var l = document.documentElement.lang;
    if (l !== 'vi' && l !== 'fr') l = 'en';
    bar.querySelector('.book-bar-name').textContent = cfg.name[l];
    bar.querySelector('.book-bar-price').innerHTML = cfg.price
      ? (cfg.old ? '<s>' + cfg.old + '</s>' : '') + cfg.price + '<small>' + T.guest[l] + '</small>'
      : T.ask[l];
    bar.querySelector('.book-bar-btn').textContent = cfg.btn[l];
  }
  render();
  new MutationObserver(render).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });

  var booking = document.getElementById('dat-tour');
  var bookingOnScreen = false;
  if (booking && 'IntersectionObserver' in window){
    new IntersectionObserver(function(es){ bookingOnScreen = es[0].isIntersecting; update(); }).observe(booking);
  }
  function update(){
    bar.classList.toggle('show', window.scrollY > 320 && !bookingOnScreen);
  }
  window.addEventListener('scroll', update, { passive:true });
  update();
})();
