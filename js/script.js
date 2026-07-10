const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* email links — address assembled at runtime to stay out of static HTML */
document.querySelectorAll('#email-badge, .email-link').forEach(el => {
  el.href = 'mailto:' + ['oindree', 'berkeley.edu'].join('@');
});

/* expandable publication abstracts */
document.querySelectorAll('.abstract-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrap = btn.closest('.card-abstract');
    const collapsed = wrap.classList.toggle('collapsed');
    btn.innerHTML = collapsed ? 'Read more &#43;' : 'Show less &#8722;';
  });
});

/* blooming flowers */
const bloomLayer = document.createElement('div');
bloomLayer.id = 'bloom-layer';
document.body.prepend(bloomLayer);

const FLOWER_COLORS = [
  { petal: '#f2a7bd', center: '#fbe2c8' },
  { petal: '#f7d9e2', center: '#f2a7bd' },
  { petal: '#fbe2c8', center: '#d97ea0' },
  { petal: '#d97ea0', center: '#fbe4e6' },
  { petal: '#bcd8b0', center: '#fbe2c8' }
];
/* even placement: shuffle every grid cell once, hand them out one at a time,
   and stop once they run out. Each cell is used exactly once per page visit,
   so flowers never overlap and — once placed — never get replaced or removed.
   Fewer columns on narrow screens so cells stay wider than a flower. */
const GRID_COLS = window.innerWidth < 640 ? 3 : 6;
const GRID_ROWS = 3;
const cellQueue = Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => i);
for (let i = cellQueue.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [cellQueue[i], cellQueue[j]] = [cellQueue[j], cellQueue[i]];
}

function spawnFlower() {
  if (cellQueue.length === 0) return; // grid is full — leave existing flowers alone
  const cell = cellQueue.pop();

  const { petal, center } = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
  const size = 26 + Math.random() * 44;
  const petalCount = Math.random() < 0.5 ? 5 : 6;
  const tilt = Math.floor(Math.random() * 60) - 30;

  let petals = '';
  for (let i = 0; i < petalCount; i++) {
    const angle = tilt + (i * 360) / petalCount;
    petals += `<g class="petal" transform="rotate(${angle})" style="--d:${(i * 0.1).toFixed(2)}s">
      <ellipse cx="0" cy="-13" rx="6.5" ry="13" fill="${petal}"/>
    </g>`;
  }

  const flower = document.createElement('div');
  flower.className = 'bloom-flower';
  flower.style.width = `${size}px`;
  flower.style.height = `${size}px`;
  const col = cell % GRID_COLS;
  const row = Math.floor(cell / GRID_COLS);
  const cellW = 100 / GRID_COLS;
  const cellH = 100 / GRID_ROWS;
  flower.style.left = `${col * cellW + cellW * (0.25 + Math.random() * 0.5)}%`;
  flower.style.top = `${row * cellH + cellH * (0.25 + Math.random() * 0.5)}%`;
  flower.style.opacity = (0.3 + Math.random() * 0.3).toFixed(2);
  flower.innerHTML = `<svg viewBox="-22 -22 44 44" xmlns="http://www.w3.org/2000/svg">
    ${petals}
    <circle class="bloom-center" style="--d:${(petalCount * 0.1 + 0.1).toFixed(2)}s" cx="0" cy="0" r="6" fill="${center}"/>
  </svg>`;

  bloomLayer.appendChild(flower);
}

for (let i = 0; i < 8; i++) {
  setTimeout(spawnFlower, 300 + i * 350);
}
const bloomInterval = setInterval(spawnFlower, 1800);
setTimeout(() => clearInterval(bloomInterval), 30000);

/* photo gallery */
const gallery = document.querySelector('.photo-gallery');
if (gallery) {
  const tiles = Array.from(gallery.querySelectorAll('.gallery-tile'));
  const chips = Array.from(document.querySelectorAll('.filter-chip'));

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.toggle('active', c === chip));
      const cat = chip.dataset.filter;
      tiles.forEach(tile => {
        const show = cat === 'all' || tile.dataset.category === cat;
        tile.classList.toggle('hidden', !show);
        if (show) {
          tile.classList.remove('show-anim');
          void tile.offsetWidth; /* restart animation */
          tile.classList.add('show-anim');
        }
      });
    });
  });

  /* lightbox */
  const lightbox = document.getElementById('lightbox');
  const lbMedia = lightbox.querySelector('.lightbox-media');
  const lbTitle = lightbox.querySelector('.lightbox-title');
  const lbDesc = lightbox.querySelector('.lightbox-desc');
  let currentTile = null;

  const visibleTiles = () => tiles.filter(t => !t.classList.contains('hidden'));

  function openLightbox(tile) {
    currentTile = tile;
    const media = tile.querySelector('.tile-media');
    const phClass = Array.from(media.classList).find(c => c.startsWith('ph-'));
    lbMedia.className = 'lightbox-media' + (phClass ? ` ${phClass}` : '');
    lbMedia.innerHTML = '';
    const img = media.querySelector('img');
    if (img) lbMedia.appendChild(img.cloneNode());
    lbTitle.textContent = tile.dataset.caption || '';
    lbDesc.textContent = tile.dataset.desc || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    currentTile = null;
    document.body.style.overflow = '';
  }

  function stepLightbox(dir) {
    const visible = visibleTiles();
    const i = visible.indexOf(currentTile);
    if (i === -1) return;
    openLightbox(visible[(i + dir + visible.length) % visible.length]);
  }

  tiles.forEach(tile => tile.addEventListener('click', () => openLightbox(tile)));
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });
}
