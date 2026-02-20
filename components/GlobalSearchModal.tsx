
import React, { useState, useMemo } from 'react';
import { Product, Order, Expense } from '../types';
import SearchIcon from './icons/SearchIcon';
import CloseIcon from './icons/CloseIcon';

interface GlobalSearchModalProps {
    onClose: () => void;
    products: Product[];
    orders: Order[];
    expenses: Expense[];
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose, products, orders, expenses }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const results = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return { products: [], orders: [], expenses: [] };

        return {
            products: products.filter(p => p.name.toLowerCase().includes(term) || (p.category && p.category.toLowerCase().includes(term))).slice(0, 5),
            orders: orders.filter(o => 
                o.id.toLowerCase().includes(term) || 
                (o.customerName && o.customerName.toLowerCase().includes(term)) ||
                o.items.some(i => i.product.name.toLowerCase().includes(term))
            ).slice(0, 5),
            expenses: expenses.filter(e => e.title.toLowerCase().includes(term) || (e.category && e.category.toLowerCase().includes(term))).slice(0, 5),
        };
    }, [searchTerm, products, orders, expenses]);

    const hasResults = results.products.length > 0 || results.orders.length > 0 || results.expenses.length > 0;

    return (
        <div className="flex flex-col h-full overflow-hidden font-sans">
            {/* Search Header */}
            <header className="px-6 py-4 flex items-center gap-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b dark:border-gray-800 transition-colors shrink-0">
                <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search items, sales, or bills..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl py-3 pl-12 pr-12 text-black dark:text-white font-bold tracking-tight focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner placeholder:text-gray-400"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500"
                        >
                            <CloseIcon className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <button 
                    onClick={onClose} 
                    className="text-xs font-black text-primary dark:text-white uppercase tracking-widest shrink-0"
                >
                    Done
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-6 space-y-10 no-scrollbar">
                {!searchTerm ? (
                    <div className="text-center py-20 opacity-30">
                        <div className="bg-gray-50 dark:bg-gray-800 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <SearchIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Business Scan</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Find any record instantly</p>
                    </div>
                ) : !hasResults ? (
                    <div className="text-center py-20 opacity-30">
                        <p className="font-black text-lg text-black dark:text-white italic uppercase tracking-tighter">No matches for "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {results.products.length > 0 && (
                            <section>
                                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Inventory</h3>
                                <div className="space-y-2">
                                    {results.products.map(p => (
                                        <div key={p.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-[24px] flex justify-between items-center border border-gray-100 dark:border-gray-700">
                                            <div>
                                                <p className="font-black text-black dark:text-white uppercase italic text-sm">{p.name}</p>
                                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{p.category || 'General'}</p>
                                            </div>
                                            <p className="font-black text-black dark:text-white">₹{p.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {results.orders.length > 0 && (
                            <section>
                                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Recent Sales</h3>
                                <div className="space-y-2">
                                    {results.orders.map(o => (
                                        <div key={o.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-[24px] border border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="font-black text-black dark:text-white uppercase italic text-sm">#{o.id.slice(-6).toUpperCase()}</p>
                                                <p className="font-black text-black dark:text-white">₹{o.grandTotal}</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{o.customerName || 'Walk-in'} • {new Date(o.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GlobalSearchModal;
