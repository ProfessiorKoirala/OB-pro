import React, { useState, useMemo } from 'react';
import { UnifiedContact } from '../../types';
import AnimatedSearchBar from '../AnimatedSearchBar';
import HomeIcon from '../icons/HomeIcon';

interface ContactListProps {
    contacts: UnifiedContact[];
    onSelectContact: (contact: UnifiedContact) => void;
    onBack: () => void;
    onAddContactClick: () => void;
    onHome?: () => void;
}

const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const getAvatarColor = (type: string) => {
    switch (type) {
        case 'Customer': return 'bg-orange-100';
        case 'Creditor': return 'bg-purple-100';
        case 'Vendor': return 'bg-blue-100';
        default: return 'bg-gray-100';
    }
};

const ContactList: React.FC<ContactListProps> = ({ contacts, onSelectContact, onBack, onAddContactClick, onHome }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredContacts = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return contacts;
        return contacts.filter(c => 
            c.name.toLowerCase().includes(lowercasedTerm) || 
            c.phone.includes(lowercasedTerm)
        );
    }, [contacts, searchTerm]);

    return (
        <div className="flex flex-col h-full bg-white relative font-sans">
            <header className="px-6 pt-10 pb-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-1 -ml-1 text-gray-800">
                        <BackIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-black text-black italic uppercase tracking-tighter">OB <span className="text-[12px] bg-black text-white px-2 py-0.5 rounded ml-1">Pro</span></h1>
                </div>
                <div className="flex items-center gap-2">
                    {onHome && (
                        <button onClick={onHome} className="p-2 text-gray-400 hover:text-black transition-all">
                            <HomeIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </header>

            <div className="px-4 py-2 shrink-0">
                <AnimatedSearchBar 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Search contacts..."
                />
            </div>
            
            <main className="flex-grow overflow-y-auto px-1 pb-32 no-scrollbar">
                {filteredContacts.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {filteredContacts.map(contact => (
                            <button 
                                key={contact.id} 
                                onClick={() => onSelectContact(contact)}
                                className="w-full text-left p-4 flex items-center gap-4 active:bg-gray-50 transition-colors"
                            >
                                <div className={`w-14 h-14 rounded-full ${getAvatarColor(contact.type)} flex items-center justify-center shrink-0 border border-gray-50 overflow-hidden`}>
                                    <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} 
                                        alt={contact.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-bold text-[17px] text-black truncate">{contact.name}</h3>
                                        <span className="text-[12px] text-gray-400 font-medium shrink-0">
                                            19:45
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[14px] text-gray-500 truncate font-medium">
                                            {contact.phone} • {contact.type}
                                        </p>
                                        {contact.type === 'Creditor' && (
                                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                                !
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 px-10 text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-black italic">No connections yet</h3>
                    </div>
                )}
            </main>

            <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                <button
                    onClick={onAddContactClick}
                    className="pointer-events-auto h-14 px-8 bg-black text-white rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.3)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group"
                >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-bold text-sm uppercase tracking-widest">New</span>
                </button>
            </div>
            
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ContactList;