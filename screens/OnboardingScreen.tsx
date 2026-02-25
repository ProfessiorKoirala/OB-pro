import React, { useState, useRef } from 'react';
import BusinessIcon from '../components/icons/BusinessIcon';
import ChartIcon from '../components/icons/ChartIcon';
import UsersIcon from '../components/icons/UsersIcon';
import OfflineIcon from '../components/icons/OfflineIcon';
import ShieldIcon from '../components/icons/ShieldIcon';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSlides = [
  {
    icon: <BusinessIcon className="w-32 h-32 text-black dark:text-white" />,
    title: 'Business on Your Mobile',
    description: 'Manage every aspect of your business right from your pocket, anytime, anywhere.',
    accentColor: '#6B4F7D'
  },
  {
    icon: <ChartIcon className="w-32 h-32 text-black dark:text-white" />,
    title: 'Insightful Business Reports',
    description: 'Get detailed reports on sales, expenses, and profits to make informed decisions.',
    accentColor: '#A5A6F6'
  },
  {
    icon: <UsersIcon className="w-32 h-32 text-black dark:text-white" />,
    title: 'Multi Business and Staffs',
    description: 'Handle multiple businesses and manage your staff effortlessly under one app.',
    accentColor: '#10B981'
  },
  {
    icon: <OfflineIcon className="w-32 h-32 text-black dark:text-white" />,
    title: 'Use Both Offline and Online',
    description: 'Your business never stops, even when the internet does. Syncs automatically.',
    accentColor: '#F59E0B'
  },
  {
    icon: <ShieldIcon className="w-32 h-32 text-black dark:text-white" />,
    title: 'Secure and Reliable',
    description: 'Your data is safe with us. We ensure top-notch security for your business information.',
    accentColor: '#EF4444'
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
      touchEndRef.current = null;
      touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
      touchEndRef.current = e.targetTouches[0].clientX;
  };
  
  const onTouchEnd = () => {
      if (!touchStartRef.current || !touchEndRef.current) return;
      const distance = touchStartRef.current - touchEndRef.current;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
          handleNext();
      } else if (isRightSwipe) {
          handlePrev();
      }
      touchStartRef.current = null;
      touchEndRef.current = null;
  };

  return (
    <div 
      className="h-[100dvh] flex flex-col bg-white dark:bg-gray-900 overflow-hidden transition-colors relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header Branding */}
      <header className="flex justify-between items-center pt-10 px-8 shrink-0 z-20">
        <div className="flex items-center gap-1.5">
            <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic">OB</h1>
            <span className="bg-[#4B2A63] text-white text-[10px] font-black px-1.5 py-0.5 rounded italic uppercase tracking-tighter">Pro</span>
        </div>
        <button onClick={onComplete} className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] hover:text-black dark:hover:text-white transition-colors">
            Skip
        </button>
      </header>
      
      <main className="flex-1 relative overflow-hidden flex items-center">
        <div
            className="flex transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) h-full w-full"
            style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
        >
            {onboardingSlides.map((slide, index) => (
                <div key={index} className="w-full h-full flex-shrink-0 flex flex-col items-center justify-center px-10 text-center gap-12">
                     
                     {/* Animated Icon with Background Element */}
                     <div className="relative animate-slide-up">
                        <div className="relative z-10 scale-110">
                            {slide.icon}
                        </div>
                        {/* Decorative Hand-drawn Circle behind icon */}
                        <svg className="absolute inset-0 w-full h-full scale-[1.8] -rotate-6 opacity-30 dark:opacity-50" viewBox="0 0 160 80" fill="none">
                            <path 
                                d="M10,40 C10,10 150,10 150,40 C150,70 10,70 15,40" 
                                stroke={slide.accentColor} 
                                strokeWidth="6" 
                                strokeLinecap="round"
                                className={currentSlide === index ? 'animate-draw' : ''}
                                style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                            />
                        </svg>
                     </div>

                     {/* Content Section: Balanced in the Middle */}
                     <div className="space-y-6 max-w-sm">
                        <h2 className={`text-5xl font-black text-black dark:text-white tracking-tight leading-[1.1] transition-all duration-700 delay-100 ${currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            {slide.title}
                        </h2>
                        
                        <div className={`relative inline-block transition-all duration-700 delay-200 ${currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <p className="text-2xl font-handwriting text-gray-500 dark:text-gray-400 leading-relaxed">
                                {slide.description}
                            </p>
                            
                            {/* Hand-drawn Underline Animation */}
                            <div className="flex justify-center mt-2">
                                <svg className="w-48 h-4 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path 
                                        d="M0,5 Q50,0 100,8" 
                                        stroke={slide.accentColor} 
                                        strokeWidth="8" 
                                        strokeLinecap="round"
                                        className={currentSlide === index ? 'animate-draw-fast' : ''}
                                        style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
                                    />
                                </svg>
                            </div>
                        </div>
                     </div>
                </div>
            ))}
        </div>
      </main>
      
      <footer className="pb-16 px-10 shrink-0 z-20 flex flex-col items-center">
        {/* Pagination Dots */}
        <div className="flex justify-center mb-10 gap-3">
            {onboardingSlides.map((_, index) => (
                <div 
                    key={index} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                        currentSlide === index 
                        ? 'w-10 bg-black dark:bg-white shadow-xl' 
                        : 'w-1.5 bg-gray-200 dark:bg-gray-800'
                    }`}
                />
            ))}
        </div>
        
        {/* Large Premium Button */}
        <div className="w-full max-w-xs flex flex-col gap-6">
            <button 
                onClick={handleNext} 
                className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-5 px-8 rounded-full shadow-2xl active:scale-[0.96] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.25em] text-sm group overflow-hidden relative"
            >
                <span className="relative z-10">
                    {currentSlide === onboardingSlides.length - 1 ? "Start Now" : "Next Step"}
                </span>
                <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {/* Button Shine Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </button>
            
            <div className="flex justify-center">
                <span className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.45em] text-center">
                    Powered by Ordinary Business
                </span>
            </div>
        </div>
      </footer>

      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-gray-50 dark:bg-gray-800/10 rounded-full blur-[100px] -z-10 rotate-12"></div>
      
      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          animation: draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s;
        }
        .animate-draw-fast {
          animation: draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.8s;
        }
      `}</style>
    </div>
  );
};

export default OnboardingScreen;