// Jahr im Footer
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Rahmenlinie unter der Topbar beim Scrollen
const topbar = document.querySelector('.topbar');
const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Auf Touch-Geräten (kein Hover) werden Fotos farbig, sobald die Karte im Blick ist
if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
  }, { rootMargin: '-35% 0px -35% 0px' });
  document.querySelectorAll('.card').forEach(card => io.observe(card));
}
