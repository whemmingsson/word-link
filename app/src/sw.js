// Checking for Service Worker availability
if ("serviceWorker" in navigator) {
  console.info("Service Worker available!");

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
