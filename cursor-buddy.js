/* Cursor buddy: swaps the mouse pointer for a small icon on desktop.
   Beer on most pages, bánh mì on the food tour, a bike on the cycling tour,
   mountains on Mỹ Sơn / Bà Nà. Touch screens are left alone. */
(function(){
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var INK = '#12132A';
  var ICONS = {
    beer:
      '<path d="M22 11h3.2a3.6 3.6 0 0 1 0 7.2H22" fill="none" stroke="'+INK+'" stroke-width="2.2"/>' +
      '<rect x="7" y="9" width="15" height="19" rx="2.6" fill="#E8A33D" stroke="'+INK+'" stroke-width="1.8"/>' +
      '<line x1="11" y1="14" x2="11" y2="24" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M5.6 10.4c-.4-3.2 2.4-4.6 4.4-3.6 1-2.6 5-3 6.2-.6 2-1.4 5.6-.4 5.2 2.4 2 .4 2 3 .4 3.4-1.6.4-2.4-.8-2.4-.8v2.6c0 1.4-2 1.4-2 0v-2.2c-3.6.6-7.8.4-11.8-1.2z" fill="#fff" stroke="'+INK+'" stroke-width="1.4" stroke-linejoin="round"/>',
    banhmi:
      '<g transform="rotate(-28 16 16)">' +
      '<path d="M2.5 16c0-4.2 5.6-6.6 13.5-6.6S29.5 11.8 29.5 16s-5.6 6.6-13.5 6.6S2.5 20.2 2.5 16z" fill="#E3A24A" stroke="'+INK+'" stroke-width="1.8"/>' +
      '<path d="M5 17.6c3 2 19 2 22 0" fill="none" stroke="#5FA05A" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M5.6 17.2c3 1.2 17.8 1.2 20.8 0" fill="none" stroke="#D9603B" stroke-width="1.4" stroke-linecap="round"/>' +
      '<g stroke="#B5762A" stroke-width="1.5" stroke-linecap="round"><path d="M9 12.2l2 2.4"/><path d="M14 11.4l2 2.6"/><path d="M19 11.4l2 2.6"/><path d="M24 12.4l1.6 2"/></g>' +
      '</g>',
    bike:
      '<circle cx="8" cy="21" r="6" fill="none" stroke="'+INK+'" stroke-width="2.2"/>' +
      '<circle cx="24" cy="21" r="6" fill="none" stroke="'+INK+'" stroke-width="2.2"/>' +
      '<path d="M8 21l5-9h8l3 9M13 12l4 9 4-9M11.5 9.5h4" fill="none" stroke="#3E8E8C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M20 9.5h3.5" stroke="'+INK+'" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="17" cy="21" r="1.6" fill="#E8A33D" stroke="'+INK+'" stroke-width="1"/>',
    // mountains with a snowy peak and the sun behind
    mountain:
      '<circle cx="23" cy="8" r="4" fill="#F6C46A" stroke="'+INK+'" stroke-width="1.4"/>' +
      '<path d="M2 27L11 10l5.5 9 3.5-5.5L30 27z" fill="#3E8E8C" stroke="'+INK+'" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M8.4 15l2.6-5 2.7 4.4-1.6 1.4-1.2-1.2-1.4 1.4z" fill="#F5EFE3" stroke="'+INK+'" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="M2 27l7-9 4 4 3-3 5 4 4-4 5 8z" fill="#5FA05A" stroke="'+INK+'" stroke-width="1.4" stroke-linejoin="round"/>'
  };

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var kind = 'beer';
  if (/food/.test(page)) kind = 'banhmi';
  else if (/countryside/.test(page)) kind = 'bike';
  else if (/myson|bana/.test(page)) kind = 'mountain';

  // the icon replaces the mouse pointer itself; hotspot sits on the icon's upper-left
  function cursor(size){
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="' + size + '" height="' + size + '">' + ICONS[kind] + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") ' + Math.round(size * 0.2) + ' ' + Math.round(size * 0.2);
  }
  var css = document.createElement('style');
  css.textContent =
    'html, body, body * { cursor: ' + cursor(32) + ', auto !important; }' +
    // links and buttons get a slightly bigger icon so it's clear they're clickable
    'a, a *, button, button *, [role="button"], label, summary, .gallery-tile, .gallery-tile * { cursor: ' + cursor(40) + ', pointer !important; }' +
    // keep the normal text bar where people type
    'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select { cursor: auto !important; }';
  document.head.appendChild(css);
})();
