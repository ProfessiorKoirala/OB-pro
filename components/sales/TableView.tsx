import React, { useState, useMemo } from 'react';
import { MainView, Table, Order, DeliveryPartner, OrderStatus } from '../../types';
import AddIcon from '../icons/AddIcon';
import TrashIcon from '../icons/TrashIcon';
import SearchIcon from '../icons/SearchIcon';
import { SalesSegment } from '../../screens/SalesScreen';
import DeliveryPartnerManager from '../delivery/DeliveryPartnerManager';
import AddPartnerModal from '../delivery/AddPartnerModal';
import HomeIcon from '../icons/HomeIcon';

const TableCard: React.FC<{ table: Table; onClick: () => void; onDelete: (e: React.MouseEvent) => void; isOccupied: boolean }> = ({ table, onClick, onDelete, isOccupied }) => {
    const tableNum = table.name.replace(/\D/g, '').padStart(2, '0');

    return (
        <button
            onClick={onClick}
            className={`relative group p-6 rounded-[40px] transition-all duration-500 active:scale-95 text-center w-full h-44 flex flex-col items-center justify-center gap-1 overflow-hidden border-2 ${
                isOccupied 
                ? 'bg-black dark:bg-white border-black dark:border-white shadow-[0_20px_50px_rgba(0,0,0,0.2)]' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'
            }`}
        >
            {/* Background Watermark */}
            <span className={`absolute -right-2 -bottom-4 text-[120px] font-black italic select-none transition-all duration-700 pointer-events-none ${
                isOccupied 
                ? 'text-white/5 dark:text-black/5 scale-110 -rotate-12' 
                : 'text-black/[0.02] dark:text-white/[0.02]'
            }`}>
                {tableNum}
            </span>

            <div className="relative z-10 flex flex-col items-center">
                 <div className={`mb-2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isOccupied ? 'bg-white/10 dark:bg-black/10' : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                    <svg className={`w-5 h-5 ${isOccupied ? 'text-white dark:text-black' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197"/>
                    </svg>
                </div>
                <h3 className={`text-3xl font-black italic uppercase tracking-tighter leading-none ${isOccupied ? 'text-white dark:text-black' : 'text-black dark:text-white'}`}>
                    T-{tableNum}
                </h3>
                <div className="flex items-center gap-1.5 mt-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-gray-200'}`}></div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${isOccupied ? 'text-white/60 dark:text-black/60' : 'text-gray-300'}`}>
                        {isOccupied ? 'Occupied' : 'Free'}
                    </span>
                </div>
            </div>

            <div 
                onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all active:scale-75 ${
                    isOccupied 
                    ? 'text-white/20 hover:text-white dark:text-black/20 dark:hover:text-black' 
                    : 'text-gray-200 hover:text-red-500'
                }`}
            >
                <TrashIcon className="w-4 h-4" />
            </div>
        </button>
    );
};

const TakeawayCard: React.FC<{ order: Order; onClick: () => void }> = ({ order, onClick }) => {
    const orderNum = order.id.slice(-4).toUpperCase();
    return (
        <button
            onClick={onClick}
            className="relative group p-6 rounded-[40px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all active:scale-95 text-center w-full h-44 flex flex-col items-center justify-center gap-1 overflow-hidden"
        >
            <span className="absolute -right-2 -bottom-4 text-[120px] font-black italic text-black/[0.02] dark:text-white/[0.02] select-none pointer-events-none">
                {orderNum}
            </span>
            <div className="relative z-10">
                <div className="mb-2 w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-black dark:text-white truncate max-w-[120px] mx-auto">
                    {order.customerName || 'Takeaway'}
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 italic">#{orderNum}</p>
                <p className="text-[12px] font-black text-primary dark:text-blue-400 uppercase tracking-widest mt-1">₹{(order.grandTotal || 0).toLocaleString()}</p>
            </div>
        </button>
    );
};

const OrderCard: React.FC<{ 
    order: Order; 
    onClick: () => void; 
    partnerName?: string;
    onStatusChange?: (status: OrderStatus) => void;
    showSwitcher?: boolean;
}> = ({ order, onClick, partnerName, onStatusChange, showSwitcher = true }) => {
    const orderNum = order.id.slice(-4).toUpperCase();
    const time = new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'Pending': return 'bg-gray-100 text-gray-500';
            case 'Processing': return 'bg-blue-100 text-blue-600';
            case 'Out for Delivery': return 'bg-orange-100 text-orange-600';
            case 'Completed': return 'bg-green-100 text-green-600';
            case 'Returned': return 'bg-purple-100 text-purple-600';
            case 'Cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-50 text-gray-400';
        }
    };

    const statuses: OrderStatus[] = ['Pending', 'Processing', 'Out for Delivery', 'Completed'];

    return (
        <div 
            onClick={onClick}
            className={`p-5 rounded-[40px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md flex flex-col gap-4 cursor-pointer active:scale-[0.99]`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 flex items-center justify-center shadow-inner">
                         <span className="font-black text-xs italic">{time}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">#{orderNum}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate max-w-[120px]">
                            {order.customerName || 'Walk-in'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-black text-sm text-black dark:text-white">₹{(order.grandTotal || 0).toLocaleString()}</p>
                    {partnerName && (
                        <span className="text-[7px] font-black bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 inline-block">{partnerName}</span>
                    )}
                </div>
            </div>

            {showSwitcher && (
                <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); onStatusChange?.(s); }}
                            className={`flex-1 py-2 rounded-xl text-[7px] font-black uppercase tracking-tighter transition-all ${
                                order.status === s 
                                ? 'bg-black text-white shadow-sm scale-105' 
                                : 'text-gray-300 hover:text-gray-500'
                            }`}
                        >
                            {s.replace('Out for ', '')}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="flex justify-between items-center px-1">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
                {!showSwitcher && (
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">TAP TO EDIT</span>
                )}
            </div>
        </div>
    );
};

interface TableViewProps {
    tables: Table[];
    onSelectTable: (table: Table) => void;
    onBack: () => void;
    onAddTableClick: () => void;
    onDeleteTable: (tableId: string) => void;
    onReprintLatestKot?: (tableId: string) => void;
    isKotEnabled?: boolean;
    isDesktop?: boolean;
    setCurrentView?: (view: MainView) => void;
    activeSegment: SalesSegment;
    setActiveSegment: (segment: SalesSegment) => void;
    pendingOrders: Order[];
    orders: Order[];
    onAddDeliveryOrder: () => void;
    onAddTakeawayOrder: () => void;
    onSelectExistingOrder: (order: Order) => void;
    deliveryPartners: DeliveryPartner[];
    onUpdateDeliveryPartners: (partners: DeliveryPartner[]) => void;
    onUpdateOrderStatus?: (id: string, status: OrderStatus) => void;
    onHome?: () => void;
    syncStatus?: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
    const { 
        tables, onSelectTable, onAddTableClick, onDeleteTable, 
        activeSegment, setActiveSegment, pendingOrders, orders,
        onAddDeliveryOrder, onAddTakeawayOrder, onSelectExistingOrder,
        deliveryPartners, onUpdateDeliveryPartners, onUpdateOrderStatus,
        onHome, syncStatus
    } = props;

    const [isPartnerManagerOpen, setIsPartnerManagerOpen] = useState(false);
    const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTables = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return tables;
        return tables.filter(t => t.name.toLowerCase().includes(query));
    }, [tables, searchQuery]);

    const deliveryList = useMemo(() => {
        const registered = orders.filter(o => o.type === 'Order');
        const registeredIds = new Set(registered.map(o => o.id));
        const uniquePending = pendingOrders.filter(o => o.type === 'Order' && !registeredIds.has(o.id));
        const combined = [...uniquePending, ...registered];
        
        const filtered = combined.filter(o => o.status !== 'Completed' && o.status !== 'Returned' && o.status !== 'Cancelled');
        
        const query = searchQuery.toLowerCase().trim();
        if (!query) return filtered.sort((a, b) => b.timestamp - a.timestamp);
        
        return filtered
            .filter(o => 
                o.customerName?.toLowerCase().includes(query) || 
                o.id.toLowerCase().includes(query) ||
                o.customerPhone?.includes(query)
            )
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [pendingOrders, orders, searchQuery]);

    const takeawayDrafts = useMemo(() => {
         const drafts = pendingOrders.filter(o => o.type === 'Takeaway');
         const query = searchQuery.toLowerCase().trim();
         if (!query) return drafts;
         return drafts.filter(o => 
            o.customerName?.toLowerCase().includes(query) || 
            o.id.toLowerCase().includes(query) ||
            o.customerPhone?.includes(query)
         );
    }, [pendingOrders, searchQuery]);

    const isTableOccupied = (tableId: string) => {
        const order = pendingOrders.find(o => o.tableId === tableId);
        return !!(order && order.items.length > 0);
    };

    const deliveryStats = useMemo(() => {
        const toCollect = (deliveryPartners || []).reduce((sum, p) => sum + p.balanceToCollect, 0);
        const toPay = (deliveryPartners || []).reduce((sum, p) => sum + p.balanceToPay, 0);
        return { toCollect, toPay };
    }, [deliveryPartners]);

    const getPartnerName = (id?: string) => {
        if (!id) return undefined;
        return deliveryPartners.find(p => p.id === id)?.name;
    };

    const handleAddPartner = (partner: Omit<DeliveryPartner, 'id' | 'totalOrdersHandled' | 'balanceToPay' | 'balanceToCollect'>) => {
        const newPartner: DeliveryPartner = {
            ...partner,
            id: `dp-${Date.now()}`,
            totalOrdersHandled: 0,
            balanceToPay: 0,
            balanceToCollect: 0
        };
        onUpdateDeliveryPartners([...deliveryPartners, newPartner]);
        setIsAddPartnerModalOpen(false);
    };

    return (
        <div className="bg-[#F8F9FB] dark:bg-gray-950 h-full font-sans overflow-hidden flex flex-col transition-colors">
            {isPartnerManagerOpen && (
                <DeliveryPartnerManager 
                    partners={deliveryPartners} 
                    onUpdate={onUpdateDeliveryPartners} 
                    onClose={() => setIsPartnerManagerOpen(false)} 
                />
            )}

            {isAddPartnerModalOpen && (
                <AddPartnerModal 
                    onClose={() => setIsAddPartnerModalOpen(false)} 
                    onSave={handleAddPartner} 
                />
            )}

            <header className="px-6 pt-12 pb-6 sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-20 shrink-0 border-b dark:border-gray-800">
                 <div className="flex items-center justify-between mb-8">
                    {!isSearchOpen ? (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-1.5">
                                 <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB Sales</h1>
                                 {syncStatus === 'Reloading from Cloud...' && (
                                    <div className="flex items-center gap-1 ml-1 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-[7px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Syncing</span>
                                    </div>
                                 )}
                            </div>
                            <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em] mt-2 italic leading-none">Terminal Control</p>
                        </div>
                    ) : (
                        <div className="flex-1 animate-scale-in mr-4">
                            <input 
                                autoFocus
                                type="text"
                                placeholder={`Search ${activeSegment.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner placeholder:text-gray-400 text-black dark:text-white"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {onHome && !isSearchOpen && (
                            <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                                <HomeIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                setIsSearchOpen(!isSearchOpen);
                                if (isSearchOpen) setSearchQuery('');
                            }}
                            className={`p-3 rounded-2xl active:scale-90 transition-all ${isSearchOpen ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-50 dark:bg-gray-800 text-black dark:text-white'}`}
                        >
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'TABLES', label: 'Dine-In' },
                        { id: 'DELIVERY', label: 'Delivery' },
                        { id: 'TAKEAWAY', label: 'Takeaway' }
                    ].map(seg => (
                        <button 
                            key={seg.id} 
                            onClick={() => setActiveSegment(seg.id as SalesSegment)}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeSegment === seg.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400'
                            }`}
                        >
                            {seg.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 no-scrollbar" style={{ touchAction: 'pan-y' }}>
                {activeSegment === 'DELIVERY' && (
                    <section className="mt-8 mb-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-[32px] border border-green-100 dark:border-green-900/20">
                                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">TO COLLECT</p>
                                <p className="text-xl font-black text-green-600 italic leading-none">₹{deliveryStats.toCollect.toLocaleString()}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[32px] border border-red-100 dark:border-red-900/20">
                                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">TO PAY</p>
                                <p className="text-xl font-black text-red-600 italic leading-none">₹{deliveryStats.toPay.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mb-8">
                            <button 
                                onClick={() => setIsPartnerManagerOpen(true)}
                                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a6 6 0 00-9-5.197" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                Manage OB Partners
                            </button>
                            <button 
                                onClick={() => setIsAddPartnerModalOpen(true)}
                                className="w-full py-4 bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest italic shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <AddIcon className="w-4 h-4 text-gray-400" /> 
                                <span className="text-gray-500">Quick Add Partner</span>
                            </button>
                        </div>
                    </section>
                )}

                {activeSegment === 'TABLES' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8 animate-fade-in pb-40">
                        {filteredTables.map(table => (
                            <TableCard 
                                key={table.id} 
                                table={table} 
                                isOccupied={isTableOccupied(table.id)}
                                onClick={() => onSelectTable(table)}
                                onDelete={(e) => { e.stopPropagation(); onDeleteTable(table.id); }}
                            />
                        ))}
                        {!searchQuery && (
                            <button 
                                onClick={onAddTableClick}
                                className="p-5 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3 group hover:border-black dark:hover:border-white transition-all h-44"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white transition-all shadow-sm">
                                    <AddIcon className="w-6 h-6" />
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">New Table</span>
                            </button>
                        )}
                    </div>
                )}

                {activeSegment === 'DELIVERY' && (
                    <div className="space-y-4 animate-fade-in pb-40">
                        <div className="flex justify-between items-center mb-2 px-1">
                             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Active Shipments</h3>
                             <button onClick={onAddDeliveryOrder} className="text-[9px] font-black text-blue-600 uppercase underline underline-offset-4 tracking-widest">+ NEW ORDER</button>
                        </div>
                        {deliveryList.length > 0 ? deliveryList.map(order => (
                            <OrderCard 
                                key={order.id} 
                                order={order} 
                                partnerName={getPartnerName(order.deliveryPartnerId)}
                                onClick={() => onSelectExistingOrder(order)}
                                onStatusChange={(s) => onUpdateOrderStatus?.(order.id, s)}
                            />
                        )) : (
                            <div className="py-20 text-center opacity-30">
                                <p className="text-[10px] font-black uppercase tracking-widest italic">No active deliveries</p>
                            </div>
                        )}
                    </div>
                )}

                {activeSegment === 'TAKEAWAY' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8 animate-fade-in pb-40">
                        {takeawayDrafts.map(order => (
                            <TakeawayCard 
                                key={order.id} 
                                order={order} 
                                onClick={() => onSelectExistingOrder(order)}
                            />
                        ))}
                        <button 
                            onClick={onAddTakeawayOrder}
                            className="p-5 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3 group hover:border-black dark:hover:border-white transition-all h-44"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white transition-all shadow-sm">
                                <AddIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">New Takeaway</span>
                        </button>
                    </div>
                )}
            </main>
            
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default TableView;