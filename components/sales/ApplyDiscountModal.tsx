
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Discount } from '../../types';
import TagIcon from '../icons/TagIcon';
import CloseIcon from '../icons/CloseIcon';

interface ApplyDiscountModalProps {
    discounts: Discount[];
    onClose: () => void;
    onApply: (data: { value: number; type: 'PERCENT' | 'AMOUNT'; id?: string; name?: string }) => void;
}

const ApplyDiscountModal: React.FC<ApplyDiscountModalProps> = ({ discounts, onClose, onApply }) => {
    const [manualType, setManualType] = useState<'PERCENT' | 'AMOUNT'>('PERCENT');
    const [manualValue, setManualValue] = useState<number | ''>('');

    const activeDiscounts = useMemo(() => discounts.filter(d => d.isActive), [discounts]);

    const handleApplyManual = () => {
        if (typeof manualValue === 'number' && manualValue > 0) {
            onApply({ value: manualValue, type: manualType, name: 'Manual Discount' });
        } else {
            alert('Please enter a valid discount value.');
        }
    };

    const handleApplyPredefined = (discount: Discount) => {
        onApply({ value: discount.value, type: discount.type, id: discount.id, name: discount.name });
    };
    
    const handleRemoveDiscount = () => {
        onApply({ value: 0, type: 'PERCENT', name: undefined, id: undefined });
    }

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[40px] sm:rounded-[32px] shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">PROMOTION</p>
                        <h2 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter">Offers</h2>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 active:scale-90 transition-all">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                
                <div className="px-8 py-4 space-y-8 overflow-y-auto no-scrollbar flex-grow">
                    {/* Predefined Offers */}
                    {activeDiscounts.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AVAILABLE CAMPAIGNS</p>
                            <div className="space-y-2">
                                {activeDiscounts.map(discount => (
                                    <button
                                        key={discount.id}
                                        onClick={() => handleApplyPredefined(discount)}
                                        className="w-full text-left bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl flex items-center gap-4 hover:ring-2 hover:ring-black dark:hover:ring-white transition-all group"
                                    >
                                        <div className="p-3 bg-white dark:bg-gray-700 rounded-2xl shadow-sm text-blue-600">
                                            <TagIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-black dark:text-white italic uppercase text-sm truncate">{discount.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">READY TO REDEEM</p>
                                        </div>
                                        <p className="font-black text-lg text-blue-600 italic">
                                            {discount.type === 'PERCENT' ? `${discount.value}%` : `₹${discount.value}`}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Manual Entry */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MANUAL SETTLEMENT</p>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-4">
                            <div className="flex p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <button onClick={() => setManualType('PERCENT')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${manualType === 'PERCENT' ? 'bg-black text-white' : 'text-gray-400'}`}>Percent %</button>
                                <button onClick={() => setManualType('AMOUNT')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${manualType === 'AMOUNT' ? 'bg-black text-white' : 'text-gray-400'}`}>Amount ₹</button>
                            </div>
                            <input
                                type="number"
                                placeholder="ENTER VALUE..."
                                value={manualValue}
                                onChange={(e) => setManualValue(parseFloat(e.target.value) || '')}
                                className="w-full bg-white dark:bg-gray-800 rounded-2xl py-4 px-6 font-black tracking-widest text-sm focus:ring-2 focus:ring-black outline-none shadow-sm placeholder:text-gray-300"
                            />
                             <button onClick={handleApplyManual} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Apply Manual</button>
                        </div>
                    </div>
                </div>
                
                <footer className="p-8 bg-gray-50 dark:bg-gray-800/50 space-y-3">
                    <button onClick={handleRemoveDiscount} className="w-full py-5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black rounded-[28px] text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all border border-red-100 dark:border-red-900/20">Remove Active Discount</button>
                    <button onClick={onClose} className="w-full py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest">Close</button>
                </footer>
            </div>
        </div>,
        document.body
    );
};

export default ApplyDiscountModal;
