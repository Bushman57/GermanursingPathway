/** Register SW in production; reload once when an updated worker replaces an existing one. */
export function registerServiceWorker(baseUrl: string) {
  if (!("serviceWorker" in navigator)) return;

  const swUrl = `${baseUrl}sw.js`.replace(/\/+/g, "/");
  const hadControllerOnLoad = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadControllerOnLoad || refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      void registration.update();
    })
    .catch(() => undefined);
}
