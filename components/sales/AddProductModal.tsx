import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Product, OrderItem, Discount } from '../../types';
import BackIcon from '../icons/BackIcon';

interface AddProductModalProps {
    products: Product[];
    orderItems: OrderItem[];
    onAddProduct: (product: Product) => void;
    onClose: (e?: React.MouseEvent) => void;
    discounts?: Discount[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ products, orderItems, onAddProduct, onClose, discounts = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredProducts = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return products.slice(0, 50);
        return products.filter(p => 
            p.name.toLowerCase().includes(term) || 
            (p.category && p.category.toLowerCase().includes(term))
        );
    }, [products, searchTerm]);
    
    const getItemQuantity = (productId: string) => {
        return orderItems.find(i => i.product.id === productId)?.quantity || 0;
    };

    return createPortal(
        <div className="fixed inset-0 bg-white dark:bg-gray-950 z-[9999] flex flex-col h-screen font-sans animate-fade-in transition-colors overflow-hidden" onClick={e => e.stopPropagation()}>
            <header className="px-6 pt-12 pb-4 shrink-0 flex flex-col gap-6 bg-white dark:bg-gray-950">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-[20px] text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-800">
                        <BackIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Catalog</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1 italic">Select Items</p>
                    </div>
                </div>

                <div className="relative px-1">
                    <input 
                        ref={inputRef}
                        autoFocus
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner placeholder:text-gray-400 text-black dark:text-white"
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black dark:text-white opacity-40">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar pb-32">
                <div className="space-y-2">
                    {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                        const quantityInBasket = getItemQuantity(product.id);
                        const isOutOfStock = product.trackStock && (product.stock || 0) <= 0;
                        const isLimitReached = product.trackStock && quantityInBasket >= (product.stock || 0);

                        return (
                            <button 
                                key={product.id} 
                                onClick={() => !(isOutOfStock || isLimitReached) && onAddProduct(product)}
                                disabled={isOutOfStock || isLimitReached}
                                className={`w-full p-5 rounded-[28px] border text-left transition-all flex items-center justify-between gap-4 ${
                                    isOutOfStock || isLimitReached
                                    ? 'bg-gray-100 dark:bg-gray-900 border-gray-100 opacity-50 grayscale cursor-not-allowed'
                                    : quantityInBasket > 0 
                                      ? 'bg-black text-white border-black shadow-lg active:scale-[0.98]' 
                                      : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-gray-200 dark:hover:border-gray-700 active:scale-[0.98]'
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-black text-lg italic uppercase tracking-tight truncate leading-none mb-1.5 ${quantityInBasket > 0 ? 'text-white' : 'text-black dark:text-white'}`}>
                                        {product.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${quantityInBasket > 0 ? 'text-white/60' : 'text-gray-400'}`}>
                                            {product.category || 'GENERAL'} • ₹{product.price}
                                        </p>
                                        {(isOutOfStock || isLimitReached) && (
                                            <span className="text-[8px] font-black bg-red-500 text-white px-2 py-0.5 rounded italic uppercase tracking-tighter shadow-sm">
                                                {isOutOfStock ? 'Out of Order' : 'Limit Reached'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {isOutOfStock || isLimitReached ? (
                                    <div className="p-2 text-red-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                    </div>
                                ) : quantityInBasket > 0 ? (
                                    <div className="bg-white text-black w-8 h-8 rounded-xl flex items-center justify-center font-black italic text-xs shadow-sm animate-scale-in">
                                        {quantityInBasket}
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                                    </div>
                                )}
                            </button>
                        );
                    }) : (
                        <div className="text-center py-24 opacity-20">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-black dark:text-white">Empty Catalog</h3>
                        </div>
                    )}
                </div>
            </main>

            <footer className="p-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t dark:border-gray-900 shrink-0 z-20 flex gap-3">
                <button onClick={(e) => onClose(e)} className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-black rounded-[28px] text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all">
                    Discard
                </button>
                <button onClick={(e) => onClose(e)} className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[28px] text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                    Save Selection
                </button>
            </footer>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>,
        document.body
    );
};

export default AddProductModal;