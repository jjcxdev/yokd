"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerSW = async () => {
      try {
        if (!("serviceWorker" in navigator)) {
          console.log("Service workers not supported");
          return;
        }

        const registration =
          await navigator.serviceWorker.register("/service-worker.js");
        console.log("ServiceWorker registered");

        // Wait for the service worker to be ready
        if (registration.active) {
          console.log("ServiceWorker is already active");
        } else {
          registration.addEventListener("activate", () => {
            console.log("ServiceWorker activated");
          });
        }
      } catch (error) {
        console.error("ServiceWorker registration failed:", error);
      }
    };

    // Register immediately instead of waiting for load event
    registerSW();
  }, []);

  return null;
}
