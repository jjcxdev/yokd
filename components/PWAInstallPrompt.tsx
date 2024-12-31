import { useEffect,useState } from "react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 rounded-lg border border-[#7233F3] bg-[#0B0911] p-4 shadow-lg">
      <p className="mb-2 text-white">Install YOKD for a better experience!</p>
      <button
        onClick={handleInstallClick}
        className="rounded bg-[#7233F3] px-4 py-2 text-white hover:bg-opacity-80"
      >
        Install
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
