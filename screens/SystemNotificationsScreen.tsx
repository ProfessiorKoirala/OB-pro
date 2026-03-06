import React, { useState, useEffect } from 'react';
import { SystemNotification } from '../types';
import { getSupabase } from '../src/supabase';
import BackIcon from '../components/icons/BackIcon';
import BellIcon from '../components/icons/BellIcon';
import CloseIcon from '../components/icons/CloseIcon';
import RefreshIcon from '../components/icons/RefreshIcon';

interface SystemNotificationsScreenProps {
    onBack: () => void;
}

const SystemNotificationsScreen: React.FC<SystemNotificationsScreenProps> = ({ onBack }) => {
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        const supabase = getSupabase();
        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('system_notifications')
                    .select('*')
                    .order('createdAt', { ascending: false });
                
                if (data && !error) {
                    setNotifications(data);
                }
            } catch (err) {
                console.error("Failed to fetch system notifications:", err);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (selectedNotification) {
        return (
            <div className="h-full bg-white dark:bg-gray-950 flex flex-col animate-fade-in">
                <header className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
                    <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                        <BackIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Update Detail</h2>
                    <div className="w-10"></div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-8">
                    {selectedNotification.imageUrl && (
                        <img 
                            src={selectedNotification.imageUrl} 
                            alt={selectedNotification.title} 
                            className="w-full h-64 object-cover rounded-[32px] shadow-2xl"
                            referrerPolicy="no-referrer"
                        />
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                selectedNotification.type === 'Update' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                                selectedNotification.type === 'Alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                'bg-green-100 text-green-600 dark:bg-green-900/30'
                            }`}>
                                {selectedNotification.type}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {new Date(selectedNotification.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter leading-none italic">
                            {selectedNotification.title}
                        </h1>
                        
                        <div className="w-12 h-1 bg-black dark:bg-white rounded-full"></div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">
                            {selectedNotification.message}
                        </p>
                    </div>
                </main>

                <footer className="p-6 border-t border-gray-100 dark:border-gray-900">
                    <button 
                        onClick={() => setSelectedNotification(null)}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl"
                    >
                        Close Detail
                    </button>
                </footer>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-950 flex flex-col">
            <header className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                        <BackIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-black text-black dark:text-white tracking-tighter italic">Updates & News</h1>
                </div>
                <button onClick={fetchNotifications} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
                    <RefreshIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Checking for updates...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <div className="p-6 bg-white dark:bg-gray-900 rounded-[40px] shadow-xl">
                            <BellIcon className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-black dark:text-white tracking-tight">Currently no updates are available</h3>
                            <p className="text-sm text-gray-400 font-medium">You're all caught up with the latest news.</p>
                        </div>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <button 
                            key={notif.id}
                            onClick={() => setSelectedNotification(notif)}
                            className="w-full bg-white dark:bg-gray-900 p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all text-left border border-transparent hover:border-black/5 dark:hover:border-white/5 flex items-center space-x-4 group"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                                notif.type === 'Update' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                notif.type === 'Alert' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                                'bg-green-50 text-green-600 dark:bg-green-900/20'
                            }`}>
                                <BellIcon className="w-6 h-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {notif.type}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-300">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-black dark:text-white tracking-tight truncate">
                                    {notif.title}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium truncate">
                                    {notif.message}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </main>
        </div>
    );
};

export default SystemNotificationsScreen;
