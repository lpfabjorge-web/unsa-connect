"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div
      role="banner"
      className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto
                 bg-blue-600 text-white rounded-xl p-4 shadow-lg
                 flex items-start gap-3 z-50"
    >
      <div className="text-2xl flex-shrink-0">🎓</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Instala UNSA Connect</p>
        <p className="text-blue-100 text-xs mt-0.5">
          Recibe alertas de actividades directamente en tu celular
        </p>
        <button
          onClick={handleInstall}
          className="mt-2 bg-white text-blue-600 text-xs font-semibold
                     px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Instalar app
        </button>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar banner de instalación"
        className="flex-shrink-0 text-blue-200 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
