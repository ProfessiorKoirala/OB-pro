
import React from 'react';

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 2.056c4.502 0 8.288-2.224 9.98-5.612A12.02 12.02 0 0021 7.984a11.955 11.955 0 01-2.382-3.04z" />
  </svg>
);

export default ShieldIcon;
