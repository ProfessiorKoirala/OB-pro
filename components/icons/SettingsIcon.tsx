import React, { useState, useEffect } from 'react';

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => {
    const [mode, setMode] = useState<'gear' | 'face'>('gear');
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            // Start the easter egg animation
            setMode('face');
            
            // First blink
            const b1Start = setTimeout(() => setBlink(true), 400);
            const b1End = setTimeout(() => setBlink(false), 600);
            
            // Second blink
            const b2Start = setTimeout(() => setBlink(true), 1300);
            const b2End = setTimeout(() => setBlink(false), 1500);
            
            // Revert back to original gear icon
            const reset = setTimeout(() => {
                setMode('gear');
                setBlink(false);
            }, 2800);

            return () => {
                clearTimeout(b1Start);
                clearTimeout(b1End);
                clearTimeout(b2Start);
                clearTimeout(b2End);
                clearTimeout(reset);
            };
        }, 10000); // 10 seconds frequency

        return () => clearInterval(interval);
    }, []);

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`${className} transition-all duration-500`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
        >
            {mode === 'gear' ? (
                <g key="gear-group" className="animate-fade-in">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                    />
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                </g>
            ) : (
                <g key="face-group" className="animate-slide-up">
                    {/* Blinkable Eyes */}
                    {blink ? (
                        <>
                            <line x1="7" y1="10.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="14" y1="10.5" x2="17" y2="10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </>
                    ) : (
                        <>
                            <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
                            <circle cx="15.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
                        </>
                    )}
                    {/* Smiling Mouth */}
                    <path 
                        d="M8 15.5 Q12 19.5 16 15.5" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        fill="none" 
                    />
                </g>
            )}
        </svg>
    );
};

export default SettingsIcon;