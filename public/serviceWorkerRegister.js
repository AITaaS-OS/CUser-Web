"use strict";

//此处路径要和next.config.mjs的BasePath配置项一致
const serviceWorkerPath = "/cuser/serviceWorker.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("DOMContentLoaded", function () {
    navigator.serviceWorker.register(serviceWorkerPath).then(
      function (registration) {
        const sw = registration.installing || registration.waiting;
        if (sw) {
          sw.onstatechange = function () {
            if (sw.state === "installed") {
              window.location.reload();
            }
          };
        }
        registration.update().then((res) => {});
        window._SW_ENABLED = true;
      },
      function (err) {},
    );
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      window.location.reload(true);
    });
  });
}
