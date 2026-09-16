import React from 'react';

interface WolfIconProps {
  className?: string;
  size?: number;
  rounded?: boolean;
}

export const WolfIcon: React.FC<WolfIconProps> = ({ className = '', size = 36, rounded = true }) => {
  return (
    <div
      className={`inline-flex items-center justify-center bg-[#0d0f14] border border-[#252b36] shadow-md overflow-hidden ${
        rounded ? 'rounded-xl' : 'rounded-none'
      } ${className}`}
      style={{ width: size, height: size }}
      title="SHEILA GBA EMU"
    >
      <svg
        viewBox="0 0 512 512"
        width="82%"
        height="82%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(256, 260) scale(1.05)">
          {/* White Wolf Head Silhouette */}
          <path
            d="M 0 -150
               L 55 -85
               L 140 -120
               L 115 -20
               L 145 35
               L 100 55
               L 125 110
               L 75 115
               L 60 145
               L 25 130
               L 0 160
               L -25 130
               L -60 145
               L -75 115
               L -125 110
               L -100 55
               L -145 35
               L -115 -20
               L -140 -120
               L -55 -85
               Z"
            fill="#FFFFFF"
          />

          {/* Dark Facet Cutouts */}
          <polygon points="0,-95 18,-45 0,-15 -18,-45" fill="#0d0f14" />
          <polygon points="-32,-25 -65,-30 -42,-12 -28,-18" fill="#0d0f14" />
          <polygon points="-45,-42 -22,-32 -30,-26 -55,-35" fill="#FFFFFF" />
          <polygon points="32,-25 65,-30 42,-12 28,-18" fill="#0d0f14" />
          <polygon points="45,-42 22,-32 30,-26 55,-35" fill="#FFFFFF" />
          <polygon points="-24,0 -48,45 -22,35 -15,10" fill="#0d0f14" />
          <polygon points="24,0 48,45 22,35 15,10" fill="#0d0f14" />
          <polygon points="0,35 14,75 0,105 -14,75" fill="#0d0f14" />
          <polygon points="0,85 10,75 0,65 -10,75" fill="#FFFFFF" />
          <polygon points="-75,-85 -115,-95 -95,-40" fill="#0d0f14" />
          <polygon points="75,-85 115,-95 95,-40" fill="#0d0f14" />
        </g>
      </svg>
    </div>
  );
};
