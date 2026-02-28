
import React, { useState, useEffect } from 'react';
import { MainView, Order, Product, Table, Creditor, Customer, Discount, Vendor, BusinessProfile, BusinessSettings, DeliveryPartner, OrderStatus } from '../types';
import TableView from '../components/sales/TableView';
import OrderEditor from '../components/sales/OrderEditor';
import CheckoutModal from '../components/sales/CheckoutModal';
import { calculateOrderTotals } from '../utils/calculationUtils';

// Fixed: Added optional onHome to SalesScreenProps interface to resolve TS errors in MainScreen.tsx and DesktopLayout.tsx
interface SalesScreenProps {
    products: Product[];
    tables: Table[];
    creditors: Creditor[];
    customers: Customer[];
    vendors: Vendor[];
    discounts: Discount[];
    isVatEnabled: boolean;
    isKotEnabled: boolean;
    onOrderComplete: (order: Order, upfrontPayment: number) => void;
    onUpdateTableStatus: (tableId: string, status: 'Free' | 'Occupied') => void;
    onSavePendingOrder: (order: Order) => void;
    onPrintKot: (order: Order) => void;
    onReprintLatestKot: (tableId: string) => void;
    pendingOrders: Map<string, Order>;
    orders: Order[]; 
    onAddProductClick: () => void;
    onAddTableClick: () => void;
    onDeleteTable: (tableId: string) => void;
    isDesktop?: boolean;
    setCurrentView?: (view: MainView) => void;
    businessProfile: BusinessProfile;
    orderToEdit?: Order | null;
    onUpdateAndSaveOrder?: (order: Order) => void;
    onEditCancel?: () => void;
    onEditorToggle?: (isActive: boolean) => void;
    onUpdateSettings: (updates: Partial<BusinessSettings>) => void;
    businessSettings: BusinessSettings;
    deliveryPartners: DeliveryPartner[];
    onUpdateDeliveryPartners: (partners: DeliveryPartner[]) => void;
    onUpdateOrderStatus?: (id: string, status: OrderStatus) => void;
    onHome?: () => void;
}

type SalesStep = 'SALES_MANAGER' | 'EDIT_ORDER';
export type SalesSegment = 'TABLES' | 'DELIVERY' | 'TAKEAWAY';

const SalesScreen: React.FC<SalesScreenProps> = (props) => {
    const { 
        products, tables, creditors, customers, vendors, discounts, isVatEnabled, isKotEnabled, onOrderComplete, 
        onUpdateTableStatus, onSavePendingOrder, onPrintKot, onReprintLatestKot, pendingOrders, orders, onAddProductClick, onAddTableClick, businessProfile,
        isDesktop, setCurrentView, orderToEdit, onUpdateAndSaveOrder, onEditCancel, onDeleteTable, onEditorToggle, onUpdateSettings, businessSettings,
        deliveryPartners, onUpdateDeliveryPartners, onUpdateOrderStatus, onHome
    } = props;
    
    const [step, setStep] = useState<SalesStep>(orderToEdit ? 'EDIT_ORDER' : 'SALES_MANAGER');
    const [activeSegment, setActiveSegment] = useState<SalesSegment>('TABLES');
    const [activeOrder, setActiveOrder] = useState<Order | null>(orderToEdit || null);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const isDayClosed = businessSettings.lastClosedDate === today;

    useEffect(() => {
        if (orderToEdit) {
            setActiveOrder(orderToEdit);
            setStep('EDIT_ORDER');
            onEditorToggle?.(true);
        }
    }, [orderToEdit, onEditorToggle]);
    
    const createNewOrder = (type: 'Takeaway' | 'Table' | 'Order', tableId?: string): Order => ({
        id: `ord-${Date.now()}`,
        type,
        tableId,
        items: [],
        status: 'Pending',
        timestamp: Date.now(),
        customerName: '',
        customerPhone: '',
        discount: 0,
        discountType: 'PERCENT'
    });

    const handleSelectTable = (table: Table) => {
        const existingOrder = pendingOrders.get(table.id);
        setActiveOrder(existingOrder || createNewOrder('Table', table.id));
        setStep('EDIT_ORDER');
        onEditorToggle?.(true);
    };

    const handleAddDeliveryOrder = () => {
        setActiveOrder(createNewOrder('Order'));
        setStep('EDIT_ORDER');
        onEditorToggle?.(true);
    };

    const handleAddTakeawayOrder = () => {
        setActiveOrder(createNewOrder('Takeaway'));
        setStep('EDIT_ORDER');
        onEditorToggle?.(true);
    };

    const handleSelectExistingOrder = (order: Order) => {
        setActiveOrder(order);
        setStep('EDIT_ORDER');
        onEditorToggle?.(true);
    };

    const handleUpdateOrder = (updatedOrder: Order) => {
        setActiveOrder(updatedOrder);
        // Draft saving logic
        if (updatedOrder.status === 'Pending' || updatedOrder.status === 'Processing' || updatedOrder.status === 'Out for Delivery') {
             onSavePendingOrder(updatedOrder);
        } else {
             // For finalized orders, use save function if available
             onUpdateAndSaveOrder?.(updatedOrder);
        }
    };

    const handleBack = () => {
        if (orderToEdit && onEditCancel) {
            onEditCancel();
            onEditorToggle?.(false);
            return;
        }

        if (step === 'EDIT_ORDER') {
            setStep('SALES_MANAGER');
            setActiveOrder(null);
            onEditorToggle?.(false);
        } else if (setCurrentView) {
            setCurrentView(MainView.DASHBOARD);
            onEditorToggle?.(false);
        }
    };
    
    const handleCheckout = () => {
        if (activeOrder && activeOrder.items.length > 0) {
            if (activeOrder.tableId) {
                onSavePendingOrder(activeOrder);
                onUpdateTableStatus(activeOrder.tableId, 'Occupied');
            }
            setCheckoutModalOpen(true);
        } else {
            alert("Cannot checkout with an empty order.");
        }
    };

    const handleSaveOrder = () => {
        if (activeOrder) {
            const hasItems = activeOrder.items.length > 0;
            
            if (activeOrder.tableId) {
                if (hasItems) {
                    onSavePendingOrder(activeOrder);
                    onUpdateTableStatus(activeOrder.tableId, 'Occupied');
                } else {
                    onSavePendingOrder({ ...activeOrder, items: [] });
                    onUpdateTableStatus(activeOrder.tableId, 'Free');
                }
            } else {
                if (hasItems) {
                    onSavePendingOrder(activeOrder);
                }
            }
            handleBack();
        }
    };

    const handleFinalizeOrder = (paymentData: { method: 'Cash' | 'Bank' | 'Credit' | 'Split', upfrontPaymentAmount: number, cashAmount?: number, bankAmount?: number }) => {
        if (!activeOrder) return;
        
        const { grandTotal, amountDue } = calculateOrderTotals(activeOrder, isVatEnabled);
        
        const finalOrder: Order = {
            ...activeOrder,
            paymentMethod: paymentData.method,
            grandTotal,
            cashPaid: paymentData.method === 'Split' ? paymentData.cashAmount : (paymentData.method === 'Cash' ? amountDue : undefined),
            bankPaid: paymentData.method === 'Split' ? paymentData.bankAmount : (paymentData.method === 'Bank' ? amountDue : undefined),
            advanceAmount: paymentData.upfrontPaymentAmount,
            // If it's a direct sale (Table/Takeaway) it's Completed. If it's a Delivery, it's still 'Pending' until dispatched.
            status: activeOrder.type === 'Order' ? 'Pending' : 'Completed' 
        };

        if(orderToEdit && onUpdateAndSaveOrder) {
             onUpdateAndSaveOrder(finalOrder);
        } else {
            // Parent handles removal from pending Map and addition to orders list
            onOrderComplete(finalOrder, paymentData.upfrontPaymentAmount);
        }
        handleCloseCheckout();
    };
    
    const handleCloseCheckout = () => {
        setCheckoutModalOpen(false);
        setStep('SALES_MANAGER');
        setActiveOrder(null);
        onEditorToggle?.(false);
    };

    return (
        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
            {isDayClosed && (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
                    <div className="bg-white dark:bg-gray-950 p-10 rounded-[48px] shadow-2xl max-w-sm w-full border border-gray-100 dark:border-gray-800 animate-slide-up">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter mb-2">Terminal Locked</h2>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8 leading-relaxed">
                            The day has been closed and reconciled. No further transactions are permitted until the next business day.
                        </p>
                        <button 
                            onClick={onHome}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[32px] text-xs uppercase tracking-[0.3em] active:scale-95 transition-all"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            )}
            {step === 'EDIT_ORDER' && activeOrder ? (
                <div className="h-full flex flex-col">
                    {isCheckoutModalOpen && (
                        <CheckoutModal
                            order={activeOrder}
                            creditors={creditors}
                            onClose={handleCloseCheckout}
                            onCompleteOrder={handleFinalizeOrder}
                            isVatEnabled={isVatEnabled}
                            businessProfile={businessProfile}
                        />
                    )}
                    <OrderEditor
                        order={activeOrder}
                        products={products}
                        tables={tables}
                        creditors={creditors}
                        customers={customers}
                        vendors={vendors}
                        deliveryPartners={deliveryPartners}
                        discounts={discounts}
                        onUpdateOrder={handleUpdateOrder}
                        onBack={handleBack}
                        onCheckout={handleCheckout}
                        isVatEnabled={isVatEnabled}
                        isKotEnabled={isKotEnabled}
                        onSave={handleSaveOrder}
                        onPrintKot={onPrintKot}
                        onAddProductClick={onAddProductClick}
                        isDesktop={isDesktop}
                        setCurrentView={setCurrentView}
                        isEditing={!!orderToEdit || activeOrder.status === 'Completed'}
                        onUpdateAndSaveOrder={onUpdateAndSaveOrder}
                        isTableOccupied={activeOrder.tableId ? tables.find(t => t.id === activeOrder.tableId)?.status === 'Occupied' : false}
                        onUpdateSettings={onUpdateSettings}
                        businessSettings={businessSettings}
                        businessProfile={businessProfile}
                        showFooter={true}
                    />
                </div>
            ) : (
                <TableView 
                    tables={tables} 
                    onSelectTable={handleSelectTable} 
                    onBack={handleBack} 
                    isDesktop={isDesktop} 
                    setCurrentView={setCurrentView} 
                    onAddTableClick={onAddTableClick} 
                    onDeleteTable={onDeleteTable} 
                    onReprintLatestKot={onReprintLatestKot} 
                    isKotEnabled={isKotEnabled}
                    activeSegment={activeSegment}
                    setActiveSegment={setActiveSegment}
                    pendingOrders={Array.from(pendingOrders.values())}
                    orders={orders} 
                    onAddDeliveryOrder={handleAddDeliveryOrder}
                    onAddTakeawayOrder={handleAddTakeawayOrder}
                    onSelectExistingOrder={handleSelectExistingOrder}
                    deliveryPartners={deliveryPartners}
                    onUpdateDeliveryPartners={onUpdateDeliveryPartners}
                    onUpdateOrderStatus={onUpdateOrderStatus}
                    onHome={onHome}
                />
            )}
        </div>
    );
};

export default SalesScreen;
