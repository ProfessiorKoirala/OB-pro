import React, { useState, useEffect } from 'react';
import BackIcon from '../components/icons/BackIcon';
import HomeIcon from '../components/icons/HomeIcon';

export interface WeatherData {
    temp: number;
    description: string;
    sunrise: string;
    wind: string;
    secondaryTemp: number;
    isDay: boolean;
}

interface WeatherScreenProps {
    onBack: () => void;
    bossName: string;
    onWeatherLoaded?: (temp: number) => void;
    onHome?: () => void;
}

const WeatherScreen: React.FC<WeatherScreenProps> = ({ onBack, bossName, onWeatherLoaded, onHome }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,wind_speed_10m,weather_code&daily=sunrise&timezone=auto`);
                const data = await response.json();
                
                const weatherInfo = {
                    temp: Math.round(data.current.temperature_2m),
                    description: getWeatherDescription(data.current.weather_code),
                    sunrise: data.daily.sunrise[0].split('T')[1],
                    wind: `${Math.round(data.current.wind_speed_10m)}m/s`,
                    secondaryTemp: Math.round(data.current.temperature_2m + 1),
                    isDay: !!data.current.is_day
                };
                
                setWeather(weatherInfo);
                onWeatherLoaded?.(weatherInfo.temp);
            } catch (error) {
                console.error("Weather fetch failed", error);
                const mockWeather = {
                    temp: 22,
                    description: 'Partly Cloudy',
                    sunrise: '7:00',
                    wind: '4m/s',
                    secondaryTemp: 23,
                    isDay: true
                };
                setWeather(mockWeather);
                onWeatherLoaded?.(mockWeather.temp);
            } finally {
                setLoading(false);
            }
        };

        const startLoading = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                    () => fetchWeather(27.7172, 85.3240) // Default to Kathmandu
                );
            } else {
                fetchWeather(27.7172, 85.3240);
            }
        };

        startLoading();
        return () => clearInterval(timer);
    }, []);

    const getWeatherDescription = (code: number) => {
        if (code === 0) return 'Clear Sky';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        return 'Stormy';
    };

    const getGreeting = () => {
        const hours = currentTime.getHours();
        if (hours < 12) return 'GOOD MORNING';
        if (hours < 17) return 'GOOD AFTERNOON';
        return 'GOOD EVENING';
    };

    const idCard = (
        <div className="absolute top-0 right-6 z-30 pointer-events-none">
            <div className="animate-swing origin-top flex flex-col items-center">
                <div className="w-8 h-24 bg-[#4B2A63] rounded-b-full shadow-md relative -mb-3 flex flex-col items-center justify-end pb-2">
                    <span className="text-[3px] text-white/30 font-black uppercase tracking-[0.2em] -rotate-90 whitespace-nowrap mb-4">Ordinary Business</span>
                </div>
                
                <div className="w-24 h-32 bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-2 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#4B2A63]"></div>
                    
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    
                    <div className="mt-3 flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-2">
                             <div className="w-4 h-4 bg-[#4B2A63] rounded-md flex items-center justify-center text-white font-black text-[6px] italic uppercase">C6</div>
                             <div className="text-left leading-none">
                                <p className="text-[6px] font-bold text-gray-800 dark:text-gray-100 tracking-tight">Ordinary</p>
                                <p className="text-[6px] font-medium text-gray-400 tracking-tight">Business</p>
                             </div>
                        </div>
                        <div className="space-y-1 w-10">
                             <div className="h-0.5 bg-gray-100 dark:bg-gray-700 rounded-full w-full"></div>
                             <div className="h-0.5 bg-gray-100 dark:bg-gray-700 rounded-full w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="h-full flex flex-col bg-[#F0F4F8] dark:bg-gray-900 transition-colors font-sans overflow-hidden relative">
            <header className="px-8 pt-12 flex justify-between items-center z-10">
                <button onClick={onBack} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl">
                    <BackIcon className="h-6 w-6" />
                </button>
                {onHome && (
                    <button onClick={onHome} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                        <HomeIcon className="w-6 h-6" />
                    </button>
                )}
            </header>
            <main className="flex-1 flex flex-col items-center justify-center -mt-20 animate-pulse">
                <p className="text-gray-400 font-black uppercase tracking-[0.4em]">Fetching Local Weather...</p>
            </main>
            {idCard}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-[#F0F4F8] dark:bg-gray-950 transition-colors font-sans overflow-hidden relative">
            <div className="absolute top-12 left-6 z-20 flex items-center gap-2">
                <button 
                    onClick={onBack} 
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <BackIcon className="h-6 w-6" />
                </button>
                {onHome && (
                    <button onClick={onHome} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                        <HomeIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            {idCard}

            <header className="pt-16 pb-4 flex flex-col items-center justify-center z-10">
                <div className="text-center">
                    <p className="text-[14px] font-bold text-gray-500 tracking-[0.15em] uppercase leading-none">
                        {currentTime.toLocaleDateString('en-GB', { weekday: 'long' })}
                    </p>
                    <p className="text-[14px] font-bold text-gray-500 tracking-[0.15em] uppercase mt-1">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start pt-12 px-8 text-center gap-14">
                <div className="relative">
                    <div className="w-56 h-40 flex items-center justify-center">
                        <div className="relative">
                            <div className="w-20 h-20 bg-[#FFA000] rounded-full shadow-[0_0_50px_rgba(255,160,0,0.3)] relative z-0">
                                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                                    <div 
                                        key={deg}
                                        className="absolute w-1.5 h-6 bg-[#FFA000] rounded-full"
                                        style={{ 
                                            left: '50%', 
                                            top: '50%', 
                                            transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-25px)` 
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="absolute -bottom-6 -right-12 w-44 h-24 bg-white dark:bg-gray-200 rounded-[60px] shadow-sm z-10"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 animate-slide-up">
                    <h1 className="text-9xl font-light text-[#37474F] dark:text-white tracking-tighter flex items-start justify-center">
                        {weather?.temp}<span className="text-5xl mt-4 ml-1 font-normal">°c</span>
                    </h1>
                    <div className="space-y-2">
                        <p className="text-sm font-bold text-gray-400 tracking-[0.4em] leading-none uppercase">{getGreeting()}</p>
                        <h2 className="text-2xl font-bold text-gray-500 dark:text-gray-300 tracking-tight uppercase italic">{bossName}</h2>
                    </div>
                </div>

                <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-800 rounded-full opacity-50"></div>

                <div className="w-full max-w-sm grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800 mt-auto pb-16">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <div className="text-center">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sunrise</p>
                            <p className="text-xl font-medium text-gray-600 dark:text-gray-200">{weather?.sunrise}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div className="text-center">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Wind</p>
                            <p className="text-xl font-medium text-gray-600 dark:text-gray-200">{weather?.wind}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                        <div className="text-center">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Temprature</p>
                            <p className="text-xl font-medium text-gray-600 dark:text-gray-200">{weather?.secondaryTemp}°</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WeatherScreen;