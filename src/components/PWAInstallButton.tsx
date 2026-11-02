import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuideModal(true);
    }
  };

  if (variant === 'card') {
    return (
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-display font-extrabold text-lg shrink-0">
              SS
            </div>
            <div>
              <span className="text-[11px] font-mono-num uppercase tracking-wider text-blue-400 block">
                PRIVATE MERCHANT MOBILE APP
              </span>
              <h3 className="text-base sm:text-lg font-display font-extrabold text-white">
                ShittuStores Admin App (ShittuAdmin)
              </h3>
            </div>
          </div>

          {isInstalled && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Installed
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Install this private Admin Order Manager directly onto your phone home
          screen. When opened from your phone icon, it launches straight into
          your **ShittuStores Order Pipeline** in full-screen app mode and is
          never visible to public customers.
        </p>

        {!isInstalled ? (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-display font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isInstallable
                ? 'Install Admin App Now'
                : isIOS
                ? 'Install on iPhone / iPad'
                : 'Install Admin App to Phone'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-emerald-400 font-medium">
            You are currently running the installed ShittuAdmin standalone app.
          </p>
        )}

        {showGuideModal && (
          <InstallGuideModal
            isIOS={isIOS}
            onClose={() => setShowGuideModal(false)}
          />
        )}
      </div>
    );
  }

  // Compact header button for /admin top bar
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="px-3.5 py-2 text-xs font-display font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Install Admin App</span>
      </button>

      {showGuideModal && (
        <InstallGuideModal
          isIOS={isIOS}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </>
  );
};

const InstallGuideModal: React.FC<{ isIOS: boolean; onClose: () => void }> = ({
  isIOS,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 text-slate-900"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-display font-extrabold text-sm flex items-center justify-center">
              SS
            </div>
            <div>
              <h3 className="text-base font-display font-extrabold text-slate-900">
                Install ShittuAdmin on Your Phone
              </h3>
              <p className="text-xs text-slate-500">
                Private Order Management Mobile App
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-3 text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-900">
              To install on iPhone / iPad (Safari):
            </p>
            <div className="flex items-start gap-2.5">
              <Share className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                1. Tap the <strong>Share</strong> icon at the bottom of your
                Safari browser while on this <code>/admin</code> page.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <PlusSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                2. Scroll down and tap <strong>Add to Home Screen</strong>, then
                tap <strong>Add</strong>.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-900">
              To install on Android / Chrome:
            </p>
            <p>
              1. Open this private link (
              <code className="font-mono-num text-blue-700">/admin-app</code> or{' '}
              <code className="font-mono-num text-blue-700">/admin</code>) in
              Chrome on your phone.
            </p>
            <p>
              2. Tap the browser menu (<strong>⋮</strong>) at the top right and
              select <strong>Install app</strong> or{' '}
              <strong>Add to Home screen</strong>.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-display font-bold transition-colors cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
