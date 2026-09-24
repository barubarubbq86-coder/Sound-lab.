'use strict';
const PREFIX='itchan-sound-lab:'+self.registration.scope+':';
const CACHE=PREFIX+'v4';
const ASSETS=['./','./index.html','./app.js','./style.css','./pwa.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const URLS=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
// A waiting update takes over when the old app's windows have closed.
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||!URLS.has(event.request.url))return;
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(event.request))||fetch(event.request)));
});
