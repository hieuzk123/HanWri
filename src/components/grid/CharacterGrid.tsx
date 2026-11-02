import React from 'react';

export interface CharacterGridProps {
  size?: number;
  gridType?: 'mizige' | 'tianzige' | 'none';
  strokeColor?: string;
  className?: string;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({
  size = 300,
  gridType = 'mizige',
  strokeColor = '#e74c3c33',
  className = '',
}) => {
  if (gridType === 'none') {
    return <div style={{ width: size, height: size }} className={`border border-gray-300 rounded ${className}`} />;
  }

  const half = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`border-2 border-chinese-red/40 rounded-lg bg-chinese-paper select-none ${className}`}
    >
      {/* Outer border */}
      <rect x="0" y="0" width={size} height={size} fill="none" stroke="#e74c3c" strokeWidth="2" opacity="0.4" />

      {/* Horizontal divider */}
      <line
        x1="0"
        y1={half}
        x2={size}
        y2={half}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray="6,4"
      />

      {/* Vertical divider */}
      <line
        x1={half}
        y1="0"
        x2={half}
        y2={size}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray="6,4"
      />

      {/* Diagonals for MiZiGe */}
      {gridType === 'mizige' && (
        <>
          <line
            className="diagonal"
            x1="0"
            y1="0"
            x2={size}
            y2={size}
            stroke={strokeColor}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <line
            className="diagonal"
            x1={size}
            y1="0"
            x2="0"
            y2={size}
            stroke={strokeColor}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </>
      )}
    </svg>
  );
};

export default CharacterGrid;
