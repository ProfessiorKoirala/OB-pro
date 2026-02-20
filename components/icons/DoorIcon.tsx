import React from 'react';

const DoorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* The static frame on top */}
    <path d="M2 1H20V23H2V1ZM4 3V21H18V3H4Z" fill="white"/>
    {/* The door panel that will rotate */}
    <g className="door-panel">
      <path d="M4 2H18V22H4V2Z" fill="#A0A0A0"/>
      <circle cx="15" cy="12" r="1" fill="#404040"/>
    </g>
  </svg>
);

export default DoorIcon;