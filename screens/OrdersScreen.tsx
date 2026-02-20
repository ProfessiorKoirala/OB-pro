import React, { useState, useMemo } from 'react';
import { Order, Customer, Creditor, Vendor, BusinessProfile, OrderItem, Product } from '../types';
import OrderCard from '../components/orders/OrderCard';
import AddIcon from '../components/icons/AddIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import AnimatedSearchBar from '../components/AnimatedSearchBar';
import { printList } from '../utils/printUtils';
import { Column } from '../components/PrintableList';
import PrinterIcon from '../components/icons/PrinterIcon';
import ReturnManagerModal from '../components/orders/ReturnManagerModal';
import HomeIcon from '../components/icons/HomeIcon';

type FilterType = 'Pending' | 'Out for Delivery' | 'Completed' | 'Cancelled' | 'Returned';

interface OrdersScreenProps {
  orders: Order[];
  customers: Customer[];
  creditors: Creditor[];
  vendors: Vendor[];
  products: Product[];
  onViewBill: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: 'Out for Delivery' | 'Completed' | 'Cancelled' | 'Returned') => void;
  onCancelOrder: (orderId: string, isRefunded: boolean) => void;
  onAddNewOrder: () => void;
  businessProfile: BusinessProfile;
  onViewKots: (order: Order) => void;
  onProcessAdvancedReturn?: (orderId: string, updatedItems: OrderItem[], refundAmount: number, newStatus: any, logistics: { date: string, time: string, newFee: number }) => void;
  onHome?: () => void;
}

const OrdersScreen: React.FC<OrdersScreenProps> = (props) => {
    const { orders, customers, creditors, vendors, products, onViewBill, onEditOrder, onDeleteOrder, onUpdateStatus, onCancelOrder, onAddNewOrder, businessProfile, onViewKots, onProcessAdvancedReturn, onHome } = props;
    const [statusFilter, setStatusFilter] = useState<FilterType>('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionToConfirm, setActionToConfirm] = useState<{ action: 'deliver' | 'cancel' | 'return' | 'delete', order: Order } | null>(null);
    const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

    const getContactName = (order: Order): string => {
        if (order.customerId) return customers.find(c => c.id === order.customerId)?.name || order.customerName;
        if (order.creditorId) return creditors.find(c => c.id === order.creditorId)?.name || order.customerName;
        if (order.vendorId) return vendors.find(v => v.id === order.vendorId)?.name || order.customerName;
        return order.customerName || 'Walk-in';
    };

    const filteredOrders = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        
        return [...orders]
            .filter(o => o.type === 'Order') // Strictly Deliveries
            .filter(o => o.status === statusFilter)
            .filter(order => {
                if (!lowercasedTerm) return true;

                const contactName = getContactName(order).toLowerCase();
                const orderId = order.id.toLowerCase();
                const customerPhone = order.customerPhone || '';
                const itemsString = order.items.map(i => i.product.name).join(' ').toLowerCase();

                return contactName.includes(lowercasedTerm) ||
                       orderId.includes(lowercasedTerm) ||
                       customerPhone.includes(lowercasedTerm) ||
                       itemsString.includes(lowercasedTerm);
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [orders, statusFilter, searchTerm, customers, creditors, vendors]);

    const handleCompleteDelivery = (orderId: string) => {
        if (completingOrderId) return;
        setCompletingOrderId(orderId);

        setTimeout(() => {
            onUpdateStatus(orderId, 'Completed');
            setCompletingOrderId(null);
        }, 3000);
    };
    
    const handleConfirm = () => {
        if (!actionToConfirm) return;
        
        switch (actionToConfirm.action) {
            case 'deliver':
                onUpdateStatus(actionToConfirm.order.id, 'Out for Delivery');
                break;
            case 'cancel':
                onUpdateStatus(actionToConfirm.order.id, 'Cancelled');
                break;
            case 'return':
                onUpdateStatus(actionToConfirm.order.id, 'Returned');
                break;
            case 'delete':
                onDeleteOrder(actionToConfirm.order.id);
                break;
        }
        setActionToConfirm(null);
    };
    
    const handlePrint = () => {
        const title = `${statusFilter} Delivery Shipments`;
        const columns: Column<Order>[] = [
            { header: 'ID', accessor: (o) => `#${o.id.slice(-6)}` },
            { header: 'Date', accessor: (o) => new Date(o.timestamp).toLocaleDateString('en-GB') },
            { header: 'Type', accessor: () => 'Delivery' },
            { header: 'Customer', accessor: (o) => getContactName(o) },
            { header: 'Total', accessor: (o) => formatCurrency(o.grandTotal || 0), align: 'right' },
        ];
        printList(title, columns, filteredOrders, businessProfile);
    };

    const getConfirmationDetails = () => {
        if (!actionToConfirm) return null;
        switch (actionToConfirm.action) {
            case 'deliver': return { title: 'Mark as Out for Delivery?', message: 'This will move the order to the "Out for Delivery" tab.', confirmText: 'Yes, Mark as Out for Delivery' };
            case 'cancel': return { title: 'Order Mistake?', message: 'Mark this order as a mistake? This will move it to Cancelled.', confirmText: 'Yes, Cancel', isDestructive: true };
            case 'return': return { title: 'Process Return?', message: 'Has the customer returned these items? This will move the order to Returned.', confirmText: 'Yes, Mark Returned', isDestructive: true };
            case 'delete': return { title: 'Permanently Delete?', message: 'This will move the order to the recycle bin. Are you sure?', confirmText: 'Yes, Delete', isDestructive: true };
            default: return null;
        }
    };

    const confirmationDetails = getConfirmationDetails();

    return (
        <div className="p-4 pb-32 bg-white dark:bg-gray-950 min-h-full font-sans transition-colors">
            {actionToConfirm && confirmationDetails && actionToConfirm.action !== 'cancel' && actionToConfirm.action !== 'return' && (
                <ConfirmationModal
                    title={confirmationDetails.title}
                    message={confirmationDetails.message}
                    onConfirm={handleConfirm}
                    onCancel={() => setActionToConfirm(null)}
                    confirmText={confirmationDetails.confirmText}
                    confirmButtonClass={confirmationDetails.isDestructive ? 'bg-red-600 text-white' : undefined}
                />
            )}
            
            {actionToConfirm?.action === 'return' && (
                <ReturnManagerModal 
                    order={actionToConfirm.order}
                    products={products}
                    onClose={() => setActionToConfirm(null)}
                    onProcess={(updatedItems, refund, status, logistics) => {
                        onProcessAdvancedReturn?.(actionToConfirm.order.id, updatedItems, refund, status, logistics);
                        setActionToConfirm(null);
                    }}
                />
            )}

            {actionToConfirm?.action === 'cancel' && (
                <ConfirmationModal
                    title="Order Mistake?"
                    message="Would you like to cancel this order? This will assume zero items were delivered."
                    onConfirm={handleConfirm}
                    onCancel={() => setActionToConfirm(null)}
                    confirmText="Yes, Cancel"
                    confirmButtonClass="bg-red-600 text-white"
                />
            )}

            <header className="px-2 pt-8 pb-4 shrink-0 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB <span className="text-[12px] bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded ml-1">Pro</span></h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic leading-none">Shipment Registry</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-black dark:text-white border border-gray-100 dark:border-gray-700 active:scale-90 transition-all">
                            <PrinterIcon className="h-6 w-6" />
                        </button>
                        {onHome && (
                            <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all border border-gray-100 dark:border-gray-700">
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                <AnimatedSearchBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder="Search by ID, name, or phone..."
                />
            </header>

            <main className="space-y-8 no-scrollbar">
                {/* Status Filter Segment */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2">Milestone Filter</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                        {(['Pending', 'Out for Delivery', 'Completed', 'Cancelled', 'Returned'] as FilterType[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-5 py-2.5 text-[9px] font-black rounded-full whitespace-nowrap transition-all border ${
                                    statusFilter === f 
                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg' 
                                    : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                {f === 'Out for Delivery' ? 'DISPATCHED' : f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            contactName={getContactName(order)}
                            isCompleting={completingOrderId === order.id}
                            onViewBill={() => onViewBill(order)}
                            onEdit={() => onEditOrder(order)}
                            onCancel={() => setActionToConfirm({ action: 'cancel', order })}
                            onDelete={() => setActionToConfirm({ action: 'delete', order })}
                            onUpdateStatus={(id, status) => {
                                if (status === 'Completed') {
                                    handleCompleteDelivery(id);
                                } else if (status === 'Returned') {
                                    setActionToConfirm({ action: 'return', order });
                                } else { 
                                    setActionToConfirm({ action: 'deliver', order });
                                }
                            }}
                            onViewKots={() => onViewKots(order)}
                        />
                    )) : (
                        <div className="py-32 text-center opacity-30">
                            <div className="bg-gray-50 dark:bg-gray-800 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 00-2-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeWidth="1.5"/></svg>
                            </div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-black dark:text-white">Registry Empty</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">NO {statusFilter.toUpperCase()} SHIPMENTS FOUND</p>
                        </div>
                    )}
                </div>
            </main>
            
            <button
                onClick={onAddNewOrder}
                className="fixed bottom-10 right-8 bg-black dark:bg-white text-white dark:text-black w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-10"
                aria-label="Add Order"
            >
                <AddIcon className="h-8 w-8" />
            </button>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default OrdersScreen;