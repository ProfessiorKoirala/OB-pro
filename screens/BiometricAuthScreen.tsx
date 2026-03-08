import React from 'react';
import { motion } from 'motion/react';
import { User } from '../types';

interface BiometricAuthScreenProps {
    user: User;
    onBack: () => void;
}

const BiometricAuthScreen: React.FC<BiometricAuthScreenProps> = ({ user, onBack }) => {
    return (
        <div className="h-[100dvh] flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xs text-center flex flex-col items-center"
            >
                <img 
                    src={user.profilePicUrl} 
                    alt={user.name} 
                    className="w-24 h-24 rounded-full mb-6 shadow-lg border-4 border-white" 
                />
                <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome, {user.name.split(' ')[0]}</h1>
                <p className="text-text-secondary mb-12">Touch the sensor to unlock</p>

                {/* Samsung-style Fingerprint Animation */}
                <div className="relative flex items-center justify-center w-64 h-64">
                    {/* Ripple Effects */}
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0 border border-primary/20 rounded-full"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ 
                                scale: [0.7, 1.8], 
                                opacity: [0.6, 0] 
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.75,
                                ease: "easeOut"
                            }}
                        />
                    ))}

                    {/* Main Fingerprint Container */}
                    <motion.div 
                        className="relative z-10 w-28 h-28 bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center justify-center border border-white/20 dark:border-gray-700"
                        whileTap={{ scale: 0.9 }}
                    >
                        <motion.div
                            animate={{ 
                                opacity: [0.5, 1, 0.5],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <svg 
                                className="w-16 h-16 text-primary" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.96.46 5.8 1.51.24.14.32.44.18.68-.08.14-.24.28-.18.28zm2.23 2.62c-.06 0-.13-.01-.19-.04-1.53-.63-3.11-.95-4.7-.95-1.57 0-3.15.32-4.66.95-.25.1-.54-.02-.64-.26-.1-.25.02-.54.26-.64 1.67-.7 3.41-1.05 5.04-1.05 1.62 0 3.3.34 4.96 1.05.25.1.37.39.26.64-.1.16-.21.3-.33.3zm1.5 4.28c-.03 0-.06 0-.09-.01-1.93-.31-3.53-.47-5.45-.47-1.92 0-3.53.16-5.45.47-.27.04-.53-.13-.58-.4-.05-.27.13-.53.4-.58 2.05-.33 3.77-.5 5.63-.5s3.58.17 5.62.5c.27.04.46.31.41.58-.05.22-.25.41-.49.41zm-2.02 5.47c-.18 0-.35-.1-.44-.28-.34-.66-.61-1.33-.8-1.98-.27-.97-.41-1.97-.41-2.96 0-.3.24-.55.55-.55s.55.24.55.55c0 .85.12 1.7.35 2.54.16.56.39 1.13.68 1.7.12.24.02.54-.22.67-.09.05-.17.07-.26.07zm-7.06.33c-.16 0-.32-.07-.44-.21-1.49-1.81-2.31-4.12-2.31-6.5 0-.3.24-.55.55-.55s.55.24.55.55c0 2.09.72 4.11 2.02 5.69.18.22.15.54-.07.72-.1.07-.21.11-.3.11zm5.84 3.53c-.14 0-.28-.05-.39-.16-1.18-1.18-2.01-2.59-2.47-4.17-.13-.44-.21-.88-.26-1.33-.03-.3.19-.57.49-.6.3-.03.57.18.6.48.03.37.1.74.21 1.1.4 1.36 1.12 2.59 2.02 3.49.21.21.21.55 0 .76-.11.11-.25.16-.4.16zm-3.27 1.26c-.27 0-.52-.2-.55-.47-.23-2.47.26-4.8 1.45-6.93.14-.25.44-.35.7-.21.25.14.35.44.21.7-1.07 1.92-1.51 4.02-1.3 6.23.03.3-.18.57-.48.6-.01 0-.02 0-.03 0z" />
                            </svg>
                        </motion.div>

                        {/* Scan Line Animation */}
                        <motion.div 
                            className="absolute inset-x-0 h-1 bg-primary/40 shadow-[0_0_10px_rgba(var(--color-primary),0.5)] z-20"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>

                    {/* Outer Rotating Ring */}
                    <motion.div 
                        className="absolute inset-0 border-t-2 border-primary/40 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    <motion.div 
                        className="absolute inset-4 border-b-2 border-primary/30 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="mt-16 text-sm font-bold text-text-secondary uppercase tracking-widest hover:text-primary transition-colors"
                >
                    Use another method
                </motion.button>
            </motion.div>
        </div>
    );
};

export default BiometricAuthScreen;
