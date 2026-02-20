import React, { useMemo, useState } from 'react';
import { Order, Product, Purchase } from '../types';
import BackIcon from '../components/icons/BackIcon';
import HomeIcon from '../components/icons/HomeIcon';
import InventoryIcon from '../components/icons/InventoryIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SearchIcon from '../components/icons/SearchIcon';
import CloseIcon from '../components/icons/CloseIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { shareOnWhatsApp } from '../utils/shareUtils';

interface StockReportScreenProps {
    orders: Order[];
    products: Product[];
    purchases: Purchase[];
    onBack: () => void;
    onHome?: () => void;
    onUpdateProducts?: (products: Product[]) => void;
}

const COLORS = ['#4B2A63', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1'];

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

    return (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-950 rounded-t-[48px] sm:rounded-[48px] w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="px-8 pt-10 pb-6 border-b dark:border-gray-900 shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">FISCAL COMMAND</p>
                            <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Mass Pricing</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 active:scale-90 transition-all"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 no-scrollbar">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Update Scope</p>
                        <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <button onClick={() => setMode('ALL')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all ${mode === 'ALL' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}>ALL PRODUCTS</button>
                            <button onClick={() => setMode('SELECT')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all ${mode === 'SELECT' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}>CUSTOM SELECTION</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adjustment Action</p>
                        <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <button onClick={() => setAction('INCREASE')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all ${action === 'INCREASE' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400'}`}>INCREASE PRICE</button>
                            <button onClick={() => setAction('DECREASE')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all ${action === 'DECREASE' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400'}`}>DECREASE PRICE</button>
                        </div>
                    </div>

                    {mode === 'SELECT' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Find product..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                {filteredProducts.map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => toggleProduct(p.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedIds.has(p.id) ? 'bg-black text-white border-black' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500'}`}
                                    >
                                        <span className="font-bold text-xs uppercase tracking-tight truncate pr-4">{p.name}</span>
                                        <span className="font-black italic text-[10px]">₹{p.price}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedIds.size} ITEMS SELECTED</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Calculation Method</p>
                            <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700">
                                <button onClick={() => setType('PERCENT')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all ${type === 'PERCENT' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}>%</button>
                                <button onClick={() => setType('AMOUNT')} className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all ${type === 'AMOUNT' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}>₹</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Value</p>
                            <input 
                                type="number" 
                                value={value} 
                                onChange={e => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                placeholder="0"
                                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-3xl py-4.5 px-6 font-black text-lg focus:ring-2 focus:ring-black outline-none text-black dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[32px] border border-blue-100 dark:border-blue-900/20">
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest text-center">
                            {action === 'INCREASE' ? 'Markup' : 'Markdown'} will be applied to the base rate. <br/> Changes are immediate and irreversible.
                        </p>
                    </div>
                </div>

                <footer className="px-8 pb-12 pt-4 bg-white dark:bg-gray-950 border-t dark:border-gray-900 shrink-0">
                    <button 
                        onClick={handleApply}
                        className={`w-full py-7 font-black rounded-[36px] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.4em] text-white ${action === 'INCREASE' ? 'bg-black dark:bg-white dark:text-black' : 'bg-red-600'}`}
                    >
                        Apply Price {action === 'INCREASE' ? 'Increase' : 'Decrease'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const StockReportScreen: React.FC<StockReportScreenProps> = ({ orders, products, purchases, onBack, onHome, onUpdateProducts }) => {
    const [isPriceAdjustOpen, setPriceAdjustOpen] = useState(false);
    
    const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

    const stockAnalytics = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayStart = new Date(todayStr + 'T00:00:00').getTime();
        const todayEnd = todayStart + 86400000;

        const todayOrders = orders.filter(o => o.timestamp >= todayStart && o.timestamp < todayEnd && o.status === 'Completed');
        let unitsSoldToday = 0;
        const itemFrequency: Record<string, number> = {};
        const categoryFrequency: Record<string, number> = {};

        todayOrders.forEach(order => {
            order.items.forEach(item => {
                unitsSoldToday += item.quantity;
                itemFrequency[item.product.name] = (itemFrequency[item.product.name] || 0) + item.quantity;
                const cat = item.product.category || 'General';
                categoryFrequency[cat] = (categoryFrequency[cat] || 0) + item.quantity;
            });
        });

        const mostSellingEntry = Object.entries(itemFrequency).sort((a, b) => b[1] - a[1])[0];
        const mostSellingProduct = mostSellingEntry ? { name: mostSellingEntry[0], qty: mostSellingEntry[1] } : null;

        const todayPurchases = purchases.filter(p => p.timestamp >= todayStart && p.timestamp < todayEnd);
        const purchaseSpendToday = todayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

        const lowStockThreshold = 10;
        const restockItems = products.filter(p => p.trackStock && (p.stock || 0) < lowStockThreshold).sort((a, b) => (a.stock || 0) - (b.stock || 0));

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const weeklyTrend = last7Days.map(dateStr => {
            const start = new Date(dateStr + 'T00:00:00').getTime();
            const end = start + 86400000;
            const dayOrders = orders.filter(o => o.timestamp >= start && o.timestamp < end && o.status === 'Completed');
            const dayUnits = dayOrders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
            return {
                name: new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short' }),
                units: dayUnits
            };
        });

        const catData = Object.entries(categoryFrequency).map(([name, value]) => ({ name, value }));

        return { unitsSoldToday, mostSellingProduct, purchaseSpendToday, restockItems, weeklyTrend, catData };
    }, [orders, products, purchases]);

    const handleDownloadReport = () => {
        const reportData = {
            date: new Date().toLocaleDateString(),
            dailyStats: { unitsSold: stockAnalytics.unitsSoldToday, topProduct: stockAnalytics.mostSellingProduct, purchaseSpend: stockAnalytics.purchaseSpendToday },
            criticalStock: stockAnalytics.restockItems.map(p => ({ name: p.name, stock: p.stock })),
            fullInventory: products.map(p => ({ name: p.name, stock: p.stock, category: p.category }))
        };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Stock-Report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShareLowStock = () => {
        if (stockAnalytics.restockItems.length === 0) return alert("Inventory optimized.");
        let message = `*OB Pro - Low Stock Alert*\nDate: ${new Date().toLocaleDateString()}\n\n`;
        stockAnalytics.restockItems.forEach(item => { message += `• ${item.name}: *${item.stock}* units\n`; });
        shareOnWhatsApp(message);
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFDFF] dark:bg-gray-950 transition-colors font-sans overflow-hidden">
            {isPriceAdjustOpen && (
                <BulkPriceAdjustModal 
                    products={products} 
                    onClose={() => setPriceAdjustOpen(false)} 
                    onApply={(updated) => onUpdateProducts?.(updated)}
                />
            )}
            
            <header className="px-6 pt-10 pb-6 shrink-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-600 dark:text-gray-400 active:scale-90 transition-all"><BackIcon className="w-6 h-6" /></button>
                    <h1 className="text-2xl font-black text-black dark:text-white tracking-tight italic uppercase leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1 font-black">Pro</span> Stock</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPriceAdjustOpen(true)} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30 active:scale-90 transition-all" title="Adjust Prices">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        {onHome && <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black transition-all shadow-sm"><HomeIcon className="w-6 h-6" /></button>}
                        <button onClick={handleDownloadReport} className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl active:scale-90 transition-all"><DownloadIcon className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">INVENTORY INTELLIGENCE</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10 no-scrollbar pb-32">
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-black dark:bg-white p-7 rounded-[40px] text-white dark:text-black shadow-2xl relative overflow-hidden flex flex-col justify-center border border-black dark:border-white">
                         <p className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em] mb-2">UNITS SOLD TODAY</p>
                         <h2 className="text-5xl font-black italic tracking-tighter leading-none">{stockAnalytics.unitsSoldToday}</h2>
                         <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-[32px] shadow-sm flex flex-col justify-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">TOP PRODUCT</p>
                            <h2 className="text-base font-black italic tracking-tighter leading-tight truncate">{stockAnalytics.mostSellingProduct?.name || 'NONE'}</h2>
                            <p className="text-[10px] font-bold text-blue-500 mt-1">{stockAnalytics.mostSellingProduct?.qty || 0} UNITS</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-[32px] shadow-sm flex flex-col justify-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">STOCK SPEND</p>
                            <h2 className="text-base font-black italic tracking-tighter leading-tight">{formatCurrency(stockAnalytics.purchaseSpendToday)}</h2>
                            <p className="text-[10px] font-bold text-orange-500 mt-1">CAPITAL OUT</p>
                        </div>
                    </div>
                </div>

                <section className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 text-center">Unit Sales Velocity (7D)</h3>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stockAnalytics.weeklyTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={10} fontStyle="italic" fontWeight="black" axisLine={false} tickLine={false} dy={10} />
                                <YAxis fontSize={10} fontStyle="italic" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} itemStyle={{ fontStyle: 'italic', fontWeight: 'black' }} />
                                <Line type="monotone" dataKey="units" stroke="#4B2A63" strokeWidth={4} dot={{ r: 4, fill: '#4B2A63' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="space-y-4 pb-12">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Critical Restock Alert</h3>
                        <button onClick={handleShareLowStock} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"><ShareIcon className="w-3.5 h-3.5" /> Share List</button>
                    </div>
                    <div className="space-y-3">
                        {stockAnalytics.restockItems.length > 0 ? stockAnalytics.restockItems.map(item => (
                            <div key={item.id} className="bg-white dark:bg-gray-900 p-5 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${item.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m0 10l8 4m0 0l8-4m-8 4V7" /></svg></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-black dark:text-white uppercase italic text-sm truncate leading-none mb-1.5">{item.name}</h4>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black italic leading-none ${item.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>{item.stock}</p>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">REMAINING</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-16 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] text-center opacity-30">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-relaxed">INVENTORY LEVELS OPTIMIZED.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default StockReportScreen;