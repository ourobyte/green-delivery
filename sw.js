const CACHE_NAME = "delivery-gm-v1";

const FILES_TO_CACHE = [
    "index.html",
    "add.html",
    "update.html",
    "app.js",
    "style.css",
    "manifest.json"
];

/*
|--------------------------------------------------------------------------
| Install Service Worker
|--------------------------------------------------------------------------
*/
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );

});

/*
|--------------------------------------------------------------------------
| Activate
|--------------------------------------------------------------------------
*/
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );

    self.clients.claim();

});

/*
|--------------------------------------------------------------------------
| Fetch Strategy (Cache First)
|--------------------------------------------------------------------------
*/
self.addEventListener("fetch", event => {

    event.respondWith(
        caches.match(event.request)
            .then(response => {

                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(networkResponse => {

                        // cache file baru (optional)
                        if (
                            event.request.url.startsWith("http")
                        ) {

                            const cloned = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(
                                        event.request,
                                        cloned
                                    );
                                });

                        }

                        return networkResponse;

                    })
                    .catch(() => {

                        // fallback sederhana
                        if (event.request.destination === "document") {
                            return caches.match("index.html");
                        }

                    });

            })
    );

});
