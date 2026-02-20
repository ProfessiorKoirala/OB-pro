import React from 'react';

const QrCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4v4H4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 6h4v4h-4v-4zm-6 0h4v4H4v-4zm0-6h4v4H4v-4zm6-6h4v4h-4V4zm10-4h4v4h-4V4zm-6 0h4v4h-4V4zm-4 6h4v4h-4v-4zm6 0h4v4h-4v-4zm-4 6h4v4h-4v-4zm6-6h4v4h-4v-4zm0 6h4v4h-4v-4z" />
  </svg>
);

export default QrCodeIcon;
