
import React, { useState, useEffect } from 'react';
import { MainView } from '../types';
import HomeIcon from './icons/HomeIcon';
import SalesIcon from './icons/SalesIcon';
import ExpenseIcon from './icons/ExpenseIcon';
import BoxIcon from './icons/BoxIcon';
import { triggerHaptic, HapticPatterns } from '../utils/hapticUtils';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { view: MainView.DASHBOARD, label: "Home", Icon: HomeIcon },
  { view: MainView.SALES, label: "Sales", Icon: SalesIcon },
  { view: MainView.EXPENSES, label: "Expenses", Icon: ExpenseIcon },
  { view: MainView.INVENTORY, label: "Inventory", Icon: BoxIcon },
];

interface BottomNavProps {
    currentView: MainView;
    setCurrentView: (view: MainView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
    const [hintIndex, setHintIndex] = useState<number | null>(null);

    useEffect(() => {
        const startSequence = () => {
            let i = 0;
            const sequenceInterval = setInterval(() => {
                if (i < navItems.length) {
                    setHintIndex(i);
                    i++;
                } else {
                    setHintIndex(null);
                    clearInterval(sequenceInterval);
                }
            }, 1500);
        };

        const initialTimeout = setTimeout(startSequence, 2000);
        const interval = setInterval(startSequence, 12000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="fixed bottom-6 left-0 right-0 px-8 z-50 flex justify-center pointer-events-none">
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-gray-800 p-2 flex items-center gap-1 pointer-events-auto max-w-sm w-full transition-colors duration-500">
                {navItems.map((item, index) => {
                    const isActive = currentView === item.view;
                    const isHinting = hintIndex === index;
                    
                    return (
                        <button
                            key={item.view}
                            onClick={() => {
                                triggerHaptic(HapticPatterns.LIGHT);
                                setCurrentView(item.view);
                            }}
                            className="relative flex-1 flex items-center justify-center h-12 outline-none group"
                        >
                            {/* Drop Light / Spotlight Effect */}
                            <AnimatePresence>
                                {isHinting && !isActive && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: '100%' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full pointer-events-none origin-top z-0"
                                    >
                                        <div 
                                            className="w-full h-full bg-gradient-to-b from-amber-300/40 via-amber-300/5 to-transparent"
                                            style={{ 
                                                clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
                                                filter: 'blur(10px)'
                                            }}
                                        />
                                        {/* Top Source Line - Aesthetic Yellow Glow */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-amber-200/60 shadow-[0_0_15px_rgba(252,211,77,0.6)] rounded-full" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Static Background Effect (No LayoutId) */}
                            <AnimatePresence>
                                {(isActive || isHinting) && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ 
                                            opacity: 1, 
                                            scale: 1,
                                            backgroundColor: isHinting && !isActive 
                                                ? ["rgba(252,211,77,0.05)", "rgba(252,211,77,0.15)", "rgba(252,211,77,0.05)"]
                                                : undefined
                                        }}
                                        transition={{
                                            backgroundColor: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`absolute inset-0 rounded-[24px] ${
                                            isActive 
                                                ? 'bg-black dark:bg-white shadow-lg' 
                                                : 'bg-gray-100/50 dark:bg-gray-800/50'
                                        }`}
                                    />
                                )}
                            </AnimatePresence>

                            {/* Content */}
                            <div className="relative z-10 flex items-center justify-center w-full h-full px-3">
                                <AnimatePresence mode="wait">
                                    {isHinting && !isActive ? (
                                        <motion.span
                                            key="label-hint"
                                            initial={{ opacity: 0, filter: 'blur(4px)', y: 5 }}
                                            animate={{ 
                                                opacity: 1, 
                                                filter: 'blur(0px)', 
                                                y: 0,
                                                textShadow: [
                                                    "0 0 0px rgba(252,211,77,0)",
                                                    "0 0 15px rgba(252,211,77,0.8)",
                                                    "0 0 0px rgba(252,211,77,0)"
                                                ]
                                            }}
                                            exit={{ opacity: 0, filter: 'blur(4px)', y: -5 }}
                                            transition={{ 
                                                duration: 0.5, 
                                                ease: [0.23, 1, 0.32, 1],
                                                textShadow: { duration: 1.5, repeat: Infinity }
                                            }}
                                            className="text-[10px] font-bold uppercase tracking-[0.1em] text-black dark:text-white"
                                        >
                                            {item.label}
                                        </motion.span>
                                    ) : (
                                        <motion.div
                                            key="icon-or-active"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-2"
                                        >
                                            <item.Icon 
                                                className={`w-5 h-5 transition-colors duration-500 ${
                                                    isActive 
                                                        ? 'text-white dark:text-black' 
                                                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                                }`} 
                                            />
                                            {isActive && (
                                                <motion.span
                                                    initial={{ width: 0, opacity: 0 }}
                                                    animate={{ width: 'auto', opacity: 1 }}
                                                    className="text-[11px] font-bold tracking-tight text-white dark:text-black whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
