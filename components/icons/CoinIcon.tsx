import React from 'react';

const CoinIcon: React.FC<{ className?: string, style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#DAA520" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="7" fill="none" stroke="#DAA520" strokeWidth="1"/>
    <path d="M12 8V16M10 10L14 10M10 14L14 14" stroke="#DAA520" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default CoinIcon;