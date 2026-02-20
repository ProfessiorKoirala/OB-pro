import React, { useState, useEffect } from 'react';

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => {
    const [mode, setMode] = useState<'glass' | 'eye'>('glass');
    const [pupilPos, setPupilPos] = useState<'center' | 'left' | 'right'>('center');
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            // Start eye sequence
            setMode('eye');
            
            // Look left
            const lookLeft = setTimeout(() => setPupilPos('left'), 600);
            
            // Look right
            const lookRight = setTimeout(() => setPupilPos('right'), 1400);
            
            // Center and blink
            const center = setTimeout(() => setPupilPos('center'), 2200);
            const blinkStart = setTimeout(() => setBlink(true), 2400);
            const blinkEnd = setTimeout(() => setBlink(false), 2600);
            
            // Return to glass
            const reset = setTimeout(() => {
                setMode('glass');
                setPupilPos('center');
            }, 3200);

            return () => {
                clearTimeout(lookLeft);
                clearTimeout(lookRight);
                clearTimeout(center);
                clearTimeout(blinkStart);
                clearTimeout(blinkEnd);
                clearTimeout(reset);
            };
        }, 15000); // Trigger every 15 seconds

        return () => clearInterval(interval);
    }, []);

    const getPupilX = () => {
        if (pupilPos === 'left') return 10;
        if (pupilPos === 'right') return 14;
        return 12;
    };

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`${className} transition-all duration-500`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            {mode === 'glass' ? (
                <g key="glass-group" className="animate-fade-in">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2.5" 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                </g>
            ) : (
                <g key="eye-group" className="animate-slide-up">
                    {/* Eye Socket */}
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" 
                    />
                    
                    {/* Blink Lid Overlay */}
                    {blink ? (
                        <path 
                            d="M2 12s3-7 10-7 10 7 10 7" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                        />
                    ) : (
                        <>
                            {/* Iris */}
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                            {/* Pupil with animated position */}
                            <circle 
                                cx={getPupilX()} 
                                cy="12" 
                                r="1.5" 
                                fill="currentColor" 
                                stroke="none" 
                                className="transition-all duration-300 ease-out"
                            />
                        </>
                    )}
                </g>
            )}
        </svg>
    );
};

export default SearchIcon;