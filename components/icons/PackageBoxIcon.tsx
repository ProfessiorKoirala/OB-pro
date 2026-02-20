import React from 'react';

const PackageBoxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 7.5L12 12.5L21.5 7.5M12 22.5L2.5 17.5V7.5L12 12.5V22.5ZM12 22.5L21.5 17.5V7.5L12 12.5V22.5Z" fill="#E4C59E" stroke="#A88B64" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 7.5L12 2.5L21.5 7.5" stroke="#A88B64" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="12.5" x2="12" y2="2.5" stroke="#A88B64" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default PackageBoxIcon;