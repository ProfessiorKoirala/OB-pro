import React, { useState, useMemo } from 'react';
import { Tracker, Order, BusinessProfile, OrderStatus, Product, OrderItem } from '../types';
import BackIcon from '../components/icons/BackIcon';
import AddIcon from '../components/icons/AddIcon';
import TrackerDetailModal from '../components/tracker/TrackerDetailModal';
import AddTrackerModal from '../components/tracker/AddTrackerModal';
import TodayDeliveryListModal from '../components/tracker/TodayDeliveryListModal';
import TruckIcon from '../components/icons/TruckIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import RefundIcon from '../components/icons/RefundIcon';
import HomeIcon from '../components/icons/HomeIcon';
import ReturnManagerModal from '../components/orders/ReturnManagerModal';

interface TrackerScreenProps {
    trackers: Tracker[];
    orders: Order[];
    products: Product[];
    onBack: () => void;
    onAddTracker: (tracker: Omit<Tracker, 'id'>) => void;
    onUpdateTracker: (tracker: Tracker) => void;
    onDeleteTracker: (id: string) => void;
    onRecordExpense: (title: string, amount: number, category: string) => void;
    onRescheduleOrder: (orderId: string, newDate: string) => void;
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
    onProcessAdvancedReturn?: (orderId: string, updatedItems: OrderItem[], refundAmount: number, newStatus: any, logistics: { date: string, time: string, newFee: number }) => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const TrackerScreen: React.FC<TrackerScreenProps> = ({ trackers, orders, products, onBack, onAddTracker, onUpdateTracker, onDeleteTracker, onRecordExpense, onRescheduleOrder, onUpdateStatus, onProcessAdvancedReturn, businessProfile, onHome }) => {
    const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isManifestOpen, setManifestOpen] = useState(false);
    const [rescheduleOrderId, setRescheduleOrderId] = useState<string | null>(null);
    const [returningOrder, setReturningOrder] = useState<Order | null>(null);

    const todayObj = new Date();
    todayObj.setHours(0,0,0,0);
    const todayStr = todayObj.toISOString().split('T')[0];
    
    const tomorrowObj = new Date(todayObj);
    tomorrowObj.setDate(todayObj.getDate() + 1);
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

    const logistics = useMemo(() => {
        const list = orders.filter(o => 
            o.deliveryDate && 
            (o.status === 'Pending' || o.status === 'Processing' || o.status === 'Out for Delivery' || o.status === 'Returned')
        );
        
        return {
            missed: list.filter(o => o.deliveryDate! < todayStr).sort((a,b) => a.deliveryDate!.localeCompare(b.deliveryDate!)),
            today: list.filter(o => o.deliveryDate === todayStr).sort((a,b) => (a.deliveryTime || '').localeCompare(b.deliveryTime || '')),
            tomorrow: list.filter(o => o.deliveryDate === tomorrowStr).sort((a,b) => (a.deliveryTime || '').localeCompare(b.deliveryTime || '')),
            upcoming: list.filter(o => o.deliveryDate! > tomorrowStr).sort((a,b) => a.deliveryDate!.localeCompare(b.deliveryDate!))
        };
    }, [orders, todayStr, tomorrowStr]);

    const sortedTrackers = useMemo(() => {
        const dom = todayObj.getDate();
        return [...trackers].sort((a, b) => {
            const distA = a.dueDate < dom ? a.dueDate + 31 - dom : a.dueDate - dom;
            const distB = b.dueDate < dom ? b.dueDate + 31 - dom : b.dueDate - dom;
            return distA - distB;
        });
    }, [trackers, todayObj]);

    const getCategoryStyles = (category: Tracker['category']) => {
        switch (category) {
            case 'Rent': return 'bg-purple-100 text-purple-600';
            case 'Electricity': return 'bg-yellow-100 text-yellow-600';
            case 'Water': return 'bg-blue-100 text-blue-600';
            case 'Employee': return 'bg-green-100 text-green-600';
            case 'Internet': return 'bg-indigo-100 text-indigo-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const DeliveryItem: React.FC<{ order: Order; label: string; labelColor: string }> = ({ order, label, labelColor }) => {
        const isExchange = order.items.some(i => i.status === 'Replacement' || (i.exchangedQuantity && i.exchangedQuantity > 0));
        
        return (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 animate-slide-up relative overflow-hidden">
                {isExchange && (
                    <div className="absolute top-0 right-0 px-4 py-1 bg-purple-600 text-white text-[7px] font-black uppercase tracking-widest rounded-bl-2xl">
                        Exchange Load
                    </div>
                )}
                
                <div className="flex justify-between items-start">
                    <div className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest ${labelColor}`}>
                        {order.status === 'Returned' ? 'RETURNED / RE-ATTEMPT' : label}
                    </div>
                    <div className="text-right leading-none">
                        <p className="text-xl font-black text-black dark:text-white italic leading-none">₹{(order.grandTotal || 0).toLocaleString()}</p>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1.5">SETTLEMENT VALUE</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-[20px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100 dark:border-blue-900/30">
                        <TruckIcon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-black dark:text-white uppercase italic tracking-tight truncate leading-none mb-2">{order.customerName || 'Walk-in'}</h3>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {order.customerAddress || 'No Address'}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {order.customerPhone || 'No Phone'}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 pt-2 border-t dark:border-gray-800">
                    <a href={`tel:${order.customerPhone}`} className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black dark:text-white active:scale-95 transition-all">
                        <PhoneIcon className="w-3.5 h-3.5" /> Call
                    </a>
                    <button 
                        onClick={() => setRescheduleOrderId(order.id)}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                        Schedule
                    </button>
                    <button 
                        onClick={() => setReturningOrder(order)}
                        className="flex items-center justify-center gap-2 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                        <RefundIcon className="w-3.5 h-3.5" /> Return
                    </button>
                    <button 
                        onClick={() => {
                            if (confirm('Mark this delivery as successfully completed?')) {
                                onUpdateStatus(order.id, 'Completed');
                            }
                        }}
                        className="flex items-center justify-center gap-2 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        <CheckCircleIcon className="w-3.5 h-3.5" /> Delivered
                    </button>
                </div>

                {rescheduleOrderId === order.id && (
                    <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-[32px] animate-fade-in border dark:border-gray-700">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">New Milestone Schedule</p>
                        <div className="flex gap-2">
                            <input 
                                type="date" 
                                className="flex-1 bg-white dark:bg-gray-900 rounded-2xl py-3 px-4 text-xs font-bold outline-none border border-gray-200 dark:border-gray-700" 
                                defaultValue={order.deliveryDate}
                                id={`date-picker-${order.id}`}
                                style={{ colorScheme: 'light' }}
                            />
                            <button 
                                onClick={() => {
                                    const input = document.getElementById(`date-picker-${order.id}`) as HTMLInputElement;
                                    onRescheduleOrder(order.id, input.value);
                                    setRescheduleOrderId(null);
                                }}
                                className="bg-blue-600 text-white px-6 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95"
                            >Update</button>
                        </div>
                        <button onClick={() => setRescheduleOrderId(null)} className="w-full mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Keep Original</button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#FDFDFF] dark:bg-gray-950 transition-colors font-sans overflow-hidden">
            {isAddModalOpen && (
                <AddTrackerModal 
                    onClose={() => setAddModalOpen(false)} 
                    onSave={(data) => { onAddTracker(data); setAddModalOpen(false); }} 
                />
            )}
            
            {selectedTracker && (
                <TrackerDetailModal 
                    tracker={selectedTracker} 
                    onClose={() => setSelectedTracker(null)} 
                    onUpdate={onUpdateTracker}
                    onDelete={onDeleteTracker}
                    onPay={(amount) => {
                        onRecordExpense(selectedTracker.title, amount, selectedTracker.category);
                        setSelectedTracker(null);
                    }}
                />
            )}

            {returningOrder && (
                <ReturnManagerModal 
                    order={returningOrder}
                    products={products}
                    onClose={() => setReturningOrder(null)}
                    onProcess={(updatedItems, financialAdjustment, newStatus, newLogistics) => {
                        onProcessAdvancedReturn?.(returningOrder.id, updatedItems, financialAdjustment, newStatus, newLogistics);
                        setReturningOrder(null);
                    }}
                />
            )}

            {isManifestOpen && (
                <TodayDeliveryListModal 
                    orders={logistics.today}
                    onClose={() => setManifestOpen(false)}
                    businessProfile={businessProfile}
                    isVatEnabled={true}
                />
            )}

            <header className="px-6 pt-10 pb-6 shrink-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400 active:scale-90 transition-all">
                        <BackIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-black text-black dark:text-white tracking-tight italic uppercase leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1 font-black">Pro</span> Fleet</h1>
                    <div className="flex items-center gap-2">
                        {onHome && (
                            <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        )}
                        <button onClick={() => setAddModalOpen(true)} className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl active:scale-90 transition-all">
                            <AddIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">LOGISTICS COMMAND</p>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-sm font-bold text-gray-400 italic">Tracking {logistics.missed.length + logistics.today.length + logistics.tomorrow.length + logistics.upcoming.length} Active Shipments</p>
                        <button 
                            onClick={() => setManifestOpen(true)}
                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30 active:scale-95"
                        >
                            Manifest List
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10 no-scrollbar pb-32">
                
                {logistics.missed.length > 0 && (
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] ml-1">Missed Logistics</h3>
                        <div className="space-y-4">
                            {logistics.missed.map(o => <DeliveryItem key={o.id} order={o} label="OVERDUE SHIPMENT" labelColor="bg-red-50 text-red-500" />)}
                        </div>
                    </section>
                )}

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] ml-1">Today's Fleet</h3>
                    <div className="space-y-4">
                        {logistics.today.map(o => <DeliveryItem key={o.id} order={o} label={`SCHEDULED: ${o.deliveryTime || 'TBD'}`} labelColor="bg-blue-50 text-blue-500" />)}
                        {logistics.today.length === 0 && (
                            <div className="p-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] text-center">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No deliveries for today</p>
                            </div>
                        )}
                    </div>
                </section>

                {(logistics.tomorrow.length > 0 || logistics.upcoming.length > 0) && (
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">Upcoming Load</h3>
                        <div className="space-y-4">
                            {logistics.tomorrow.map(o => <DeliveryItem key={o.id} order={o} label={`TOMORROW: ${o.deliveryTime || ''}`} labelColor="bg-gray-100 text-gray-500" />)}
                            {logistics.upcoming.map(o => <DeliveryItem key={o.id} order={o} label={`ON ${new Date(o.deliveryDate!).toLocaleDateString('en-GB')}`} labelColor="bg-gray-100 text-gray-500" />)}
                        </div>
                    </section>
                )}

                <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] ml-1">Recurring Settle</h3>
                    <div className="grid grid-cols-1 gap-5">
                        {sortedTrackers.length > 0 ? sortedTrackers.map(tracker => (
                            <button
                                key={tracker.id}
                                onClick={() => setSelectedTracker(tracker)}
                                className="w-full bg-white dark:bg-gray-900 p-6 rounded-[40px] flex flex-col gap-4 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all text-left group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest ${getCategoryStyles(tracker.category)}`}>
                                        {tracker.category}
                                    </div>
                                    <p className="text-xl font-black text-black dark:text-white italic">₹{tracker.amount.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400">
                                        <span className="text-[7px] font-black uppercase">DAY</span>
                                        <span className="text-xl font-black italic">{tracker.dueDate}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-black dark:text-white uppercase italic truncate">{tracker.title}</h3>
                                        <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest mt-1">MONTHLY RECURRING</p>
                                    </div>
                                </div>
                            </button>
                        )) : (
                            <div className="p-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] text-center">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No recurring trackers</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default TrackerScreen;