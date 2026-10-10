const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const galleryAnimations = new Map();
const filters = document.querySelectorAll('[data-filter]');
const bakes = [...document.querySelectorAll('.bake')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
  galleryAnimations.forEach(animation => animation.cancel());
  galleryAnimations.clear();
  let count = 0;
  bakes.forEach(bake => { bake.hidden = button.dataset.filter !== 'all' && bake.dataset.category !== button.dataset.filter; if (!bake.hidden) count++; });
  if (!reducedMotion.matches) {
    const gallery = document.querySelector('.gallery');
    const animation = gallery.animate([
      { opacity: 0.72, transform: 'translateY(5px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 240, easing: 'ease-out' });
    galleryAnimations.set(gallery, animation);
    animation.onfinish = () => galleryAnimations.delete(gallery);
  }
  document.querySelector('#gallery-status').textContent = `${count} bakes shown`;
}));
const dialog = document.querySelector('#photo-dialog');
let lastPhoto;
document.querySelectorAll('.photo').forEach(button => button.addEventListener('click', () => {
  const bake = button.closest('.bake'), image = button.querySelector('img');
  lastPhoto = button;
  document.querySelector('#large-photo').src = image.src;
  document.querySelector('#large-photo').alt = image.alt;
  document.querySelector('#photo-title').textContent = bake.querySelector('h3').innerText.replace(/\s+/g, ' ');
  document.querySelector('#photo-description').textContent = bake.querySelector('p').textContent;
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastPhoto?.focus(); });

// Scroll-linked movement stays visible and follows the visitor's own scroll speed.
const scrollScenes = [
  ...[...document.querySelectorAll('.intro, .section-heading, .contact')].map(scene => ({ scene, target: scene.querySelector('h2') || scene })),
  ...[...document.querySelectorAll('.bake .photo')].map(target => ({ scene: target.closest('.bake'), target })),
  { scene: document.querySelector('.intro-portrait'), target: document.querySelector('.intro-portrait img') }
];
scrollScenes.forEach(({ target }) => target.classList.add('scroll-motion'));
let scrollFrame = 0;
function updateScrollMotion() {
  scrollFrame = 0;
  const viewport = window.innerHeight;
  scrollScenes.forEach(({ scene, target }) => {
    const top = scene.getBoundingClientRect().top;
    const progress = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, (viewport - top) / (viewport * 0.72)));
    target.style.setProperty('--scroll-offset', `${(1 - progress) * 24}px`);
    target.style.setProperty('--scroll-scale', String(0.975 + progress * 0.025));
  });
}
function scheduleScrollMotion() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollMotion);
}
window.addEventListener('scroll', scheduleScrollMotion, { passive: true });
window.addEventListener('resize', scheduleScrollMotion);
filters.forEach(button => button.addEventListener('click', scheduleScrollMotion));
window.addEventListener('load', scheduleScrollMotion);
updateScrollMotion();
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    document.getAnimations().forEach(animation => animation.cancel());
    galleryAnimations.clear();
  }
  scheduleScrollMotion();
});

// Pause other clips when a visitor starts a video.
const videos = [...document.querySelectorAll('video')];
videos.forEach(video => video.addEventListener('play', () => videos.forEach(other => { if (other !== video) other.pause(); })));
