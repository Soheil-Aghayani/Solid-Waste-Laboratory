const CACHE_VERSION = 'lab-rules-v102';
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
  './styles.min.css?v=6.5',
  './elements.min.css?v=2.0',
  './site-pages.min.css?v=2.8',
  './asset/icon-system.min.js?v=1.0',
  './asset/icons.svg',
  './script.min.js?v=7.4',
  './site-runtime.min.js?v=1.7',
  './welcome-carousel.min.js?v=2.2',
  './site-navigation.min.js?v=1.1',
  './equipment-data.min.js?v=2.2',
  './gallery.min.js?v=3.3',
  './elements-data.min.js?v=2.2',
  './elements.min.js?v=2.6',
  './data/elements.json',
  './data/chemical-records.json',
  './data/chemical-index.json',
  './data/catalog-index.json',
  './equipment-detail.min.js?v=2.1',
  './equipment-detail.min.css?v=2.0',
  './catalog-redesign.min.css?v=2.0',
  './catalog-detail-chrome.min.css?v=1.6',
  './catalog-detail-runtime.min.js?v=1.2',
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
  './asset/equipment/beakers-multiple-volumes.webp',
  './asset/equipment/beaker-low-form.webp',
  './asset/equipment/volumetric-flasks-multiple-volumes.webp',
  './asset/equipment/volumetric-flask-5ml.webp',
  './asset/equipment/measuring-cylinders-multiple-volumes.webp',
  './asset/equipment/conical-centrifuge-tube-15ml.webp',
  './asset/equipment/conical-centrifuge-tube-50ml.webp',
  './asset/equipment/measuring-cylinder-5ml.webp',
  './asset/equipment/measuring-cylinder-10ml.webp',
  './asset/equipment/measuring-cylinder-50ml.webp',
  './asset/equipment/measuring-cylinder-100ml.webp',
  './asset/equipment/measuring-cylinder-250ml.webp',
  './asset/equipment/measuring-cylinder-500ml.webp',
  './asset/equipment/measuring-cylinder-1000ml.webp',
  './asset/equipment/beaker-low-form-cutout.webp',
  './asset/equipment/measuring-cylinders-multiple-volumes-cutout.webp',
  './asset/equipment/measuring-cylinder-10ml-cutout.webp',
  './asset/equipment/measuring-cylinder-50ml-cutout.webp',
  './asset/equipment/measuring-cylinder-100ml-cutout.webp',
  './asset/equipment/measuring-cylinder-250ml-cutout.webp',
  './asset/equipment/measuring-cylinder-500ml-cutout.webp',
  './asset/equipment/measuring-cylinder-5ml-cutout.webp',
  './asset/equipment/measuring-cylinder-1000ml-cutout.webp',
  './asset/equipment/boiling-flask-round-joint.webp',
  './asset/equipment/boiling-flask-flat-bottom.webp',
  './asset/equipment/boiling-flask-round-bottom.webp',
  './asset/equipment/erlenmeyer-flask-joint.webp',
  './asset/equipment/erlenmeyer-flask-wide-mouth.webp',
  './asset/equipment/erlenmeyer-flask-screw-cap.webp',
  './asset/equipment/erlenmeyer-flask-narrow-mouth.webp',
  './asset/equipment/filter-flask.webp',
  './asset/equipment/wash-bottle.webp',
  './asset/equipment/vial.webp',
  './asset/equipment/porcelain-crucible-medium.webp',
  './asset/equipment/fused-quartz-crucible.webp',
  './asset/equipment/alumina-crucible.webp',
  './asset/equipment/nickel-crucible.webp',
  './asset/equipment/nickel-chromium-crucible.webp',
  './asset/equipment/zirconium-crucible.webp',
  './asset/equipment/detail-360/allihn-condenser.webp',
  './asset/equipment/detail-360/beaker-low-form-cutout.webp',
  './asset/equipment/detail-360/boiling-flask-round-joint.webp',
  './asset/equipment/detail-360/buchner-funnel.webp',
  './asset/equipment/detail-360/buffer-ph4.webp',
  './asset/equipment/detail-360/coiled-distillate.webp',
  './asset/equipment/detail-360/conical-centrifuge-tube-15ml.webp',
  './asset/equipment/detail-360/crucible-tongs.webp',
  './asset/equipment/detail-360/crystallizing-dish.webp',
  './asset/equipment/detail-360/erlenmeyer-flask-narrow-mouth.webp',
  './asset/equipment/detail-360/filter-flask.webp',
  './asset/equipment/detail-360/glass-burette.webp',
  './asset/equipment/detail-360/glass-funnel-long-stem.webp',
  './asset/equipment/detail-360/measuring-cylinder-5ml-cutout.webp',
  './asset/equipment/detail-360/petri-dishes.webp',
  './asset/equipment/detail-360/pipette-stand.webp',
  './asset/equipment/detail-360/porcelain-crucible-medium.webp',
  './asset/equipment/detail-360/porcelain-mortar-pestle.webp',
  './asset/equipment/detail-360/reagent-bottles.webp',
  './asset/equipment/detail-360/screw-cap-test-tube.webp',
  './asset/equipment/detail-360/separating-funnel.webp',
  './asset/equipment/detail-360/serological-pipettes.webp',
  './asset/equipment/detail-360/silica-gel-blue-dry.webp',
  './asset/equipment/detail-360/vacuum-desiccator.webp',
  './asset/equipment/detail-360/vial.webp',
  './asset/equipment/detail-360/volumetric-flask-5ml.webp',
  './asset/equipment/detail-360/wash-bottle.webp',
  './asset/equipment/detail-360/watch-glass.webp',
  './asset/equipment/detail-600/allihn-condenser.webp',
  './asset/equipment/detail-600/beaker-low-form-cutout.webp',
  './asset/equipment/detail-600/boiling-flask-round-joint.webp',
  './asset/equipment/detail-600/buchner-funnel.webp',
  './asset/equipment/detail-600/buffer-ph4.webp',
  './asset/equipment/detail-600/coiled-distillate.webp',
  './asset/equipment/detail-600/conical-centrifuge-tube-15ml.webp',
  './asset/equipment/detail-600/crucible-tongs.webp',
  './asset/equipment/detail-600/crystallizing-dish.webp',
  './asset/equipment/detail-600/erlenmeyer-flask-narrow-mouth.webp',
  './asset/equipment/detail-600/filter-flask.webp',
  './asset/equipment/detail-600/glass-burette.webp',
  './asset/equipment/detail-600/glass-funnel-long-stem.webp',
  './asset/equipment/detail-600/measuring-cylinder-5ml-cutout.webp',
  './asset/equipment/detail-600/petri-dishes.webp',
  './asset/equipment/detail-600/pipette-stand.webp',
  './asset/equipment/detail-600/porcelain-crucible-medium.webp',
  './asset/equipment/detail-600/porcelain-mortar-pestle.webp',
  './asset/equipment/detail-600/reagent-bottles.webp',
  './asset/equipment/detail-600/screw-cap-test-tube.webp',
  './asset/equipment/detail-600/separating-funnel.webp',
  './asset/equipment/detail-600/serological-pipettes.webp',
  './asset/equipment/detail-600/silica-gel-blue-dry.webp',
  './asset/equipment/detail-600/vacuum-desiccator.webp',
  './asset/equipment/detail-600/vial.webp',
  './asset/equipment/detail-600/volumetric-flask-5ml.webp',
  './asset/equipment/detail-600/wash-bottle.webp',
  './asset/equipment/detail-600/watch-glass.webp',
  './asset/equipment/detail-480/silica-gel-blue-dry.webp',
  './asset/equipment/detail-480/silica-gel-blue-wet.webp',
  './asset/equipment/detail-480/silica-gel-yellow-dry.webp',
  './asset/equipment/detail-480/silica-gel-yellow-wet.webp',
  './asset/equipment/catalog-240/allihn-condenser.webp',
  './asset/equipment/catalog-240/beaker-low-form-cutout.webp',
  './asset/equipment/catalog-240/beakers-multiple-volumes.webp',
  './asset/equipment/catalog-240/boiling-flask-round-joint.webp',
  './asset/equipment/catalog-240/buchner-funnel.webp',
  './asset/equipment/catalog-240/buffer-ph4.webp',
  './asset/equipment/catalog-240/coiled-distillate.webp',
  './asset/equipment/catalog-240/conical-centrifuge-tube-15ml.webp',
  './asset/equipment/catalog-240/crucible-tongs.webp',
  './asset/equipment/catalog-240/crystallizing-dish.webp',
  './asset/equipment/catalog-240/erlenmeyer-flask-narrow-mouth.webp',
  './asset/equipment/catalog-240/filter-flask.webp',
  './asset/equipment/catalog-240/glass-burette.webp',
  './asset/equipment/catalog-240/glass-funnel-long-stem.webp',
  './asset/equipment/catalog-240/measuring-cylinder-5ml-cutout.webp',
  './asset/equipment/catalog-240/measuring-cylinders-multiple-volumes-cutout.webp',
  './asset/equipment/catalog-240/petri-dishes.webp',
  './asset/equipment/catalog-240/pipette-stand.webp',
  './asset/equipment/catalog-240/porcelain-crucible-medium.webp',
  './asset/equipment/catalog-240/porcelain-mortar-pestle.webp',
  './asset/equipment/catalog-240/reagent-bottles.webp',
  './asset/equipment/catalog-240/screw-cap-test-tube.webp',
  './asset/equipment/catalog-240/separating-funnel.webp',
  './asset/equipment/catalog-240/serological-pipettes.webp',
  './asset/equipment/catalog-240/silica-gel-blue-dry.webp',
  './asset/equipment/catalog-240/vacuum-desiccator.webp',
  './asset/equipment/catalog-240/vial.webp',
  './asset/equipment/catalog-240/volumetric-flask-5ml.webp',
  './asset/equipment/catalog-240/volumetric-flasks-multiple-volumes.webp',
  './asset/equipment/catalog-240/wash-bottle.webp',
  './asset/equipment/catalog-240/watch-glass.webp',
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
  './chatbot/chatbot.min.css?v=5.7',
  './chatbot/chatbot.min.js?v=5.7',
  './chatbot/msds/msds-db.min.js?v=5.7',
  './asset/vazirmatn-arabic.woff2',
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

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(() => caches.match(request)
          .then((cached) => cached || caches.match('./index.html'))
          .then((cached) => cached || caches.match('./offline.html')))
    );
    return;
  }

  const networkUpdate = fetch(request).then((response) => {
    if (response.ok) {
      const responseCopy = response.clone();
      caches.open(CACHE_VERSION).then((cache) => cache.put(request, responseCopy));
    }
    return response;
  });

  event.waitUntil(networkUpdate.catch(() => undefined));
  event.respondWith(caches.match(request).then((cached) => cached || networkUpdate));
});
