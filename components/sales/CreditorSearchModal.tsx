
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Creditor, Customer, Vendor } from '../../types';
import AnimatedSearchBar from '../AnimatedSearchBar';
import BackIcon from '../icons/BackIcon';

interface ContactSearchModalProps {
    creditors: Creditor[];
    customers: Customer[];
    vendors: Vendor[];
    onSelectContact: (contact: Customer | Creditor | Vendor, type: 'customer' | 'creditor' | 'vendor') => void;
    onClose: () => void;
}

const ContactSearchModal: React.FC<ContactSearchModalProps> = ({ creditors, customers, vendors, onSelectContact, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const allContacts = useMemo(() => {
        const combined = [
            ...customers.map(c => ({ ...c, type: 'customer' as const })),
            ...creditors.map(c => ({ ...c, type: 'creditor' as const })),
            ...vendors.map(v => ({...v, type: 'vendor' as const}))
        ];
        return combined.sort((a,b) => a.name.localeCompare(b.name));
    }, [customers, creditors, vendors]);

    const filteredContacts = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        if (!lowercasedFilter) return allContacts;
        return allContacts.filter(c =>
            c.name.toLowerCase().includes(lowercasedFilter) ||
            c.phone.includes(lowercasedFilter)
        );
    }, [allContacts, searchTerm]);

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'customer': return 'bg-blue-50 text-blue-600';
            case 'creditor': return 'bg-red-50 text-red-600';
            case 'vendor': return 'bg-purple-50 text-purple-600';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-white dark:bg-gray-950 z-[9999] flex flex-col h-screen font-sans animate-fade-in transition-colors overflow-hidden">
            <header className="px-6 pt-12 pb-4 shrink-0 flex flex-col gap-6 bg-white dark:bg-gray-950">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-[20px] text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-800">
                            <BackIcon className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Database</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1 italic">Select Profile</p>
                        </div>
                    </div>
                </div>
                
                <AnimatedSearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Find name or phone..."
                />
            </header>

            <main className="flex-grow overflow-y-auto px-6 py-4 no-scrollbar">
                <div className="space-y-3 pb-20">
                    {filteredContacts.length > 0 ? filteredContacts.map(contact => (
                        <button 
                            key={`${contact.type}-${contact.id}`} 
                            onClick={() => onSelectContact(contact, contact.type)}
                            className="w-full text-left bg-gray-50 dark:bg-gray-900/50 p-5 rounded-[32px] flex items-center gap-5 border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-50 dark:border-gray-700 shrink-0 overflow-hidden">
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} 
                                    alt={contact.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-lg text-black dark:text-white italic uppercase tracking-tighter truncate leading-tight">{contact.name}</p>
                                <p className="text-[11px] font-bold text-gray-400 mt-1">{contact.phone}</p>
                            </div>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shrink-0 ${getTypeStyles(contact.type)}`}>
                                {contact.type}
                            </span>
                        </button>
                    )) : (
                        <div className="text-center py-24 opacity-30">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-black dark:text-white">No Matches Found</h3>
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t dark:border-gray-900 shrink-0 z-20">
                <button onClick={onClose} className="w-full py-6 bg-black dark:bg-white text-white dark:text-black font-black rounded-[32px] text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                    Cancel Search
                </button>
            </footer>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>,
        document.body
    );
};

export default ContactSearchModal;
