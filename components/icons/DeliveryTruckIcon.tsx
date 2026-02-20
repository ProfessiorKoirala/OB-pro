import React from 'react';

const DeliveryTruckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#1F2937" strokeWidth="1.5">
            {/* Chassis */}
            <path d="M56,46 H8 V44 H56 Z" fill="#4A5568" stroke="none" />

            {/* Cargo */}
            <rect x="4" y="18" width="36" height="28" fill="#FBBF24" rx="2" /> 

            {/* Cab */}
            <path d="M38,46 V26 H52 L58,34 V46 Z" fill="#F97316" />

            {/* Window */}
            <path d="M40,29 L46,29 L50,34 L40,34 Z" fill="#87CEEB" strokeWidth="1" />
            
            {/* Wheels */}
            <circle cx="20" cy="50" r="7" fill="#2D3748" />
            <circle cx="48" cy="50" r="7" fill="#2D3748" />
            <circle cx="20" cy="50" r="3" fill="#A0AEC0" stroke="none" />
            <circle cx="48" cy="50" r="3" fill="#A0AEC0" stroke="none" />

             {/* Headlight */}
            <rect x="58" y="38" width="4" height="4" fill="#FBBF24" rx="1" />
        </g>
    </svg>
);

export default DeliveryTruckIcon;