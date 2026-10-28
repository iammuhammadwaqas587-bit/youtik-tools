import React, { useEffect, useRef } from 'react';

export type AdSlotPosition = 'top' | 'middle' | 'bottom' | 'sidebar';

interface AdSlotProps {
  position: AdSlotPosition;
  className?: string;
  slotId?: string;
  adClient?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
    ADSENSE_CLIENT_ID?: string;
  }
}

export const AdSlot: React.FC<AdSlotProps> = ({
  position,
  className = '',
  slotId = 'default',
  adClient,
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  const effectiveClient = 
    adClient || 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_CLIENT_ID) || 
    (typeof window !== 'undefined' ? window.ADSENSE_CLIENT_ID : undefined);

  useEffect(() => {
    if (effectiveClient && !isPushed.current && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      } catch (e) {
        // Suppress AdSense duplicate push errors
      }
    }
  }, [effectiveClient]);

  // Dimensions based on Google AdSense IAB standard specifications
  const getContainerStyle = () => {
    switch (position) {
      case 'top':
        return 'min-h-[90px] max-w-4xl mx-auto';
      case 'middle':
        return 'min-h-[140px] max-w-3xl mx-auto';
      case 'bottom':
        return 'min-h-[100px] max-w-4xl mx-auto';
      case 'sidebar':
        return 'min-h-[250px] w-full max-w-[300px] mx-auto';
    }
  };

  return (
    <aside 
      aria-label="Advertisement"
      className={`my-6 w-full ${getContainerStyle()} ${className}`}
    >
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-4 flex flex-col items-center justify-center text-center transition-all overflow-hidden">
        {/* Google AdSense Policy Mandated Label */}
        <div className="flex items-center gap-1.5 mb-2 select-none">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
            Advertisement
          </span>
        </div>

        {/* Real AdSense Unit or Placeholder */}
        {effectiveClient ? (
          <div className="w-full flex items-center justify-center overflow-hidden">
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ display: 'block', width: '100%' }}
              data-ad-client={effectiveClient}
              data-ad-slot={slotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className="w-full flex items-center justify-center py-4 px-2 text-slate-400 text-xs">
            <div className="text-center space-y-1">
              <span className="inline-block text-[11px] text-slate-400 font-medium">
                Google AdSense Space
              </span>
              <p className="text-[10px] text-slate-400/80 max-w-xs mx-auto">
                Clean, non-intrusive ad placement complying with Google Better Ads Standards.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
