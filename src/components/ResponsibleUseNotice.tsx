import React from 'react';
import { ShieldCheck, AlertCircle, Lock } from 'lucide-react';

interface ResponsibleUseNoticeProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

export const ResponsibleUseNotice: React.FC<ResponsibleUseNoticeProps> = ({
  className = '',
  variant = 'detailed',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/90 text-slate-700 text-xs ${className}`}>
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-900">Responsible Use: </span>
          Only download, convert, or process content that you own or have legal authorization to use. You are solely responsible for complying with applicable copyright laws and platform terms.
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 space-y-2.5 ${className}`}>
      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Responsible Use & Copyright Notice</span>
      </div>

      <p className="leading-relaxed">
        <strong>Authorized Processing Only:</strong> Please only download, transcode, or process videos and audio files that you own or have explicit legal authorization to use. This utility is intended for personal archiving, educational fair use, and authorized content creation workflows.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>No DRM bypass or paywall circumvention</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Independent tool · Not affiliated with YouTube or TikTok</span>
        </div>
      </div>
    </div>
  );
};
