"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const PWAInstallPrompt = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("App is already installed");
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      console.log("Captured beforeinstallprompt");
      // Don't prevent default
      const e = event as BeforeInstallPromptEvent;
      setPromptEvent(e);
      setIsInstallable(true);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if PWA is installable
    const checkInstallable = async () => {
      if ("getInstalledRelatedApps" in navigator) {
        try {
          // @ts-ignore - TypeScript doesn't know about this API yet
          const relatedApps = await navigator.getInstalledRelatedApps();
          const isInstalled = relatedApps.length > 0;
          console.log(
            "App installation status:",
            isInstalled ? "installed" : "not installed",
          );
          setIsInstallable(!isInstalled);
        } catch (error) {
          console.error("Error checking installation status:", error);
        }
      }
    };

    checkInstallable();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) {
      console.log("No installation prompt available");
      return;
    }

    try {
      await promptEvent.prompt();
      const result = await promptEvent.userChoice;
      console.log("Install prompt result:", result.outcome);

      if (result.outcome === "accepted") {
        setIsInstallable(false);
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
    }
  };

  if (!isInstallable || !promptEvent) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-lg border border-purple-600 bg-gray-900 p-4 shadow-lg">
      <p className="mb-2 text-white">Install YOKD for a better experience!</p>
      <button
        onClick={handleInstall}
        className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        Install
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
