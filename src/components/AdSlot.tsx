import React from 'react';

export type AdSlotPosition = 'top' | 'middle' | 'bottom' | 'sidebar';

interface AdSlotProps {
  position: AdSlotPosition;
  className?: string;
  slotId?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  position,
  className = '',
  slotId = 'default',
}) => {
  // Dimension classes based on standard IAB ad units
  const getContainerStyle = () => {
    switch (position) {
      case 'top':
        return 'min-h-[90px] max-w-4xl mx-auto';
      case 'middle':
        return 'min-h-[140px] max-w-3xl mx-auto';
      case 'bottom':
        return 'min-h-[100px] max-w-4xl mx-auto';
      case 'sidebar':
        return 'min-h-[250px] w-full max-w-[300px]';
    }
  };

  return (
    <aside 
      aria-label="Advertisement"
      className={`my-6 w-full ${getContainerStyle()} ${className}`}
    >
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3 flex flex-col items-center justify-center text-center transition-all">
        {/* AdSense Compliant Label */}
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-2 select-none">
          Advertisement
        </span>

        {/* Ad Container Box */}
        <div className="w-full flex items-center justify-center py-4 px-2 text-slate-400 text-xs">
          {/* 
            Google AdSense Code Placement Target:
            Uncomment & configure with your verified publisher ID when AdSense is approved:
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                 data-ad-slot={slotId}
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          */}
          <div className="text-center space-y-1">
            <span className="inline-block text-[11px] text-slate-400 font-medium">
              Sponsor Display Space
            </span>
            <p className="text-[10px] text-slate-300">
              Clean, non-intrusive AdSense-compliant container
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
