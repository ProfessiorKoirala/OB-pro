import React from 'react';

const FingerprintIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c4.418 0 8 3.582 8 8a10.004 10.004 0 01-2.312 6.422m-3.308-1.043L14.448 10c0-1.34-.615-2.538-1.587-3.326M10 15c.686 0 1.332-.14 1.918-.394M14 15c1.105 0 2-.895 2-2V8.338A8.992 8.992 0 0012 5a8.992 8.992 0 00-4 3.338V13a3 3 0 003 3z" />
    </svg>
);

export default FingerprintIcon;
