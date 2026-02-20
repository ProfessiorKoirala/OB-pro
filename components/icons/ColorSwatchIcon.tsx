import React from 'react';

const ColorSwatchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a4 4 0 014-4h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a4 4 0 01-4-4z" />
  </svg>
);

export default ColorSwatchIcon;