const CACHE_NAME = "v1"
const urlsToCache = [ 'index.html', 'offline.html'];
const self = this;

// install service worker
self.addEventListener('install', (e) => {
    console.log('Service Worker installing.');
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then( ()=> self.skipWaiting())
    )

});

// activate the SW - just keep current cache
self.addEventListener('activate', (e) => {
    console.log('Service Worker activating.');

    const cacheWhiteList = [];
    cacheWhiteList.push(CACHE_NAME);

    e.waitUntil(
        clients.claim().then(() => {
            caches.keys().then((cacheNames) => Promise.all(
                cacheNames.map((cacheName) => {
                    if(!cacheWhiteList.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            ))

        })
    )
});

// listen for requests
self.addEventListener('fetch', (e) => {
    console.log('Fetching:', e.request.url);

    if (e.request.method !== 'GET') return;
    if (e.request.url.startsWith('chrome-extension://')) {
        return;
    }

    e.respondWith(
        caches.match(e.request)
            .then((response) => {
                return response || fetch(e.request).catch(() => caches.match('offline.html'))
            })
    )

});
