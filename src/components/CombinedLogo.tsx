import React from 'react';

interface CombinedLogoProps {
  className?: string;
  size?: number;
}

export const CombinedLogo: React.FC<CombinedLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="ytRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="100%" stopColor="#CC0000" />
        </linearGradient>
      </defs>

      {/* Modern Badge Container */}
      <rect width="64" height="64" rx="16" fill="url(#logoBgGrad)" stroke="#3f3f46" strokeWidth="1.5"/>

      {/* YouTube Pill with Play Symbol */}
      <g transform="translate(6, 12)">
        <rect x="0" y="4" width="28" height="32" rx="9" fill="url(#ytRedGrad)" />
        <polygon points="10,13 10,27 21,20" fill="#ffffff" />
      </g>

      {/* TikTok Musical Note with Signature Cyan/Magenta Offset */}
      <g transform="translate(24, 8)">
        {/* Cyan Shadow */}
        <path 
          d="M22 6.5 C20 4.5 17.5 3 15 2.5 L15 17.5 C14 16.5 12 16 10 16.5 C6.5 17.5 4.5 21 5.5 24.5 C6.5 28 10 30 13.5 29 C16.5 28 18.5 25.5 18.5 22.5 L18.5 10 C21 12 24 13 27 13 L27 8 C25 8 23.5 7.5 22 6.5 Z" 
          fill="#25F4EE" 
          opacity="0.95" 
          transform="translate(-1.5, -0.5)" 
        />

        {/* Magenta Shadow */}
        <path 
          d="M22 6.5 C20 4.5 17.5 3 15 2.5 L15 17.5 C14 16.5 12 16 10 16.5 C6.5 17.5 4.5 21 5.5 24.5 C6.5 28 10 30 13.5 29 C16.5 28 18.5 25.5 18.5 22.5 L18.5 10 C21 12 24 13 27 13 L27 8 C25 8 23.5 7.5 22 6.5 Z" 
          fill="#FE2C55" 
          opacity="0.95" 
          transform="translate(1.5, 0.5)" 
        />

        {/* Center White Note */}
        <path 
          d="M22 6.5 C20 4.5 17.5 3 15 2.5 L15 17.5 C14 16.5 12 16 10 16.5 C6.5 17.5 4.5 21 5.5 24.5 C6.5 28 10 30 13.5 29 C16.5 28 18.5 25.5 18.5 22.5 L18.5 10 C21 12 24 13 27 13 L27 8 C25 8 23.5 7.5 22 6.5 Z" 
          fill="#FFFFFF" 
        />
      </g>
    </svg>
  );
};
