const CACHE_NAME = "delivery-gm-v2";

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
| INSTALL
|--------------------------------------------------------------------------
*/
self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        }).then(() => self.skipWaiting())
    );

});

/*
|--------------------------------------------------------------------------
| ACTIVATE
|--------------------------------------------------------------------------
*/
self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            );
        })
    );

    self.clients.claim();
});

/*
|--------------------------------------------------------------------------
| FETCH (SAFE NETWORK-FIRST FOR API)
|--------------------------------------------------------------------------
*/
self.addEventListener("fetch", event => {

    const url = event.request.url;

    // ❗ Jangan cache API (ini penting)
    if (url.includes("/api/")) {

        event.respondWith(
            fetch(event.request)
                .then(res => res)
                .catch(() => {
                    return new Response(
                        JSON.stringify({ error: "offline" }),
                        {
                            status: 503,
                            headers: { "Content-Type": "application/json" }
                        }
                    );
                })
        );

        return;
    }

    // CACHE FIRST untuk static file
    event.respondWith(
        caches.match(event.request)
            .then(cached => {

                if (cached) return cached;

                return fetch(event.request)
                    .then(networkRes => {

                        // pastikan valid response
                        if (!networkRes || networkRes.status !== 200) {
                            return networkRes;
                        }

                        const clone = networkRes.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, clone);
                            });

                        return networkRes;

                    })
                    .catch(() => {

                        // fallback aman
                        if (event.request.destination === "document") {
                            return caches.match("index.html");
                        }

                        return new Response("Offline", {
                            status: 200,
                            headers: { "Content-Type": "text/plain" }
                        });

                    });

            })
    );

});
