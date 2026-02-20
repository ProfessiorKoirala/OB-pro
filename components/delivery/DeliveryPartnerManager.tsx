import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DeliveryPartner } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import AddIcon from '../icons/AddIcon';
import AddPartnerModal from './AddPartnerModal';
import TrashIcon from '../icons/TrashIcon';

interface DeliveryPartnerManagerProps {
    partners: DeliveryPartner[];
    onUpdate: (partners: DeliveryPartner[]) => void;
    onClose: () => void;
}

const DeliveryPartnerManager: React.FC<DeliveryPartnerManagerProps> = ({ partners, onUpdate, onClose }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const handleAddPartner = (partner: Omit<DeliveryPartner, 'id' | 'totalOrdersHandled' | 'balanceToPay' | 'balanceToCollect'>) => {
        const newPartner: DeliveryPartner = {
            ...partner,
            id: `dp-${Date.now()}`,
            totalOrdersHandled: 0,
            balanceToPay: 0,
            balanceToCollect: 0
        };
        onUpdate([...partners, newPartner]);
        setAddModalOpen(false);
    };

    const handleDeletePartner = (id: string) => {
        if (id === 'self') {
            alert("Default Self Delivery cannot be removed.");
            return;
        }
        if (confirm("Permanently remove this delivery partner?")) {
            onUpdate(partners.filter(p => p.id !== id));
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col h-screen font-sans animate-fade-in transition-colors overflow-hidden">
            {isAddModalOpen && (
                <AddPartnerModal 
                    onClose={() => setAddModalOpen(false)} 
                    onSave={handleAddPartner} 
                />
            )}

            <header className="px-6 pt-12 pb-6 shrink-0 flex flex-col gap-6 bg-white dark:bg-gray-950 border-b dark:border-gray-900">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-[20px] text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-800">
                            <CloseIcon className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Partners</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1 italic">OB Partner Management</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl active:scale-90 transition-all"
                    >
                        <AddIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                <div className="space-y-4 pb-32 pt-4">
                    {partners.length > 0 ? (
                        <>
                            {partners.map(partner => (
                                <div key={partner.id} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 flex flex-col gap-5 shadow-sm transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-sm border border-gray-50 dark:border-gray-700">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg text-black dark:text-white uppercase italic tracking-tighter leading-none">{partner.name}</h3>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{partner.type} • {partner.phone || 'NO PHONE'}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeletePartner(partner.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">CASH HELD</p>
                                            <p className="text-base font-black text-green-600 italic leading-none">₹{partner.balanceToCollect.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-50 dark:border-gray-700">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">FEES OWED</p>
                                            <p className="text-base font-black text-red-600 italic leading-none">₹{partner.balanceToPay.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => setAddModalOpen(true)}
                                className="w-full py-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] flex flex-col items-center justify-center gap-2 group hover:border-black dark:hover:border-white transition-all bg-gray-50/30 dark:bg-transparent mt-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white transition-all shadow-sm">
                                    <AddIcon className="w-6 h-6" />
                                </div>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] group-hover:text-black dark:group-hover:text-white">Create New Partner</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 rounded-[40px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700">
                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter mb-2">No Partners Found</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Start your delivery network</p>
                            <button 
                                onClick={() => setAddModalOpen(true)}
                                className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-full shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-3"
                            >
                                <AddIcon className="w-5 h-5" /> Add First Partner
                            </button>
                        </div>
                    )}
                </div>
            </main>
            
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>,
        document.body
    );
};

export default DeliveryPartnerManager;