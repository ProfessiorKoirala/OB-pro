import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Order, OrderItem, Product } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import AddProductModal from '../sales/AddProductModal';
import TrashIcon from '../icons/TrashIcon';

interface ReturnManagerModalProps {
    order: Order;
    onClose: () => void;
    onProcess: (updatedItems: OrderItem[], financialAdjustment: number, newStatus: any, newLogistics: { date: string, time: string, newFee: number }) => void;
    products: Product[];
}

const ReturnManagerModal: React.FC<ReturnManagerModalProps> = ({ order, onClose, onProcess, products }) => {
    // Unit-level state for original items
    const [returnedUnits, setReturnedUnits] = useState<Record<string, number>>({});
    const [exchangedUnits, setExchangedUnits] = useState<Record<string, number>>({});
    
    // Replacement items (Different products)
    const [replacements, setReplacements] = useState<OrderItem[]>([]);
    const [isSearchingProduct, setIsSearchingProduct] = useState(false);
    
    // Exchange logistics
    const [chargeRedelivery, setChargeRedelivery] = useState(false);
    const [redeliveryFee, setRedeliveryFee] = useState(order.deliveryFee || 0);
    const [estDate, setEstDate] = useState(new Date().toISOString().split('T')[0]);
    const [estTime, setEstTime] = useState('12:00');

    const stats = useMemo(() => {
        let returnValue = 0;
        let totalReturned = 0;
        let totalExchanged = 0;

        order.items.forEach(item => {
            const rQty = returnedUnits[item.product.id] || 0;
            const eQty = exchangedUnits[item.product.id] || 0;
            
            returnValue += item.product.price * (rQty + eQty);
            totalReturned += rQty;
            totalExchanged += eQty;
        });

        const replacementValue = replacements.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const newFeeAmt = chargeRedelivery ? redeliveryFee : 0;
        
        // netAdjustment: Total we collect (+) or total we refund (-)
        const netAdjustment = (replacementValue + newFeeAmt) - returnValue;

        return { netAdjustment, totalReturned, totalExchanged, returnValue, replacementValue, newFeeAmt };
    }, [returnedUnits, exchangedUnits, order.items, replacements, chargeRedelivery, redeliveryFee]);

    const handleUpdateUnits = (productId: string, type: 'RETURN' | 'EXCHANGE', delta: number, max: number) => {
        const setter = type === 'RETURN' ? setReturnedUnits : setExchangedUnits;
        const otherVal = (type === 'RETURN' ? exchangedUnits : returnedUnits)[productId] || 0;
        
        setter(prev => {
            const current = prev[productId] || 0;
            const next = Math.max(0, Math.min(max - otherVal, current + delta));
            return { ...prev, [productId]: next };
        });
    };

    const handleAddReplacement = (product: Product) => {
        setReplacements(prev => {
            const existing = prev.find(p => p.product.id === product.id);
            if (existing) {
                return prev.map(p => p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { product, quantity: 1, status: 'Replacement' }];
        });
    };

    const handleRemoveReplacement = (productId: string) => {
        setReplacements(prev => prev.filter(p => p.product.id !== productId));
    };

    const handleConfirm = () => {
        // Original items updated with reduced billed counts
        const updatedOriginals: OrderItem[] = order.items.map(item => ({
            ...item,
            returnedQuantity: (item.returnedQuantity || 0) + (returnedUnits[item.product.id] || 0),
            exchangedQuantity: (item.exchangedQuantity || 0) + (exchangedUnits[item.product.id] || 0),
        }));

        // Combine with new replacements
        const finalItemsList = [...updatedOriginals, ...replacements];

        // If there are replacements or exchange items, we need redelivery, so set to 'Pending'
        // This ensures it appears in the Tracker/Fleet views.
        // Otherwise, if it was just a return with no new load, set to 'Completed'.
        const newStatus = (replacements.length > 0 || stats.totalExchanged > 0) ? 'Pending' : 'Completed';

        onProcess(
            finalItemsList, 
            stats.netAdjustment, 
            newStatus,
            { date: estDate, time: estTime, newFee: stats.newFeeAmt }
        );
    };

    const formatCurrency = (val: number) => `₹${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center font-sans animate-fade-in" 
            onClick={handleBackdropClick}
        >
            {isSearchingProduct && (
                <AddProductModal 
                    products={products} 
                    orderItems={replacements} 
                    onAddProduct={handleAddReplacement} 
                    onClose={(e) => {
                        e?.stopPropagation();
                        setIsSearchingProduct(false);
                    }} 
                />
            )}

            <div className="bg-white dark:bg-gray-950 rounded-t-[48px] sm:rounded-[48px] shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="px-8 pt-8 pb-6 flex justify-between items-start border-b dark:border-gray-800 shrink-0">
                    <div>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Adjustment</h2>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Reversal & Replacement Terminal</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-6 space-y-10 no-scrollbar">
                    {/* Step 1: Handle Original Returns */}
                    <section className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Original Items (Incoming)</p>
                        {order.items.filter(i => i.status === 'Active' || !i.status).map(item => {
                            const rQty = returnedUnits[item.product.id] || 0;
                            const eQty = exchangedUnits[item.product.id] || 0;
                            const available = item.quantity - (item.returnedQuantity || 0) - (item.exchangedQuantity || 0);

                            if (available <= 0) return null;

                            return (
                                <div key={item.product.id} className="p-5 rounded-[32px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-black text-black dark:text-white italic uppercase truncate">{item.product.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{available} units available to reverse</p>
                                        </div>
                                        <p className="font-black text-black dark:text-white italic">₹{item.product.price}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white dark:bg-black/20 p-3 rounded-2xl border dark:border-gray-800">
                                            <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-2 text-center">RETURN FOR REFUND</p>
                                            <div className="flex items-center justify-between">
                                                <button onClick={() => handleUpdateUnits(item.product.id, 'RETURN', -1, available)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-black text-black dark:text-white">-</button>
                                                <span className="font-black italic text-red-600">{rQty}</span>
                                                <button onClick={() => handleUpdateUnits(item.product.id, 'RETURN', 1, available)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-black text-black dark:text-white">+</button>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-black/20 p-3 rounded-2xl border dark:border-gray-800">
                                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-2 text-center">EXCHANGE CREDIT</p>
                                            <div className="flex items-center justify-between">
                                                <button onClick={() => handleUpdateUnits(item.product.id, 'EXCHANGE', -1, available)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-black text-black dark:text-white">-</button>
                                                <span className="font-black italic text-blue-600">{eQty}</span>
                                                <button onClick={() => handleUpdateUnits(item.product.id, 'EXCHANGE', 1, available)} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 font-black text-black dark:text-white">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    {/* Step 2: Handle Replacements */}
                    <section className="space-y-4">
                         <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Replacement Items (Outgoing)</p>
                            <button 
                                onClick={() => setIsSearchingProduct(true)}
                                className="text-[10px] font-black text-blue-600 uppercase underline underline-offset-4 tracking-widest"
                            >+ Add Item</button>
                        </div>
                        
                        <div className="space-y-2">
                            {replacements.map(item => (
                                <div key={item.product.id} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-black dark:text-white text-sm italic uppercase truncate">{item.product.name}</h4>
                                        <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">{item.quantity} x ₹{item.product.price}</p>
                                    </div>
                                    <button onClick={() => handleRemoveReplacement(item.product.id)} className="p-2 text-red-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {replacements.length === 0 && (
                                <div className="p-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[32px] text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">No replacements selected</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Step 3: Logistics for Exchange - Fixed Mobile Fit */}
                    {(stats.totalExchanged > 0 || replacements.length > 0) && (
                        <section className="animate-fade-in space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Redelivery Schedule</h3>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-[36px] border border-gray-100 dark:border-gray-800 space-y-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Delivery Fee</p>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={redeliveryFee} 
                                            onChange={e => setRedeliveryFee(parseFloat(e.target.value) || 0)}
                                            className={`w-16 py-2 text-center bg-white dark:bg-gray-800 rounded-xl font-black text-xs outline-none border ${chargeRedelivery ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                                        />
                                        <button 
                                            onClick={() => setChargeRedelivery(!chargeRedelivery)}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${chargeRedelivery ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            {chargeRedelivery ? 'ACTIVE' : 'WAIVE'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">EST. DATE</p>
                                        <input 
                                            type="date" 
                                            value={estDate} 
                                            onChange={e => setEstDate(e.target.value)}
                                            className="w-full bg-white dark:bg-gray-800 rounded-xl py-2 px-3 text-[11px] font-black uppercase outline-none shadow-inner border border-gray-100 dark:border-gray-700"
                                            style={{ colorScheme: 'light' }}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">EST. TIME</p>
                                        <input 
                                            type="time" 
                                            value={estTime} 
                                            onChange={e => setEstTime(e.target.value)}
                                            className="w-full bg-white dark:bg-gray-800 rounded-xl py-2 px-3 text-[11px] font-black uppercase outline-none shadow-inner border border-gray-100 dark:border-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <footer className="px-8 pb-10 pt-4 shrink-0 bg-white dark:bg-gray-950 border-t dark:border-gray-900">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <div className="leading-none">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">IMPACT</p>
                            {stats.netAdjustment < 0 ? (
                                <p className="text-2xl font-black text-red-600 italic">REFUND: {formatCurrency(stats.netAdjustment)}</p>
                            ) : stats.netAdjustment > 0 ? (
                                <p className="text-2xl font-black text-green-600 italic">COLLECT: {formatCurrency(stats.netAdjustment)}</p>
                            ) : (
                                <p className="text-2xl font-black text-gray-400 italic">NO CHANGE</p>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={handleConfirm}
                        disabled={stats.totalReturned === 0 && stats.totalExchanged === 0 && replacements.length === 0}
                        className="w-full py-7 bg-black dark:bg-white text-white dark:text-black font-black rounded-[32px] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.5em] disabled:opacity-10"
                    >
                        Process Adjustments
                    </button>
                </footer>
            </div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>,
        document.body
    );
};

export default ReturnManagerModal;