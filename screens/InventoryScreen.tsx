import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Product, BusinessProfile } from '../types';
import AddIcon from '../components/icons/AddIcon';
import HomeIcon from '../components/icons/HomeIcon';
import SearchIcon from '../components/icons/SearchIcon';
import CloseIcon from '../components/icons/CloseIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ConfirmationModal from '../components/ConfirmationModal';

interface InventoryScreenProps {
    products: Product[];
    onAddProductClick: () => void;
    onEditProductClick: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onToggleQuickAdd: (productId: string) => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
    onUpdateProducts?: (products: Product[]) => void;
    onDeleteProducts?: (productIds: string[]) => void;
}

const PriceAdjustIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const BulkPriceAdjustModal: React.FC<{
    products: Product[];
    onClose: () => void;
    onApply: (updatedProducts: Product[]) => void;
}> = ({ products, onClose, onApply }) => {
    const [mode, setMode] = useState<'ALL' | 'SELECT'>('ALL');
    const [action, setAction] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
    const [type, setType] = useState<'PERCENT' | 'AMOUNT'>('PERCENT');
    const [value, setValue] = useState<number | ''>('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const toggleProduct = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleApply = () => {
        if (value === '' || value <= 0) return alert("Enter a valid adjustment value.");
        
        const updated = products.map(p => {
            const shouldUpdate = mode === 'ALL' || selectedIds.has(p.id);
            if (!shouldUpdate) return p;

            const changeAmount = type === 'PERCENT' ? (p.price * (value / 100)) : value;
            const newPrice = action === 'INCREASE' ? (p.price + changeAmount) : (p.price - changeAmount);
            
            return { ...p, price: Math.max(0, Math.round(newPrice * 100) / 100) };
        });

        onApply(updated);
        onClose();
    };

    // Use Portals to ensure the modal is outside of the transformed parent container
    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-950 rounded-t-[48px] sm:rounded-[48px] w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden shadow-2xl animate-slide-up transition-colors" 
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 mb-2 shrink-0 sm:hidden"></div>
                
                <header className="px-8 pt-6 pb-4 border-b dark:border-gray-900 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">FISCAL COMMAND</p>
                            <h2 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Mass Pricing</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-900 rounded-2xl text-gray-400 active:scale-90 transition-all">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Scope</p>
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800">
                            <button onClick={() => setMode('ALL')} className={`flex-1 py-3.5 text-[9px] font-black rounded-2xl transition-all ${mode === 'ALL' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}>ENTIRE CATALOG</button>
                            <button onClick={() => setMode('SELECT')} className={`flex-1 py-3.5 text-[9px] font-black rounded-2xl transition-all ${mode === 'SELECT' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}>MANUAL SELECTION</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Direction</p>
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800">
                            <button onClick={() => setAction('INCREASE')} className={`flex-1 py-3.5 text-[9px] font-black rounded-2xl transition-all ${action === 'INCREASE' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400'}`}>MARKUP (+)</button>
                            <button onClick={() => setAction('DECREASE')} className={`flex-1 py-3.5 text-[9px] font-black rounded-2xl transition-all ${action === 'DECREASE' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400'}`}>MARKDOWN (-)</button>
                        </div>
                    </div>

                    {mode === 'SELECT' && (
                        <div className="animate-fade-in space-y-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800">
                            <div className="relative">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Filter product list..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-black dark:focus:ring-white outline-none shadow-sm"
                                />
                            </div>
                            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                {filteredProducts.map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => toggleProduct(p.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedIds.has(p.id) ? 'bg-black text-white border-black' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-500'}`}
                                    >
                                        <span className="font-bold text-[11px] uppercase tracking-tight truncate pr-4">{p.name}</span>
                                        <span className="font-black italic text-[10px]">₹{p.price}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-[9px] font-black text-blue-500 uppercase tracking-widest">{selectedIds.size} ITEMS TARGETED</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Method</p>
                            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-[20px] border border-gray-100 dark:border-gray-800">
                                <button onClick={() => setType('PERCENT')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${type === 'PERCENT' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}>%</button>
                                <button onClick={() => setType('AMOUNT')} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${type === 'AMOUNT' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}>₹</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Value</p>
                            <input 
                                type="number" 
                                value={value} 
                                onChange={e => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                placeholder="0"
                                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-[20px] py-3.5 px-6 font-black text-lg focus:ring-2 focus:ring-black outline-none shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[40px] border border-blue-100 dark:border-blue-900/20">
                        <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] text-center leading-relaxed">
                            IMPACT: {mode === 'ALL' ? 'ENTIRE CATALOG' : `${selectedIds.size} TARGETS`}. <br/> CHANGES ARE LIVE & IRREVERSIBLE.
                        </p>
                    </div>
                </div>

                <footer className="px-8 pb-12 pt-4 bg-white dark:bg-gray-950 border-t dark:border-gray-900 shrink-0">
                    <button 
                        onClick={handleApply}
                        className={`w-full py-7 font-black rounded-[40px] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.4em] text-white ${action === 'INCREASE' ? 'bg-black dark:bg-white dark:text-black' : 'bg-red-600'}`}
                    >
                        Process Batch Update
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};

const InventoryScreen: React.FC<InventoryScreenProps> = ({ products, onAddProductClick, onEditProductClick, onDeleteProduct, onDeleteProducts, onHome, onUpdateProducts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isPriceAdjustOpen, setPriceAdjustOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
        if (!searchTerm) return sorted;
        return sorted.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const handleBulkDelete = () => {
        const idsToDelete = Array.from(selectedIds);
        if (onDeleteProducts) {
            onDeleteProducts(idsToDelete);
        } else {
            idsToDelete.forEach(id => onDeleteProduct(id));
        }
        setSelectedIds(new Set());
        setDeleteConfirmOpen(false);
    };

    const handleBulkPriceUpdate = (updatedProducts: Product[]) => {
        onUpdateProducts?.(updatedProducts);
        setSelectedIds(new Set());
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors font-sans overflow-hidden">
            {isPriceAdjustOpen && (
                <BulkPriceAdjustModal 
                    products={products} 
                    onClose={() => setPriceAdjustOpen(false)} 
                    onApply={handleBulkPriceUpdate}
                />
            )}

            {isDeleteConfirmOpen && (
                <ConfirmationModal 
                    title="Bulk Deletion"
                    message={`Are you sure you want to permanently remove ${selectedIds.size} items? This cannot be reversed.`}
                    onConfirm={handleBulkDelete}
                    onCancel={() => setDeleteConfirmOpen(false)}
                    confirmText="Delete Selection"
                    confirmButtonClass="bg-red-600 text-white"
                />
            )}

            <header className="px-6 pt-12 pb-4 shrink-0 bg-white dark:bg-gray-950 z-20">
                <div className="flex items-center justify-between">
                    {!isSearching ? (
                        <>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-2xl font-black text-black dark:text-white tracking-tighter italic uppercase leading-none">
                                    OB <span className="text-gray-400 dark:text-gray-600 uppercase">Pro</span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-1">
                                {selectedIds.size > 0 ? (
                                    <div className="flex items-center gap-1 animate-fade-in bg-gray-50 dark:bg-gray-900 p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <button 
                                            onClick={() => setPriceAdjustOpen(true)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
                                            title="Mass Price Adjustment"
                                        >
                                            <PriceAdjustIcon className="w-6 h-6" />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteConfirmOpen(true)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                                            title="Delete Selected"
                                        >
                                            <TrashIcon className="w-6 h-6" />
                                        </button>
                                        <button 
                                            onClick={() => setSelectedIds(new Set())}
                                            className="p-2 text-gray-400 active:scale-90"
                                        >
                                            <CloseIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => setIsSearching(true)}
                                            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-all active:scale-90"
                                            aria-label="Search"
                                        >
                                            <SearchIcon className="w-6 h-6" />
                                        </button>
                                        <button 
                                            onClick={onAddProductClick}
                                            className="p-2 text-black dark:text-white hover:text-blue-600 transition-all active:scale-90"
                                            aria-label="Add Product"
                                        >
                                            <AddIcon className="w-6 h-6" />
                                        </button>
                                        {onHome && (
                                            <button 
                                                onClick={onHome} 
                                                className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-all active:scale-90"
                                                aria-label="Go Home"
                                            >
                                                <HomeIcon className="w-6 h-6" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center w-full gap-4 animate-fade-in">
                            <div className="relative flex-1">
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Find product..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-3.5 px-6 text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white"
                                />
                            </div>
                            <button 
                                onClick={() => { setIsSearching(false); setSearchTerm(''); }}
                                className="p-2 text-gray-400 active:scale-90"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex flex-col items-start">
                    <h2 className="text-7xl font-handwriting text-blue-600 dark:text-blue-500 leading-none -rotate-1 select-none pointer-events-none drop-shadow-sm">
                        Inventory
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.6em] mt-3 ml-1 italic leading-none">Product Catalog</p>
                </div>
            </header>

            <div className="px-8 mt-6 mb-2 flex items-center shrink-0 border-b-2 border-gray-100 dark:border-gray-900 pb-4">
                <button onClick={toggleSelectAll} className="w-6 h-6 rounded-md border-2 border-gray-200 dark:border-gray-800 mr-4 flex items-center justify-center transition-all active:scale-90">
                    {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 && <div className="w-3 h-3 bg-black dark:bg-white rounded-sm animate-scale-in" />}
                </button>
                <span className="flex-[3] text-[11px] font-black text-black dark:text-gray-400 uppercase tracking-widest">Description</span>
                <span className="flex-1 text-center text-[11px] font-black text-black dark:text-gray-400 uppercase tracking-widest">Qty</span>
                <span className="flex-1 text-right text-[11px] font-black text-black dark:text-gray-400 uppercase tracking-widest">Price</span>
            </div>

            <main className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar" style={{ touchAction: 'pan-y' }}>
                <div className="divide-y divide-gray-50 dark:divide-gray-900">
                    {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                        const isSelected = selectedIds.has(product.id);
                        return (
                            <div 
                                key={product.id} 
                                className={`w-full py-6 px-2 flex items-center group transition-all duration-300 ${isSelected ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                            >
                                <button 
                                    onClick={() => toggleSelection(product.id)}
                                    className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center transition-all active:scale-90 ${isSelected ? 'bg-black dark:bg-white border-black dark:border-white shadow-md' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
                                >
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-white dark:text-black animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                                            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </button>

                                <button 
                                    onClick={() => isSelected ? toggleSelection(product.id) : onEditProductClick(product)}
                                    className="flex-1 flex items-center text-left transition-opacity active:opacity-60"
                                >
                                    <div className="flex-[3] min-w-0 pr-4">
                                        <h3 className="text-[18px] font-black text-black dark:text-white uppercase italic tracking-tighter leading-tight truncate group-hover:translate-x-1 transition-transform">
                                            {product.name}
                                        </h3>
                                        <p className="text-[8px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest mt-1 italic">Registry Entry</p>
                                    </div>
                                    
                                    <div className="flex-1 text-center">
                                        <span className="text-[20px] font-black text-blue-600 dark:text-blue-500 italic tracking-tighter">
                                            {product.trackStock ? (product.stock || 0) : '∞'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 text-right">
                                        <span className="text-[20px] font-black text-red-500 dark:text-red-400 italic tracking-tighter leading-none">
                                            {Math.round(product.price).toLocaleString()}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center py-40 text-center opacity-10">
                            <svg className="w-20 h-20 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 10l8 4m0 0l8-4m-8 4V7" strokeWidth="1.5"/></svg>
                            <p className="text-2xl font-black italic uppercase tracking-tighter text-black dark:text-white">
                                Registry Clear
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes scale-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default InventoryScreen;