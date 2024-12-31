"use client";

import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function PWAWrapper() {
  return (
    <>
      <ServiceWorkerRegistration />
      <PWAInstallPrompt />
    </>
  );
}
