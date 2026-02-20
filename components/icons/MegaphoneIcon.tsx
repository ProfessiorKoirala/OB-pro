import React from 'react';

const MegaphoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.378 1.21 18.755 1 19 1s.622.21 1.002.486F21.786 4.236 23 7.93 23 12c0 4.07-1.214 7.77-2.998 9.514-.78.78-1.202 1.026-1.502.832-1.125-.724-2.586-1.5-4.5-1.5h-1.832a4.001 4.001 0 01-1.564-7.317z" />
  </svg>
);

export default MegaphoneIcon;