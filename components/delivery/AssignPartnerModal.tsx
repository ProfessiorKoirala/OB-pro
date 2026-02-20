
import React from 'react';
import { createPortal } from 'react-dom';
import { DeliveryPartner } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AssignPartnerModalProps {
    partners: DeliveryPartner[];
    onClose: () => void;
    onAssign: (partnerId: string) => void;
}

const AssignPartnerModal: React.FC<AssignPartnerModalProps> = ({ partners, onClose, onAssign }) => {
    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-t-[40px] sm:rounded-[48px] w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">DISPATCH</p>
                        <h2 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Assign Rider</h2>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 active:scale-90 transition-all">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto px-6 py-4 no-scrollbar">
                    <div className="space-y-2 pb-10">
                        {partners.filter(p => p.status === 'Active').map(partner => (
                            <button
                                key={partner.id}
                                onClick={() => onAssign(partner.id)}
                                className="w-full text-left bg-gray-50 dark:bg-gray-800/50 p-5 rounded-[32px] flex items-center gap-4 hover:ring-2 hover:ring-black dark:hover:ring-white transition-all group border border-gray-100 dark:border-gray-800 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-sm">
                                    <span className="font-black text-lg text-black dark:text-white italic leading-none">{partner.name[0]}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-black dark:text-white uppercase italic text-sm truncate">{partner.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{partner.type} • {partner.vehicleNumber || 'NO VEHICLE'}</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-200 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AssignPartnerModal;
