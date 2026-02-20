import React, { useState } from 'react';
import { Discount, Product } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import AddIcon from '../components/icons/AddIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import TagIcon from '../components/icons/TagIcon';
import BackIcon from '../components/icons/BackIcon';
import HomeIcon from '../components/icons/HomeIcon';

interface DiscountManagementScreenProps {
    discounts: Discount[];
    products: Product[];
    onAddClick: () => void;
    onEditClick: (discount: Discount) => void;
    onDelete: (discountId: string) => void;
    onToggleStatus: (discountId: string) => void;
    onBack: () => void;
    onHome?: () => void;
}

const Toggle: React.FC<{ enabled: boolean; onChange: () => void; }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${ enabled ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex items-center h-6 rounded-full w-11 transition-all active:scale-90`}
        onClick={onChange}
    >
        <span className={`${ enabled ? 'translate-x-6 bg-white dark:bg-black' : 'translate-x-1 bg-white'} inline-block w-4 h-4 transform rounded-full transition-transform`}/>
    </button>
);

const DiscountManagementScreen: React.FC<DiscountManagementScreenProps> = ({ discounts, products, onAddClick, onEditClick, onDelete, onToggleStatus, onBack, onHome }) => {
    const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

    const handleConfirmDelete = () => {
        if (discountToDelete) {
            onDelete(discountToDelete.id);
            setDiscountToDelete(null);
        }
    };
    
    const formatValue = (type: 'PERCENT' | 'AMOUNT', value: number) => {
        return type === 'PERCENT' ? `${value}%` : `₹${value}`;
    }

    const getProductName = (id?: string) => {
        if (!id) return "Global Offer";
        return products.find(p => p.id === id)?.name || "Unknown Product";
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors font-sans">
            {discountToDelete && (
                <ConfirmationModal
                    title="Delete Campaign"
                    message={`Are you sure you want to delete "${discountToDelete.name}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDiscountToDelete(null)}
                    confirmText="Delete"
                    confirmButtonClass="bg-red-600 text-white"
                />
            )}
            
            <header className="px-6 pt-10 pb-4 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 text-gray-800 dark:text-white active:scale-90 transition-all">
                        <BackIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1">Pro</span></h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1 leading-none">Marketing Hub</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onHome && (
                        <button onClick={onHome} className="p-2 text-gray-400 hover:text-black transition-all">
                            <HomeIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-32">
                {discounts.length > 0 ? discounts.map(discount => (
                    <div key={discount.id} className={`bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700 flex flex-col gap-4 shadow-sm transition-all ${!discount.isActive ? 'opacity-60 grayscale' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="p-3.5 bg-black dark:bg-white rounded-2xl text-white dark:text-black shadow-lg">
                                    <TagIcon className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-black dark:text-white italic uppercase tracking-tighter text-lg leading-none truncate">{discount.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${discount.productId ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                            {discount.productId ? 'Product' : 'Promo Code'}
                                        </span>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{getProductName(discount.productId)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-black dark:text-white italic leading-none">{formatValue(discount.type, discount.value)}</p>
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1.5">SAVINGS</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-1">
                            <div className="flex gap-2">
                                <button onClick={() => onEditClick(discount)} className="p-2.5 bg-white dark:bg-gray-700 rounded-xl text-gray-400 hover:text-black dark:hover:text-white transition-all active:scale-90 border border-gray-100 dark:border-gray-600">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => setDiscountToDelete(discount)} className="p-2.5 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-500 transition-all active:scale-90 border border-red-100 dark:border-red-900/20">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{discount.isActive ? 'ACTIVE' : 'PAUSED'}</span>
                                <Toggle enabled={discount.isActive} onChange={() => onToggleStatus(discount.id)} />
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <TagIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-black text-black dark:text-white italic uppercase tracking-tighter">No Active Offers</h3>
                    </div>
                )}
            </main>

            <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none">
                <button
                    onClick={onAddClick}
                    className="pointer-events-auto h-14 px-8 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.3)] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group"
                >
                    <AddIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-black text-xs uppercase tracking-[0.3em]">New Campaign</span>
                </button>
            </div>
        </div>
    );
};

export default DiscountManagementScreen;