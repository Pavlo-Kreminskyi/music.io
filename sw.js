/* =========================================================
   sw.js — Service Worker
   Потрібен для того, щоб сайт можна було встановити як застосунок
   (PWA) і щоб основні сторінки відкривались навіть за поганого
   інтернету. Аудіофайли навмисно НЕ кешуються тут, щоб не займати
   зайвий простір на телефоні користувача — вони просто стрімляться
   з мережі під час відтворення.

   ЯК ЦЕ ПРАЦЮЄ НА GITHUB PAGES:
   Файл має лежати в КОРЕНІ репозиторію (там само, де index.html),
   бо Service Worker може контролювати лише те, що знаходиться
   на його рівні вкладеності або глибше.
   ========================================================= */

const CACHE_NAME = 'pavlo-kreminskyi-v1';

/* Список файлів для базового офлайн-кешу.
   За потреби додайте сюди шляхи до images/logo.png тощо. */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* Стратегія: спочатку мережа, а якщо офлайн — беремо з кешу.
   Аудіо (/songs/) і зображення (/images/) навмисно пропускаємо повз
   кеш-логіку, щоб не дублювати великі файли. */
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('/songs/')) return; // не кешуємо аудіо

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});