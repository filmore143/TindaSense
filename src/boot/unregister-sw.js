import { boot } from "quasar/wrappers";

// Linisin ang anumang lumang service worker + cache mula sa dating PWA mode,
// para hindi na mag-serve ng lumang (naka-cache) na bersyon ng app.
export default boot(() => {
  if (typeof navigator === "undefined") return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {
        /* noop */
      });
  }

  if (typeof caches !== "undefined" && caches.keys) {
    caches
      .keys()
      .then((keys) => keys.forEach((k) => caches.delete(k)))
      .catch(() => {
        /* noop */
      });
  }
});
