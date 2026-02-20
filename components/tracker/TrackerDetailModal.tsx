
import React from 'react';
import { Tracker } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import TrashIcon from '../icons/TrashIcon';

interface TrackerDetailModalProps {
    tracker: Tracker;
    onClose: () => void;
    onUpdate: (tracker: Tracker) => void;
    onDelete: (id: string) => void;
    onPay: (amount: number) => void;
}

const TrackerDetailModal: React.FC<TrackerDetailModalProps> = ({ tracker, onClose, onDelete, onPay }) => {
    
    const today = new Date().getDate();
    const isNear = Math.abs(tracker.dueDate - today) <= 3;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="p-8 pb-0 flex justify-between items-start">
                    <div className={`p-4 rounded-3xl ${isNear ? 'bg-red-100 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => { if(confirm('Delete this tracker?')) onDelete(tracker.id); }} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all">
                            <TrashIcon className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <main className="p-8 pt-6 space-y-8">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] mb-2">{tracker.category} TRACKER</p>
                        <h2 className="text-4xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none mb-1">{tracker.title}</h2>
                        <p className="text-sm font-bold text-gray-400">Monthly recurring payment</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[32px] space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Est. Amount</span>
                            <span className="text-2xl font-black italic text-black dark:text-white">₹{tracker.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Next Due Day</span>
                            <span className={`font-black uppercase text-lg italic ${isNear ? 'text-red-500' : 'text-black dark:text-white'}`}>
                                {tracker.dueDate} of Month
                            </span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="space-y-3">
                            <button onClick={() => onPay(tracker.amount)} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[24px] text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                Record Settlement
                            </button>
                            <button onClick={onClose} className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 font-black rounded-[24px] text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all">
                                Close Details
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TrackerDetailModal;
