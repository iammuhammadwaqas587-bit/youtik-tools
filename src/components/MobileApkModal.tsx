import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Sparkles, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Share2, 
  Cpu, 
  ChevronRight,
  ArrowDownToLine,
  HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { CombinedLogo } from './CombinedLogo';

interface MobileApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileApkModal: React.FC<MobileApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'apk_builder' | 'ios'>(() => {
    if (typeof window !== 'undefined' && /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
      return 'ios';
    }
    return 'android';
  });

  const [installStatus, setInstallStatus] = useState<'idle' | 'success' | 'dismissed'>('idle');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallStatus('success');
      } else {
        setInstallStatus('dismissed');
      }
    }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://youtiktools.com';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?url=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-zinc-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-inner">
              <CombinedLogo size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  YouTikTools Mobile App
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  Android & WebAPK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Install directly on your phone with zero app store delays
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-red-600 text-red-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Android (WebAPK)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apk_builder')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'apk_builder'
                ? 'border-red-600 text-red-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownToLine className="h-4 w-4" />
            <span>Standalone APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-red-600 text-red-600 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>iOS (iPhone/iPad)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-700 text-xs sm:text-sm">
          {/* TAB 1: Android Instant WebAPK Install */}
          {activeTab === 'android' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                  <h4>How Android WebAPK Works</h4>
                </div>
                <p className="text-xs leading-relaxed text-emerald-900/90">
                  Android and Google Chrome generate a genuine <strong>native APK package</strong> directly on your phone. It creates a dedicated launcher icon, runs in standalone fullscreen, and operates with native Android system performance.
                </p>
              </div>

              {/* Install trigger button */}
              {isInstalled || installStatus === 'success' ? (
                <div className="p-3.5 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 font-bold text-sm shadow-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>YouTikTools is installed on this device!</span>
                </div>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Install Native Android App Now (1-Tap)</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-800">
                    To install right now from your mobile browser:
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="h-6 w-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          Tap your browser menu (⋮)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          In Google Chrome, Edge, or Samsung Internet, tap the three dots in the top or bottom right corner.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="h-6 w-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          Select "Install App" or "Add to Home Screen"
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Chrome will ask: <em>Install YouTikTools app?</em>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="h-6 w-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          Tap "Install"
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Android creates a real APK file and places the YouTikTools icon on your home screen and app drawer!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="pt-2 border-t border-slate-100">
                <h5 className="font-bold text-slate-900 text-xs mb-2">Android App Advantages:</h5>
                <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>No browser URL bar</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Works offline for calculators</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>1080p & 4K muxing</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Lightweight (~1.5 MB)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Standalone APK via PWABuilder / TWA */}
          {activeTab === 'apk_builder' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/90 text-indigo-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-900">
                  <Cpu className="h-4 w-4 text-indigo-600 shrink-0" />
                  <h4>Generate Downloadable .APK File</h4>
                </div>
                <p className="text-xs leading-relaxed text-indigo-900/90">
                  If you want a raw standalone <code>.apk</code> file for sideloading, offline distribution, or uploading to the Google Play Store, you can package this PWA using PWABuilder (Microsoft's official open-source tool for Trusted Web Activities).
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-800">
                  How to generate your signed .APK file:
                </p>

                <ol className="space-y-2 text-xs list-decimal list-inside text-slate-600">
                  <li className="leading-relaxed">
                    Click the button below to open <strong>PWABuilder</strong> with this app's manifest pre-validated.
                  </li>
                  <li className="leading-relaxed">
                    Under <strong>"Android Package"</strong>, click <strong>"Store Package"</strong> or <strong>"Generate APK"</strong>.
                  </li>
                  <li className="leading-relaxed">
                    Download the signed <code>app-release.apk</code> directly to your computer or phone!
                  </li>
                </ol>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Build Standalone APK on PWABuilder</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">App Packaging Specs:</p>
                <p>• Package Type: Trusted Web Activity (TWA) / Bubblewrap</p>
                <p>• Target SDK: Android 14+ (API 34)</p>
                <p>• Target Architectures: Universal (arm64-v8a, armeabi-v7a, x86_64)</p>
              </div>
            </div>
          )}

          {/* TAB 3: iOS (iPhone/iPad) */}
          {activeTab === 'ios' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/90 text-blue-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <Share2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <h4>Install on iPhone & iPad</h4>
                </div>
                <p className="text-xs leading-relaxed text-blue-900/90">
                  Apple iOS doesn't use APK files, but Safari natively installs web apps onto your iOS home screen as standalone apps with smooth fullscreen display.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="h-6 w-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      Open in Safari & tap the Share button
                    </p>
                    <p className="text-[11px] text-slate-500">
                      The square icon with an arrow pointing up at the bottom of Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="h-6 w-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      Scroll down and tap "Add to Home Screen"
                    </p>
                    <p className="text-[11px] text-slate-500">
                      You will see the YouTikTools app icon and title.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="h-6 w-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      Tap "Add" in the top right corner
                    </p>
                    <p className="text-[11px] text-slate-500">
                      YouTikTools is added to your iOS home screen like any App Store app!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Free & Safe · No permissions needed</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
