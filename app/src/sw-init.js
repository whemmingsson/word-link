// Checking for Service Worker availability
if ("serviceWorker" in navigator) {
  console.info("[service worker init] Service Worker available!");

  // Only register service worker in production or development-sw mode
  const isDev = import.meta.env.DEV;
  const isDevSW = import.meta.env.MODE === "development-sw";
  const shouldRegisterSW = !isDev || isDevSW;

  if (!shouldRegisterSW) {
    console.info(
      "[service worker init] Disabled in development mode. Use 'pnpm dev:sw' to enable."
    );
  } else {
    // Check if running as standalone PWA (required for full SW support on iOS)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (!isStandalone && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      console.warn(
        "[service worker init] For full offline support on iOS, please add this app to your Home Screen"
      );
    }

    //   Register the Service Worker
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((registration) => {
          console.info(
            "[service worker init] Service Worker: Registered",
            registration
          );
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => console.error("[service worker init] error:", error));
    });
  }
} else {
  console.warn(
    "[service worker init] Service Worker not supported in this browser"
  );
}
