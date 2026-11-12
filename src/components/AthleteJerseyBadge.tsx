import React from 'react';

interface AthleteJerseyBadgeProps {
  primary: string;
  secondary: string;
  outline?: string;
  textColor?: string;
  number?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
}

const SIZE_MAP = {
  xs: { w: 18, h: 18, fontSize: 7 },
  sm: { w: 24, h: 24, fontSize: 8.5 },
  md: { w: 30, h: 30, fontSize: 10 },
  lg: { w: 38, h: 38, fontSize: 12 }
};

/**
 * Classical Roman Harpastum Tunic / Jersey SVG icon displaying Primary,
 * Secondary (vertical clavus stripe), and high-contrast outline + optional athlete number.
 */
export const AthleteJerseyBadge: React.FC<AthleteJerseyBadgeProps> = ({
  primary,
  secondary,
  outline = '#fef08a',
  textColor = '#ffffff',
  number,
  size = 'sm',
  title
}) => {
  const dims = SIZE_MAP[size];
  const clipId = React.useId().replace(/:/g, '_');

  return (
    <svg
      width={dims.w}
      height={dims.h}
      viewBox="0 0 32 32"
      className="shrink-0 drop-shadow-xs inline-block align-middle"
      role="img"
      aria-label={title || 'Divisa Atleta Harpastum'}
    >
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={`tunic_${clipId}`}>
          <path d="M10 4 L13 6 Q16 8 19 6 L22 4 L29 9 L26 15 L23 13 L23 28 L9 28 L9 13 L6 15 L3 9 Z" />
        </clipPath>
      </defs>

      {/* Primary tunic body */}
      <g clipPath={`url(#tunic_${clipId})`}>
        <rect x="0" y="0" width="32" height="32" fill={primary} />
        {/* Vertical Roman Clavus Stripe (Secondary Color) */}
        <rect x="13" y="0" width="6" height="32" fill={secondary} opacity="0.92" />
        {/* Subtle shoulder/hem trim */}
        <rect x="0" y="25.5" width="32" height="2.5" fill={secondary} opacity="0.85" />
      </g>

      {/* Tunic outline */}
      <path
        d="M10 4 L13 6 Q16 8 19 6 L22 4 L29 9 L26 15 L23 13 L23 28 L9 28 L9 13 L6 15 L3 9 Z"
        fill="none"
        stroke={outline}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Optional Number Pill */}
      {number !== undefined && (
        <>
          <circle cx="16" cy="17" r="6" fill="rgba(0,0,0,0.58)" />
          <text
            x="16"
            y="19.6"
            textAnchor="middle"
            fill={textColor}
            fontSize={dims.fontSize}
            fontWeight="900"
            fontFamily="monospace"
          >
            {number}
          </text>
        </>
      )}
    </svg>
  );
};
