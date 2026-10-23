const CACHE_VERSION = 'lab-rules-v110';
const APP_SHELL = [
  './',
  './index.html',
  './rules.html',
  './quiz.html',
  './equipment.html',
  './gallery.html',
  './elements.html',
  './offline.html',
  './manifest.webmanifest',
  './styles.min.css?v=6.8',
  './elements.min.css?v=2.0',
  './site-pages.min.css?v=2.8',
  './asset/icon-system.min.js?v=1.0',
  './asset/icons.svg',
  './script.min.js?v=7.4',
  './site-runtime.min.js?v=1.9',
  './welcome-carousel.min.js?v=2.2',
  './site-navigation.min.js?v=1.1',
  './equipment-data.min.js?v=2.2',
  './gallery.min.js?v=3.5',
  './elements-data.min.js?v=2.2',
  './elements.min.js?v=2.6',
  './equipment-detail.min.js?v=2.1',
  './equipment-detail.min.css?v=2.0',
  './catalog-redesign.min.css?v=2.2',
  './catalog-detail-chrome.min.css?v=1.6',
  './catalog-detail-runtime.min.js?v=1.4',
  './asset/equipment/crucible-generic.svg',
  './Equipment/volumetric-flasks.html',
  './Equipment/reagent-bottles.html',
  './Equipment/petri-dishes.html',
  './Equipment/porcelain-crucible.html',
  './Equipment/glass-funnel-long-stem.html',
  './Equipment/serological-pipettes.html',
  './Equipment/watch-glass.html',
  './Equipment/glass-burette.html',
  './Equipment/separating-funnel.html',
  './Equipment/buchner-funnel.html',
  './Equipment/porcelain-mortar-pestle.html',
  './Equipment/screw-cap-test-tube.html',
  './Equipment/crucible-tongs.html',
  './Equipment/crystallizing-dish.html',
  './Equipment/vacuum-desiccator.html',
  './Equipment/coiled-distillate.html',
  './Equipment/pipette-stand.html',
  './Equipment/allihn-condenser.html',
  './Equipment/buffer-solutions.html',
  './Equipment/silica-gel.html',
  './Equipment/beakers.html',
  './Equipment/conical-centrifuge-tubes.html',
  './Equipment/measuring-cylinders.html',
  './Equipment/boiling-flasks.html',
  './Equipment/erlenmeyer-flasks.html',
  './Equipment/filter-flasks.html',
  './Equipment/wash-bottles.html',
  './Equipment/vials.html',
  './asset/gallery/catalog-equipment-hero.webp',
  './asset/gallery/catalog-equipment-hero-240.webp',
  './asset/gallery/lab-interior-mobile-fast.webp',
  './asset/gallery/lab-interior-800.webp',
  './asset/gallery/lab-entrance-320.webp',
  './asset/gallery/lab-entrance-480.webp',
  './asset/gallery/lab-entrance-mobile-fast.webp',
  './asset/gallery/lab-entrance-800.webp',
  './asset/gallery/lab-team-320.webp',
  './asset/gallery/lab-team-480.webp',
  './asset/gallery/lab-team-mobile-fast.webp',
  './asset/gallery/lab-team-800.webp',
  './chatbot/chatbot.min.css?v=5.10',
  './chatbot/chatbot.min.js?v=5.10',
  './chatbot/msds/msds-db.min.js?v=5.10',
  './asset/estedad-arabic-wght.woff2',
  './asset/inter-latin-wght.woff2',
  './Waste%20Lab.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_VERSION)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

function cacheResponse(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => caches.match(request)
          .then((cached) => cached || caches.match('./index.html'))
          .then((cached) => cached || caches.match('./offline.html')))
    );
    return;
  }

  // Versioned URLs (?v=) and /asset/ files never change in place: serve from cache, fetch once on a miss.
  // Bump CACHE_VERSION when an unversioned asset is replaced.
  if (requestUrl.searchParams.has('v') || requestUrl.pathname.includes('/asset/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheResponse(request, response)))
    );
    return;
  }

  // Everything else: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const update = fetch(request).then((response) => cacheResponse(request, response));
      if (!cached) return update;
      event.waitUntil(update.catch(() => undefined));
      return cached;
    })
  );
});
