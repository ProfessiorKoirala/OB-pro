import React, { useState, useMemo } from 'react';
import { KOT, BusinessProfile } from '../types';
import BackIcon from '../components/icons/BackIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import { printKOT } from '../utils/printUtils';
import HomeIcon from '../components/icons/HomeIcon';

interface KotListScreenProps {
    kots: KOT[];
    onBack: () => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const KotListScreen: React.FC<KotListScreenProps> = ({ kots, onBack, businessProfile, onHome }) => {
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredKots = useMemo(() => {
        return kots
            .filter(kot => new Date(kot.timestamp).toISOString().split('T')[0] === filterDate)
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [kots, filterDate]);

    const getTypeStyles = (type: KOT['type']) => {
        switch (type) {
            case 'NEW': return 'bg-green-100 text-green-800';
            case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
            case 'CANCEL': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-gray-600 dark:text-gray-400 transition-all active:scale-90">
                    <BackIcon className="h-6 w-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-text-primary dark:text-gray-100 italic uppercase">KOT History</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">KITCHEN RECORDS</p>
                </div>
                <div className="flex items-center gap-2">
                    {onHome && (
                        <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                            <HomeIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Filter by Date</label>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={e => setFilterDate(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl py-3 px-4 font-bold text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                        style={{ colorScheme: 'light' }}
                    />
                </div>

                <div className="space-y-4">
                    {filteredKots.length > 0 ? filteredKots.map(kot => (
                        <div key={kot.id} className="bg-white dark:bg-gray-800 p-5 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm animate-slide-up flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-black text-black dark:text-white italic uppercase tracking-tighter">KOT #{kot.kotNumber}</h3>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${getTypeStyles(kot.type)}`}>
                                            {kot.type}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {kot.tableName} • {new Date(kot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => printKOT(kot, businessProfile)}
                                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl text-black dark:text-white active:scale-90 transition-all shadow-sm"
                                >
                                    <PrinterIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                                <ul className="space-y-2">
                                    {kot.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-black dark:text-white italic uppercase tracking-tight">{item.name}</span>
                                            <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-2 py-0.5 rounded-lg">x{item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 animate-fade-in">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                                <PrinterIcon className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-black text-black dark:text-white italic uppercase tracking-tight">No KOTs Found</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">FOR {new Date(filterDate).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default KotListScreen;