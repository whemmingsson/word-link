// Checking for Service Worker availability
if ("serviceWorker" in navigator) {
  console.info("Service Worker available!");

  // Check if running as standalone PWA (required for full SW support on iOS)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (!isStandalone && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    console.warn(
      "Service Worker: For full offline support on iOS, please add this app to your Home Screen"
    );
  }

  //   Register the Service Worker
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.info("Service Worker: Registered", registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => console.error("Service Worker Error:", error));
  });
} else {
  console.warn("Service Worker not supported in this browser");
}
