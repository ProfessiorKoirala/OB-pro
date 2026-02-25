
import React, { useEffect, useState } from 'react';

interface GreetingScreenProps {
  status: 'SUCCESS' | 'FAILURE';
  onFinish: () => void;
}

const PaperPlane: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);

const GreetingScreen: React.FC<GreetingScreenProps> = ({ status, onFinish }) => {
    const [start, setStart] = useState(false);
    const isSuccess = status === 'SUCCESS';

    useEffect(() => {
        setStart(true);
        
        // Duration of animation sequence
        const duration = isSuccess ? 3500 : 4000;
        const timer = setTimeout(onFinish, duration);

        return () => clearTimeout(timer);
    }, [onFinish, isSuccess]);

    return (
        <div className="flex flex-col h-[100dvh] bg-white dark:bg-gray-950 overflow-hidden transition-colors relative">
            <main className="flex-1 flex flex-col items-center justify-center px-8">
                <div className={`flex flex-col items-center gap-12 transition-all duration-1000 ${start ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="flex flex-col items-center gap-8 text-center">
                         
                         <div className="relative group">
                            <span className={`text-7xl sm:text-8xl font-handwriting inline-block px-10 py-6 transition-all duration-1000 delay-300 transform ${start ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} ${isSuccess ? 'text-[#2D2A4A] dark:text-white' : 'text-red-600'}`}>
                                {isSuccess ? 'Unlock' : 'Wrong Password'}
                            </span>
                            
                            {start && (
                                <div className="absolute inset-0 w-full h-full -rotate-2 scale-125 pointer-events-none">
                                    {/* The hand-drawn circle path */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 80" fill="none">
                                        <path 
                                            d="M10,40 C10,10 150,10 150,40 C150,70 10,70 15,40" 
                                            stroke={isSuccess ? "#6B4F7D" : "#EF4444"} 
                                            strokeWidth="5" 
                                            strokeLinecap="round"
                                            className="animate-draw-path"
                                            style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animationDelay: '0.5s' }}
                                        />
                                    </svg>

                                    {/* The Paper Plane following the exact same path */}
                                    <div className="paper-plane-container">
                                        <PaperPlane className={`w-6 h-6 drop-shadow-lg ${isSuccess ? 'text-[#6B4F7D]' : 'text-red-600'}`} />
                                    </div>
                                </div>
                            )}
                         </div>

                         {!isSuccess && (
                            <div className={`mt-12 transition-all duration-1000 delay-1000 ${start ? 'opacity-100' : 'opacity-0'}`}>
                                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Redirecting back...</p>
                            </div>
                         )}
                    </div>
                </div>
            </main>
            
            <style>{`
                @keyframes draw { 
                    to { stroke-dashoffset: 0; } 
                }
                .animate-draw-path { 
                    animation: draw 2s cubic-bezier(0.445, 0.05, 0.55, 0.95) forwards; 
                }

                .paper-plane-container {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    top: 0;
                    left: 0;
                    /* Match the SVG path: M10,40 C10,10 150,10 150,40 C150,70 10,70 15,40 */
                    /* Prepend a long line from left and append a long line to right */
                    offset-path: path('M -500,40 L 10,40 C 10,10 150,10 150,40 C 150,70 10,70 15,40 L 1000,40');
                    offset-rotate: auto;
                    animation: fly-precise 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    opacity: 0;
                }

                @keyframes fly-precise {
                    0% { offset-distance: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    15% { offset-distance: 33%; } /* Reaches start of loop */
                    85% { offset-distance: 66%; opacity: 1; } /* Completes loop */
                    100% { offset-distance: 100%; opacity: 0; } /* Exits screen */
                }
            `}</style>
        </div>
    );
};

export default GreetingScreen;
