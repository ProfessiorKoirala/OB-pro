import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MainView, Order, OrderItem, Product, Creditor, Customer, Discount, Table, Vendor, BusinessSettings, OrderStatus, DeliveryPartner, BusinessProfile } from '../../types';
import AddProductModal from './AddProductModal';
import ContactSearchModal from './CreditorSearchModal';
import ConfirmationModal from '../ConfirmationModal';
import PlusCircleIcon from '../icons/PlusCircleIcon';
import ApplyDiscountModal from './ApplyDiscountModal';
import SettingsIcon from '../icons/SettingsIcon';
import { calculateOrderTotals } from '../../utils/calculationUtils';
import AssignPartnerModal from '../delivery/AssignPartnerModal';
import PrinterIcon from '../icons/PrinterIcon';
import { printOrder } from '../../utils/printUtils';

interface OrderEditorProps {
    order: Order;
    products: Product[];
    tables: Table[];
    creditors: Creditor[];
    customers: Customer[];
    vendors: Vendor[];
    deliveryPartners?: DeliveryPartner[];
    discounts: Discount[];
    onUpdateOrder: (order: Order) => void;
    onBack: () => void;
    onCheckout: () => void;
    isVatEnabled: boolean;
    isKotEnabled: boolean;
    onSave?: () => void;
    onPrintKot?: (order: Order) => void;
    isTableOccupied?: boolean;
    onAddProductClick: () => void;
    isDesktop?: boolean;
    setCurrentView?: (view: MainView) => void;
    isEditing?: boolean;
    onUpdateAndSaveOrder?: (order: Order) => void;
    showFooter?: boolean;
    onUpdateSettings: (updates: Partial<BusinessSettings>) => void;
    businessSettings: BusinessSettings;
    onEditorToggle?: (isActive: boolean) => void;
    businessProfile: BusinessProfile;
}

const BackIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

const ChevronDownIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
);

const OrderEditor: React.FC<OrderEditorProps> = (props) => {
    const { order, products, tables, creditors, customers, vendors, deliveryPartners = [], discounts, onUpdateOrder, onBack, onCheckout, isKotEnabled, onSave, onPrintKot, isTableOccupied, onAddProductClick, isDesktop, setCurrentView, isEditing, onUpdateAndSaveOrder, onUpdateSettings, businessSettings, onEditorToggle, businessProfile, showFooter = true } = props;
    
    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
    const [isQuickSettingsOpen, setQuickSettingsOpen] = useState(false);
    const [isBackConfirmOpen, setBackConfirmOpen] = useState(false);
    const [isPartnerModalOpen, setPartnerModalOpen] = useState(false);
    const [matchPopupContact, setMatchPopupContact] = useState<{ id: string, name: string, phone: string, type: string } | null>(null);

    // Track the initial state to allow reverting/discarding
    const initialOrderRef = useRef<string>(JSON.stringify(order));
    
    // STARTING CLOSED FOR CLEAN LOOK
    const [isContactExpanded, setContactExpanded] = useState(false);

    useEffect(() => {
        onEditorToggle?.(true);
        return () => onEditorToggle?.(false);
    }, [onEditorToggle]);

    const handleBackWithCheck = () => {
        const currentOrderStr = JSON.stringify(order);
        if (currentOrderStr !== initialOrderRef.current) {
            setBackConfirmOpen(true);
        } else {
            onBack();
        }
    };

    const handleDiscardAndGoBack = () => {
        try {
            // Explicitly revert the parent state to the original before closing
            const originalOrder = JSON.parse(initialOrderRef.current);
            onUpdateOrder(originalOrder);
            onBack();
        } catch (e) {
            console.error("Failed to restore original order", e);
            onBack();
        }
    };

    const handlePrintBill = () => {
        if (order.items.length === 0) return alert("Basket is empty.");
        printOrder(order, businessProfile, businessSettings.isVatEnabled);
    };

    const handleItemQuantityChange = (productId: string, change: 1 | -1) => {
        const existingItem = order.items.find(item => item.product.id === productId);
        const productData = products.find(p => p.id === productId);
        
        if (!productData) return;

        let newItems: OrderItem[];
        if (existingItem) {
            const newQuantity = existingItem.quantity + change;
            
            if (change === 1 && productData.trackStock && newQuantity > (productData.stock || 0)) {
                alert(`Stock Limit Reached! Only ${productData.stock} units of ${productData.name} available.`);
                return;
            }

            if (newQuantity <= 0) {
                newItems = order.items.filter(item => item.product.id !== productId);
            } else {
                newItems = order.items.map(item => item.product.id === productId ? { ...item, quantity: newQuantity } : item);
            }
        } else if (change === 1) {
            if (productData.trackStock && (productData.stock || 0) <= 0) {
                alert(`Product Out of Stock! ${productData.name} is currently unavailable.`);
                return;
            }
            newItems = [...order.items, { product: productData, quantity: 1, status: 'Active' }];
        } else {
            newItems = order.items;
        }
        onUpdateOrder({ ...order, items: newItems });
    };

    const handleAddItem = (product: Product) => { handleItemQuantityChange(product.id, 1); };
    
    const handleNameBlur = () => {
        if (!order.customerName || order.customerId || order.creditorId || order.vendorId) return;

        const name = order.customerName.toLowerCase().trim();
        const existing = [
            ...customers.map(c => ({...c, type: 'customer'})),
            ...creditors.map(c => ({...c, type: 'creditor'})),
            ...vendors.map(v => ({...v, type: 'vendor'}))
        ].find(c => c.name.toLowerCase() === name);

        if (existing) {
            setMatchPopupContact({ id: existing.id, name: existing.name, phone: existing.phone, type: existing.type });
        }
    };

    const handleConfirmMatch = () => {
        if (matchPopupContact) {
            onUpdateOrder({
                ...order,
                customerId: matchPopupContact.type === 'customer' ? matchPopupContact.id : undefined,
                creditorId: matchPopupContact.type === 'creditor' ? matchPopupContact.id : undefined,
                vendorId: matchPopupContact.type === 'vendor' ? matchPopupContact.id : undefined,
                customerName: matchPopupContact.name,
                customerPhone: matchPopupContact.phone
            });
            setMatchPopupContact(null);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onUpdateOrder({ ...order, [name]: value });
    };

    const { subtotal, discountAmount, taxAmount, grandTotal } = useMemo(() => {
        const activeDiscounts = businessSettings.autoApplyProductOffers ? (discounts || []) : (discounts || []).filter(d => !d.productId);
        return calculateOrderTotals(order, businessSettings.isVatEnabled, activeDiscounts);
    }, [order, businessSettings.isVatEnabled, discounts, businessSettings.autoApplyProductOffers]);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const deliveryStatuses: OrderStatus[] = ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled', 'Returned'];

    const getPartnerName = (id?: string) => {
        if (!id) return "Assign Partner";
        return deliveryPartners.find(p => p.id === id)?.name || "Unknown Partner";
    };

    const isDelivery = order.type === 'Order';
    const totalItemCount = useMemo(() => order.items.reduce((sum, item) => sum + item.quantity, 0), [order.items]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors font-sans overflow-hidden">
            {isProductModalOpen && <AddProductModal products={products} orderItems={order.items} onAddProduct={handleAddItem} onClose={() => setProductModalOpen(false)} discounts={discounts} />}
            {isContactModalOpen && <ContactSearchModal customers={customers} creditors={creditors} vendors={vendors} onSelectContact={(c, t) => { onUpdateOrder({...order, customerId: t === 'customer' ? c.id : undefined, creditorId: t === 'creditor' ? c.id : undefined, vendorId: t === 'vendor' ? c.id : undefined, customerName: c.name, customerPhone: c.phone, customerAddress: c.address}); setContactModalOpen(false); }} onClose={() => setContactModalOpen(false)} />}
            {isDiscountModalOpen && <ApplyDiscountModal discounts={discounts} onApply={(d) => { onUpdateOrder({...order, discount: d.value, discountType: d.type, appliedDiscountId: d.id, appliedDiscountName: d.name}); setDiscountModalOpen(false); }} onClose={() => setDiscountModalOpen(false)} />}
            {isPartnerModalOpen && (
                <AssignPartnerModal 
                    partners={deliveryPartners} 
                    onClose={() => setPartnerModalOpen(false)} 
                    onAssign={(id) => { onUpdateOrder({...order, deliveryPartnerId: id}); setPartnerModalOpen(false); }} 
                />
            )}
            
            {matchPopupContact && (
                <ConfirmationModal 
                    title="Same Person?"
                    message={`Found "${matchPopupContact.name}" with phone ${matchPopupContact.phone}. Is this the same person?`}
                    onConfirm={handleConfirmMatch}
                    onCancel={() => setMatchPopupContact(null)}
                    confirmText="Yes, Use Profile"
                    cancelText="No, New Client"
                />
            )}

            {isBackConfirmOpen && (
                <ConfirmationModal 
                    title="Unsaved Changes" 
                    message="You have modified the order. What would you like to do?" 
                    onConfirm={() => { onSave?.(); onBack(); }}
                    onCancel={() => setBackConfirmOpen(false)} 
                    onSecondaryAction={handleDiscardAndGoBack}
                    confirmText="Save & Go Back"
                    secondaryText="Discard & Go Back"
                    cancelText="Keep Editing"
                />
            )}

            <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-950 z-30 border-b dark:border-gray-900 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackWithCheck} className="p-2 -ml-2 text-black dark:text-white active:scale-90 transition-all"><BackIcon /></button>
                    <h1 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">
                        OB<span className="text-[#4B2A63] dark:text-blue-400"> Pro</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2 relative">
                    {isKotEnabled && (
                        <button 
                            onClick={() => onPrintKot?.(order)} 
                            className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 active:scale-90 transition-all flex items-center gap-1"
                            title="Print KOT"
                        >
                            <PrinterIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase">KOT</span>
                        </button>
                    )}
                    <button onClick={handlePrintBill} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:scale-90 transition-all" title="Print Bill">
                        <PrinterIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onSave} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Save</button>
                    <button onClick={() => setQuickSettingsOpen(!isQuickSettingsOpen)} className={`p-2.5 rounded-xl transition-all ${isQuickSettingsOpen ? 'bg-black text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                    
                    {isQuickSettingsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-3 z-50 animate-fade-in">
                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">VAT Calculation</span>
                                <button 
                                    onClick={() => onUpdateSettings({ isVatEnabled: !businessSettings.isVatEnabled })}
                                    className={`w-10 h-6 rounded-full transition-all relative ${businessSettings.isVatEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${businessSettings.isVatEnabled ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-grow overflow-y-auto px-6 py-6 space-y-8 no-scrollbar pb-32">
                
                {isDelivery && (
                    <section className="space-y-4 animate-fade-in">
                        <h2 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.4em] px-1">Logistics Hub</h2>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-[32px] border border-gray-100 dark:border-gray-700 space-y-4 shadow-inner">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Milestone</p>
                                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                    {deliveryStatuses.map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => onUpdateOrder({...order, status: s})}
                                            className={`px-3 py-1.5 text-[9px] font-black rounded-full whitespace-nowrap transition-all ${order.status === s ? 'bg-black text-white' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 shadow-sm'}`}
                                        >
                                            {s.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1 space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">EST. DATE</p>
                                    <input 
                                        type="date" 
                                        value={order.deliveryDate || ''} 
                                        onChange={e => onUpdateOrder({...order, deliveryDate: e.target.value})}
                                        className="w-full bg-white dark:bg-gray-800 rounded-xl py-2 px-3 text-[11px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-gray-700 text-black dark:text-white"
                                        style={{ colorScheme: 'light' }}
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">EST. TIME</p>
                                    <input 
                                        type="time" 
                                        value={order.deliveryTime || ''} 
                                        onChange={e => onUpdateOrder({...order, deliveryTime: e.target.value})}
                                        className="w-full bg-white dark:bg-gray-800 rounded-xl py-2 px-3 text-[11px] font-black uppercase outline-none shadow-sm border border-gray-100 dark:border-gray-700 text-black dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Rider</p>
                                    <button 
                                        onClick={() => setPartnerModalOpen(true)}
                                        className="w-full py-2 px-3 bg-white dark:bg-gray-800 rounded-xl text-left border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest italic shadow-sm truncate text-black dark:text-white"
                                    >
                                        {getPartnerName(order.deliveryPartnerId)}
                                    </button>
                                </div>
                                <div className="w-20 shrink-0">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1">Fee</p>
                                    <input 
                                        type="number" 
                                        value={order.deliveryFee || ''} 
                                        onChange={e => onUpdateOrder({...order, deliveryFee: parseFloat(e.target.value) || 0})}
                                        placeholder="0"
                                        className="w-full py-2 px-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black text-center outline-none shadow-sm text-black dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="space-y-4">
                    <button onClick={() => setContactExpanded(!isContactExpanded)} className="w-full flex justify-between items-center px-1 text-black dark:text-white">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">Client Profile</h2>
                        <ChevronDownIcon isOpen={isContactExpanded} />
                    </button>

                    {isContactExpanded && (
                        <div className="space-y-4 animate-fade-in">
                            <button 
                                onClick={() => setContactModalOpen(true)}
                                className="w-full flex items-center justify-center gap-3 p-5 bg-black dark:bg-white border border-black dark:border-white rounded-[28px] text-left active:scale-[0.98] transition-all shadow-xl"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center text-white dark:text-black">
                                    <UserIcon />
                                </div>
                                <span className="font-black uppercase text-xs tracking-[0.2em] text-white dark:text-black">Select Client from List</span>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">or entry manually</span>
                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                            </div>

                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    name="customerName" 
                                    value={order.customerName} 
                                    onChange={handleFormChange} 
                                    onBlur={handleNameBlur}
                                    placeholder="CLIENT NAME" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-5 px-8 font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                />
                                <input 
                                    type="tel" 
                                    name="customerPhone" 
                                    value={order.customerPhone} 
                                    onChange={handleFormChange} 
                                    placeholder="MOBILE NUMBER" 
                                    className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-5 px-8 font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                />
                                {isDelivery && (
                                    <input 
                                        type="text" 
                                        name="customerAddress" 
                                        value={order.customerAddress || ''} 
                                        onChange={handleFormChange} 
                                        placeholder="DELIVERY LOCATION / ADDRESS" 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-[24px] py-5 px-8 font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.4em]">Items Basket</h2>
                            {totalItemCount > 0 && (
                                <span className="bg-[#4B2A63] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md italic animate-fade-in shadow-sm">
                                    {totalItemCount} UNITS
                                </span>
                            )}
                        </div>
                        <button onClick={() => setProductModalOpen(true)} className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase tracking-widest">
                            <PlusCircleIcon className="w-4 h-4" /> Quick Add
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {order.items.length === 0 ? (
                            <div className="py-16 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] text-center bg-gray-50/50">
                                <p className="text-sm font-black text-black dark:text-white uppercase tracking-[0.3em] italic opacity-80">No items added</p>
                            </div>
                        ) : order.items.map(({ product, quantity, status = 'Active', returnedQuantity = 0 }) => {
                            const effectiveQty = quantity - returnedQuantity;
                            return (
                                <div key={product.id} className={`p-5 rounded-[36px] bg-gray-50 dark:bg-gray-900 flex flex-col gap-4 border shadow-sm transition-all ${status !== 'Active' || effectiveQty <= 0 ? 'opacity-50 grayscale border-gray-200' : 'border-gray-50 dark:border-gray-800'}`}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-base font-black italic uppercase tracking-tight truncate leading-none mb-1.5 ${status === 'Cancelled' ? 'line-through' : ''} text-black dark:text-white`}>{product.name}</h4>
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                {returnedQuantity > 0 ? `${returnedQuantity} Returned` : status !== 'Active' ? status : `₹${product.price.toLocaleString()}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center bg-white dark:bg-gray-800 p-1.5 rounded-2xl gap-4 shrink-0 shadow-sm ring-1 ring-black/5">
                                            <button onClick={() => handleItemQuantityChange(product.id, -1)} className="w-10 h-10 rounded-xl font-black text-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-90 transition-all">-</button>
                                            <span className="font-black text-base italic min-w-[24px] text-center text-black dark:text-white">{quantity}</span>
                                            <button onClick={() => handleItemQuantityChange(product.id, 1)} className="w-10 h-10 rounded-xl font-black text-lg text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-90 transition-all">+</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-5 pt-4">
                    <h2 className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.4em] px-1">Settlement Summary</h2>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[48px] border border-gray-100 dark:border-gray-700 space-y-6 shadow-sm">
                         
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em]">Gross Total</span>
                            <span className="font-black text-2xl italic text-black dark:text-white tracking-tighter">{formatCurrency(subtotal)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em]">Offers Applied</span>
                            <button onClick={() => setDiscountModalOpen(true)} className={`px-5 py-2 ${discountAmount > 0 ? 'bg-green-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'} text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg active:scale-90 transition-all`}>
                                {discountAmount > 0 ? 'Modify Offer' : 'Apply Offer'}
                            </button>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center animate-fade-in text-green-500">
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Empire Savings</span>
                                <span className="font-black text-2xl italic tracking-tighter">-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em]">VAT (13%)</span>
                            <span className={`font-black text-2xl italic tracking-tighter ${businessSettings.isVatEnabled ? 'text-black dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                                {businessSettings.isVatEnabled ? formatCurrency(taxAmount) : 'OFF'}
                            </span>
                        </div>

                        <div className="pt-6 border-t-2 border-black dark:border-white flex justify-between items-end">
                            <div className="w-full">
                                <p className="text-[11px] font-black text-black dark:text-white uppercase tracking-[0.4em] mb-2 leading-none">Total Payable Amount</p>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-6xl font-black text-black dark:text-white italic tracking-tighter leading-none">
                                        {Math.round(grandTotal + (order.deliveryFee || 0)).toLocaleString('en-IN')}
                                    </p>
                                    <span className="text-3xl font-black italic text-black dark:text-white opacity-40 ml-1">₹</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {showFooter && (
                <footer className="shrink-0 p-6 bg-white dark:bg-gray-950 border-t dark:border-gray-900 z-40">
                    <button 
                        onClick={() => onCheckout()} 
                        disabled={order.items.length === 0} 
                        className="w-full py-7 bg-black dark:bg-white text-white dark:text-black font-black rounded-[36px] shadow-2xl active:scale-95 transition-all text-base uppercase tracking-[0.4em] disabled:opacity-10"
                    >
                        Finalize Settlement
                    </button>
                </footer>
            )}
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default OrderEditor;