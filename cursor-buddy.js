/* Cursor buddy: swaps the mouse pointer for a small icon on desktop.
   Beer on most pages, bánh mì on the food tour, a bike on the cycling tour,
   mountains on Mỹ Sơn / Bà Nà. Each icon changes look over links and buttons
   (half a beer turns into a full, foaming one). Touch screens are left alone. */
(function(){
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var INK = '#12132A';
  // each icon has a resting look and a "go on, click me" look for links and buttons
  var HANDLE = '<path d="M22 11h3.2a3.6 3.6 0 0 1 0 7.2H22" fill="none" stroke="'+INK+'" stroke-width="2.2"/>';
  var BIKE = '<circle cx="8" cy="21" r="6" fill="none" stroke="'+INK+'" stroke-width="2.2"/>' +
      '<circle cx="24" cy="21" r="6" fill="none" stroke="'+INK+'" stroke-width="2.2"/>' +
      '<path d="M8 21l5-9h8l3 9M13 12l4 9 4-9M11.5 9.5h4" fill="none" stroke="#3E8E8C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M20 9.5h3.5" stroke="'+INK+'" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="17" cy="21" r="1.6" fill="#E8A33D" stroke="'+INK+'" stroke-width="1"/>';
  var BANHMI = '<path d="M2.5 16c0-4.2 5.6-6.6 13.5-6.6S29.5 11.8 29.5 16s-5.6 6.6-13.5 6.6S2.5 20.2 2.5 16z" fill="#E3A24A" stroke="'+INK+'" stroke-width="1.8"/>' +
      '<g stroke="#B5762A" stroke-width="1.5" stroke-linecap="round"><path d="M9 12.2l2 2.4"/><path d="M14 11.4l2 2.6"/><path d="M19 11.4l2 2.6"/><path d="M24 12.4l1.6 2"/></g>';
  var HILLS = '<path d="M2 27L11 10l5.5 9 3.5-5.5L30 27z" fill="#3E8E8C" stroke="'+INK+'" stroke-width="1.8" stroke-linejoin="round"/>' +
      '<path d="M8.4 15l2.6-5 2.7 4.4-1.6 1.4-1.2-1.2-1.4 1.4z" fill="#F5EFE3" stroke="'+INK+'" stroke-width="1" stroke-linejoin="round"/>' +
      '<path d="M2 27l7-9 4 4 3-3 5 4 4-4 5 8z" fill="#5FA05A" stroke="'+INK+'" stroke-width="1.4" stroke-linejoin="round"/>';
  var ICONS = {
    beer: {
      // half a glass, waiting
      idle: HANDLE +
        '<rect x="7" y="9" width="15" height="19" rx="2.6" fill="#DDE6F0" fill-opacity=".55"/>' +
        '<path d="M7 18.5h15v6.9a2.6 2.6 0 0 1-2.6 2.6H9.6A2.6 2.6 0 0 1 7 25.4z" fill="#E8A33D"/>' +
        '<path d="M7.6 18.6h13.8" stroke="#FFF4D6" stroke-width="1.6" stroke-linecap="round"/>' +
        '<rect x="7" y="9" width="15" height="19" rx="2.6" fill="none" stroke="'+INK+'" stroke-width="1.8"/>' +
        '<line x1="10.5" y1="12" x2="10.5" y2="16" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>',
      // full to the brim, foam spilling over the sides
      hover: HANDLE +
        '<rect x="7" y="9" width="15" height="19" rx="2.6" fill="#E8A33D" stroke="'+INK+'" stroke-width="1.8"/>' +
        '<line x1="11" y1="15" x2="11" y2="25" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>' +
        '<g fill="#FFF4D6" opacity=".9"><circle cx="15" cy="23" r=".9"/><circle cx="18" cy="19" r=".7"/><circle cx="16.5" cy="15.5" r=".6"/></g>' +
        '<path d="M3.4 9.8c-.9-3.6 2.4-5.8 4.9-4.6.9-3.4 5.8-4.2 7.4-1.2 2.6-1.8 6.8-.4 6.4 3 2.6.4 3 3.6 1 4.5-1.8.8-2.9-.4-2.9-.4v4.4c0 1.6-2.3 1.6-2.3 0v-3.2c-.6.2-1.3.3-2 .3v6.2c0 1.6-2.3 1.6-2.3 0v-6.1c-1.4 0-2.7-.2-3.9-.6v2.8c0 1.5-2.2 1.5-2.2 0v-3.6c-.8-.4-1.5-.9-2.1-1.5z" fill="#fff" stroke="'+INK+'" stroke-width="1.3" stroke-linejoin="round"/>' +
        '<g fill="#fff" stroke="'+INK+'" stroke-width=".9"><circle cx="27.5" cy="4" r="1.3"/><circle cx="2.6" cy="4.2" r="1"/></g>'
    },
    banhmi: {
      idle: '<g transform="rotate(-28 16 16)">' + BANHMI +
        '<path d="M5 17.6c3 2 19 2 22 0" fill="none" stroke="#5FA05A" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M5.6 17.2c3 1.2 17.8 1.2 20.8 0" fill="none" stroke="#D9603B" stroke-width="1.4" stroke-linecap="round"/></g>',
      // hot and loaded: overflowing herbs, chilli, steam
      hover: '<g transform="rotate(-28 16 16)">' + BANHMI +
        '<path d="M4 17.8c3 3 21 3 24 0" fill="none" stroke="#5FA05A" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M5.4 17.2c3 1.6 18 1.6 21.2 0" fill="none" stroke="#D9603B" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M8 20.6l2.4 2.6M21 20.8l1.8 2.4" stroke="#C8262C" stroke-width="1.8" stroke-linecap="round"/></g>' +
        '<g fill="none" stroke="#B9BDCC" stroke-width="1.4" stroke-linecap="round" opacity=".9">' +
        '<path d="M12 6c-1.4-1.4 1.4-2.6 0-4"/><path d="M17 5c-1.4-1.4 1.4-2.6 0-4"/><path d="M22 7c-1.4-1.4 1.4-2.6 0-4"/></g>'
    },
    bike: {
      idle: BIKE,
      // off it goes: tilted forward with speed lines
      hover: '<g transform="rotate(-8 16 18)">' + BIKE + '</g>' +
        '<g stroke="#E8A33D" stroke-width="1.8" stroke-linecap="round"><path d="M0 13h5"/><path d="M-1 18h4"/><path d="M0 23h3"/></g>'
    },
    mountain: {
      idle: '<circle cx="23" cy="8" r="4" fill="#F6C46A" stroke="'+INK+'" stroke-width="1.4"/>' + HILLS,
      // summit reached: sun blazing, flag on the peak
      hover: '<g stroke="#F6C46A" stroke-width="1.6" stroke-linecap="round"><path d="M23 0.6v1.8M23 13.6v1.8M15.6 8h1.8M28.6 8h1.8M17.8 2.8l1.2 1.2M27 12l1.2 1.2M28.2 2.8L27 4"/></g>' +
        '<circle cx="23" cy="8" r="4.4" fill="#F6C46A" stroke="'+INK+'" stroke-width="1.4"/>' + HILLS +
        '<path d="M11 10V2" stroke="'+INK+'" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M11 2.2l6 1.8-6 1.8z" fill="#C8262C" stroke="'+INK+'" stroke-width="1" stroke-linejoin="round"/>'
    }
  };

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var kind = 'beer';
  if (/food/.test(page)) kind = 'banhmi';
  else if (/countryside/.test(page)) kind = 'bike';
  else if (/myson|bana/.test(page)) kind = 'mountain';

  // the icon replaces the mouse pointer itself; hotspot sits on the icon's upper-left
  function cursor(size, state){
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="' + size + '" height="' + size + '">' + ICONS[kind][state] + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") ' + Math.round(size * 0.2) + ' ' + Math.round(size * 0.2);
  }
  var css = document.createElement('style');
  css.textContent =
    'html, body, body * { cursor: ' + cursor(32, 'idle') + ', auto !important; }' +
    // over anything clickable the icon grows and switches to its "ready" look (a full, foaming beer on most pages)
    'a, a *, button, button *, [role="button"], label, summary, .gallery-tile, .gallery-tile *, .dish-arrow { cursor: ' + cursor(40, 'hover') + ', pointer !important; }' +
    // keep the normal text bar where people type
    'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, select { cursor: auto !important; }';
  document.head.appendChild(css);
})();
