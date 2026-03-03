
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MainView, Order, Expense, Product, Creditor, Customer, Table, Payment, DeletedItem, Reminder, BusinessSettings, Holiday, AppDataBackup, User, Staff, Discount, BusinessProfile, Vendor, Purchase, VendorPayment, Theme, Attendance, Payroll, Notification, KOT, KOTItem, Tracker, Note, NoteCategory, DeliveryPartner, OrderItem, OrderStatus } from '../types';
import DashboardScreen from './DashboardScreen';
import SalesScreen from './SalesScreen';
import BottomNav from '../components/BottomNav';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import ExpensesScreen from './ExpensesScreen';
import CustomersScreen from './CustomersScreen';
import CreditorsScreen from './CreditorsScreen';
import SettingsScreen from './SettingsScreen';
import AddCustomerModal from '../components/AddCustomerModal';
import AddCreditorModal from '../components/AddCreditorModal';
import CustomerDetailScreen from './CustomerDetailScreen';
import CreditorDetailScreen from './CreditorDetailScreen';
import RecycleBinScreen from './RecycleBinScreen';
import CalculatorScreen from './CalculatorScreen';
import BillsScreen from './BillsScreen';
import { CalendarScreen } from './CalendarScreen';
import AccountingScreen from './AccountingScreen';
import InventoryScreen from './InventoryScreen';
import AddEditProductModal from '../components/inventory/AddEditProductModal';
import AddEditStaffModal from '../components/staff/AddEditStaffModal';
import StaffManagementScreen from './StaffManagementScreen';
import StaffDetailScreen from './StaffDetailScreen';
import ReportsScreen from './ReportsScreen';
import { saveDataToDrive, GAPI_TOKEN_EXPIRED_ERROR } from '../googleApi';
import { getInitialData, saveLocalDataForUser, SaveStatus, deleteLocalDataForUser } from '../utils/dataUtils';
import DiscountManagementScreen from './DiscountManagementScreen';
import AddEditDiscountModal from '../components/discounts/AddEditDiscountModal';
import VendorsScreen from './VendorsScreen';
import VendorDetailScreen from './VendorDetailScreen';
import AddEditVendorModal from '../components/vendors/AddEditVendorModal';
import AddPurchaseModal from '../components/purchases/AddPurchaseModal';
import { useMediaQuery } from '../hooks/useMediaQuery';
import DesktopLayout from '../components/desktop/DesktopLayout';
import AddTableModal from '../components/sales/AddTableModal';
import SideMenu from '../components/SideMenu';
import AiAssistantScreen from './AiAssistantScreen';
import OrdersScreen from './OrdersScreen';
import BillDetailModal from '../components/BillDetailModal';
import OrderCreationScreen from './OrderCreationScreen';
import AddExpenseModal from '../components/AddExpenseModal';
import CommunicationsScreen from './CommunicationsScreen';
import AddContactModal from '../components/communications/AddContactModal';
import BulkMessageScreen from './BulkMessageScreen';
import NotificationsDrawer from '../components/notifications/NotificationsDrawer';
import { printKOT } from '../utils/printUtils';
import KOTHistoryModal from '../components/orders/KOTHistoryModal';
import KotListScreen from './KotListScreen';
import TransactionsScreen, { UnifiedTransaction } from './TransactionsScreen';
import TrackerScreen from './TrackerScreen';
import AuthenticationPromptModal from '../components/AuthenticationPromptModal';
import ConfirmationModal from '../components/ConfirmationModal';
import WeatherScreen, { WeatherData } from './WeatherScreen';
import NotesScreen from './NotesScreen';
import StockReportScreen from './StockReportScreen';

type SyncStatus = 'Synced' | 'Syncing...' | 'Synced to Cloud & Device' | 'Synced to Cloud' | 'Saved to Device' | 'Saved to Browser' | 'Sync Failed';

const useDebouncedSave = (data: AppDataBackup, user: User, setSyncStatus: React.Dispatch<React.SetStateAction<SyncStatus>>, onLogout: () => void) => {
    useEffect(() => {
        if (!data) return;
        const handler = setTimeout(() => {
            const saveData = async () => {
                setSyncStatus('Syncing...');
                try {
                    const savePromises: Promise<any>[] = [];
                    let localSavePromise: Promise<SaveStatus> | undefined;
                    if (data.settings.saveDataLocally || user.accountType === 'local') {
                        localSavePromise = saveLocalDataForUser(user.id, data);
                        savePromises.push(localSavePromise);
                    }
                    if (user.accountType === 'google' && user.accessToken) {
                        savePromises.push(saveDataToDrive(user.accessToken, data));
                    }
                    await Promise.all(savePromises);
                    setSyncStatus('Synced');
                } catch (error) {
                    setSyncStatus('Sync Failed');
                }
            };
            saveData();
        }, 1000);
        return () => clearTimeout(handler);
    }, [data, user, setSyncStatus, onLogout]);
};

const PENDING_ORDERS_KEY_PREFIX = 'ob-pro-pending-orders-';

interface MainScreenProps {
    activeUser: User;
    initialData: AppDataBackup;
    onLogout: () => void;
    onUpdateUser: (updatedUser: User) => void;
    onUpdateUserEmail: (oldUserId: string, migratedUser: User) => void;
    onDeleteUser: (userId: string) => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ activeUser, initialData, onLogout, onUpdateUser, onUpdateUserEmail, onDeleteUser }) => {
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const [appData, setAppData] = useState<AppDataBackup>(initialData);

    // Robust destructuring with mandatory fallbacks to initialData to prevent "undefined" crashes
    const { 
        products = initialData.products || [], 
        orders = initialData.orders || [], 
        payments = initialData.payments || [], 
        expenses = initialData.expenses || [], 
        customers = initialData.customers || [], 
        creditors = initialData.creditors || [], 
        staff = initialData.staff || [], 
        tables = initialData.tables || [], 
        discounts = initialData.discounts || [], 
        vendors = initialData.vendors || [], 
        purchases = initialData.purchases || [], 
        vendorPayments = initialData.vendorPayments || [], 
        deliveryPartners = initialData.deliveryPartners || [], 
        attendance = initialData.attendance || [], 
        payrolls = initialData.payrolls || [], 
        businessProfile = initialData.businessProfile, 
        notifications = initialData.notifications || [], 
        kots = initialData.kots || [], 
        settings = initialData.settings, 
        deletedItems = initialData.deletedItems || [], 
        reminders = initialData.reminders || [], 
        holidays = initialData.holidays || [], 
        trackers = initialData.trackers || [], 
        notes = initialData.notes || [], 
        noteCategories = initialData.noteCategories || [] 
    } = appData;

    const [currentView, setCurrentView] = useState<MainView>(MainView.DASHBOARD);
    const [detailViewId, setDetailViewId] = useState<string | null>(null);
    const [isEditorActive, setEditorActive] = useState(false); 
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('Synced');
    useDebouncedSave(appData, activeUser, setSyncStatus, onLogout);

    const handleClearAllData = useCallback(() => {
        setAppData(initialData);
        alert("All data has been cleared. You can now start fresh.");
    }, [initialData]);

    const updateState = useCallback((key: keyof AppDataBackup, value: any) => {
        setAppData(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateSettings = useCallback((updates: Partial<BusinessSettings>) => {
        setAppData(prev => ({
            ...prev,
            settings: { ...prev.settings, ...updates }
        }));
    }, []);

    const goToDashboard = useCallback(() => {
        setCurrentView(MainView.DASHBOARD);
    }, []);

    const persistManualCustomer = useCallback((order: Order) => {
        if (!order.customerId && !order.creditorId && !order.vendorId && order.customerName && order.customerPhone) {
            const exists = customers.some(c => c.phone === order.customerPhone) || creditors.some(c => c.phone === order.customerPhone);
            if (!exists) {
                const newCustomer: Customer = {
                    id: `c-${Date.now()}`,
                    name: order.customerName,
                    phone: order.customerPhone,
                    address: ''
                };
                updateState('customers', [...customers, newCustomer]);
                return newCustomer.id;
            }
        }
        return null;
    }, [customers, creditors, updateState]);

    const [pendingOrders, setPendingOrders] = useState<Map<string, Order>>(() => {
        const key = `${PENDING_ORDERS_KEY_PREFIX}${activeUser.id}`;
        const saved = localStorage.getItem(key) || localStorage.getItem(`mynager-pending-orders-${activeUser.id}`);
        if (saved) { try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return new Map(parsed); } catch (e) {} }
        return new Map();
    });

    useEffect(() => {
        const key = `${PENDING_ORDERS_KEY_PREFIX}${activeUser.id}`;
        localStorage.setItem(key, JSON.stringify(Array.from(pendingOrders.entries())));
    }, [pendingOrders, activeUser.id]);

    const handleOrderComplete = useCallback((order: Order, upfrontPayment: number) => {
        const newCustomerId = persistManualCustomer(order);
        const finalOrder: Order = { 
            ...order, 
            customerId: newCustomerId || order.customerId 
        };

        const newProducts = [...products];
        order.items.forEach(item => {
            const prodIdx = newProducts.findIndex(p => p.id === item.product.id);
            if (prodIdx !== -1 && newProducts[prodIdx].trackStock) {
                newProducts[prodIdx] = {
                    ...newProducts[prodIdx],
                    stock: Math.max(0, (newProducts[prodIdx].stock || 0) - item.quantity)
                };
            }
        });
        updateState('products', newProducts);

        if (upfrontPayment > 0) {
            const newPayment: Payment = {
                id: `adv-${Date.now()}`,
                creditorId: order.creditorId || 'none', 
                amount: upfrontPayment,
                method: (order.paymentMethod === 'Bank' ? 'Bank' : 'Cash'),
                date: Date.now(),
                type: order.type === 'Order' ? 'Delivery Advance' : (order.paymentMethod === 'Credit' ? 'Credit Payment' : 'Direct Payment')
            };
            updateState('payments', [...payments, newPayment]);
            
            const notif: Notification = {
                id: `notif-${Date.now()}`,
                text: `${order.type === 'Order' ? 'Delivery Advance' : 'Payment'} of ₹${upfrontPayment} for #${order.id.slice(-6).toUpperCase()}`,
                icon: 'sale',
                timestamp: Date.now(),
                read: false
            };
            updateState('notifications', [notif, ...notifications]);
        }

        updateState('orders', [...orders, finalOrder]);
        
        setPendingOrders(prev => { 
            const newMap = new Map(prev); 
            if (finalOrder.tableId) newMap.delete(finalOrder.tableId);
            newMap.delete(finalOrder.id);
            return newMap; 
        });

        if (finalOrder.tableId) {
            updateState('tables', tables.map(t => t.id === finalOrder.tableId ? { ...t, status: 'Free' } : t));
        }
        
        setEditorActive(false);
        setCurrentView(MainView.DASHBOARD);
    }, [orders, tables, products, updateState, persistManualCustomer, notifications, payments]);

    const handleUpdateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        const oldOrder = orders[orderIndex];

        if (newStatus === 'Completed' && oldOrder.status !== 'Completed') {
            const balanceDue = (oldOrder.grandTotal || 0) - (oldOrder.advanceAmount || 0);
            if (balanceDue > 0 && oldOrder.paymentMethod !== 'Credit') {
                const methodToUse = oldOrder.paymentMethod === 'Split' ? 'Cash' : (oldOrder.paymentMethod || 'Cash');
                const newPayment: Payment = {
                    id: `settle-${Date.now()}`,
                    creditorId: oldOrder.creditorId || 'none',
                    amount: balanceDue,
                    method: methodToUse as 'Cash' | 'Bank',
                    date: Date.now(),
                    type: 'Delivery Settlement'
                };
                updateState('payments', [...payments, newPayment]);
                
                const notif: Notification = {
                    id: `notif-settle-${Date.now()}`,
                    text: `Final settlement of ₹${balanceDue} received for #${orderId.slice(-6).toUpperCase()}`,
                    icon: 'sale',
                    timestamp: Date.now(),
                    read: false
                };
                updateState('notifications', [notif, ...notifications]);
            }
        }

        const newOrder = { ...oldOrder, status: newStatus };
        updateState('orders', orders.map(o => o.id === orderId ? newOrder : o));
    }, [orders, payments, notifications, updateState]);

    const handleAdvancedReturn = useCallback((orderId: string, updatedItems: OrderItem[], adjustment: number, status: any, logistics: { date: string, time: string, newFee: number }) => {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        const oldOrder = orders[orderIndex];

        const newProducts = [...products];
        updatedItems.forEach(item => {
            const oldItem = oldOrder.items.find(i => i.product.id === item.product.id);
            const returnedDiff = (item.returnedQuantity || 0) - (oldItem?.returnedQuantity || 0);
            const exchangedDiff = (item.exchangedQuantity || 0) - (oldItem?.exchangedQuantity || 0);
            const isFreshReplacement = !oldItem && item.status === 'Replacement';

            if (returnedDiff > 0 || exchangedDiff > 0) {
                const prodIdx = newProducts.findIndex(p => p.id === item.product.id);
                if (prodIdx !== -1 && newProducts[prodIdx].trackStock) {
                    newProducts[prodIdx] = { 
                        ...newProducts[prodIdx], 
                        stock: (newProducts[prodIdx].stock || 0) + returnedDiff + exchangedDiff 
                    };
                }
            }

            if (isFreshReplacement) {
                const prodIdx = newProducts.findIndex(p => p.id === item.product.id);
                if (prodIdx !== -1 && newProducts[prodIdx].trackStock) {
                    newProducts[prodIdx] = { 
                        ...newProducts[prodIdx], 
                        stock: Math.max(0, (newProducts[prodIdx].stock || 0) - item.quantity) 
                    };
                }
            }
        });

        const newOrder: Order = { 
            ...oldOrder, 
            items: updatedItems, 
            status: status,
            deliveryDate: logistics.date,
            deliveryTime: logistics.time,
            deliveryFee: (oldOrder.deliveryFee || 0) + logistics.newFee,
            grandTotal: (oldOrder.grandTotal || 0) + adjustment
        };

        updateState('products', newProducts);
        updateState('orders', orders.map(o => o.id === orderId ? newOrder : o));

        if (adjustment !== 0) {
            const notif: Notification = {
                id: `adj-${Date.now()}`,
                text: `${adjustment < 0 ? 'Refund processed' : 'Additional charge'} of ${Math.abs(adjustment)} for #${orderId.slice(-6)}`,
                icon: 'sale',
                timestamp: Date.now(),
                read: false
            };
            updateState('notifications', [notif, ...notifications]);
        }
    }, [orders, products, updateState, notifications]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const isDraggingMenu = useRef(false);

    const unreadNotificationCount = useMemo(() => (notifications || []).filter(n => !n.read).length, [notifications]);

    const onTouchStart = (e: React.TouchEvent) => {
        if (isEditorActive || isMenuOpen) return;
        const touch = e.targetTouches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current || isEditorActive || isMenuOpen) return;
        const touch = e.targetTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        if (!isDraggingMenu.current && Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0 && touchStartRef.current.x < 50) {
                isDraggingMenu.current = true;
                setIsMenuOpen(true);
            } 
        }
    };
    
    const onTouchEnd = (e: React.TouchEvent) => {
        if (touchStartRef.current && !isMenuOpen && !isDraggingMenu.current && !isEditorActive) {
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                const swipeableViews = [MainView.DASHBOARD, MainView.SALES, MainView.EXPENSES, MainView.INVENTORY];
                const currentIndex = swipeableViews.indexOf(currentView);
                if (currentIndex !== -1) {
                    if (deltaX < 0 && currentIndex < swipeableViews.length - 1) setCurrentView(swipeableViews[currentIndex + 1]);
                    else if (deltaX > 0 && currentIndex > 0) setCurrentView(swipeableViews[currentIndex - 1]);
                }
            }
        }
        touchStartRef.current = null;
        isDraggingMenu.current = false;
    };

    const [modal, setModal] = useState<'addCustomer' | 'addCreditor' | 'addProduct' | 'addStaff' | 'addDiscount' | 'addVendor' | 'addPurchase' | 'addTable' | 'addExpense' | 'addContact' | null>(null);
    const [discountToEdit, setDiscountToEdit] = useState<Discount | null>(null);
    const [staffToEdit, setStaffToEdit] = useState<Staff | null>(null);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

    const handleDeleteOrder = useCallback((id: string) => {
        setAppData(prev => {
            const order = prev.orders.find(o => o.id === id);
            if (!order) return prev;
            
            const deletedItem: DeletedItem = { 
                id: `del-${Date.now()}`, 
                type: 'Order', 
                data: order, 
                deletedAt: Date.now() 
            };
            
            return {
                ...prev,
                deletedItems: [...prev.deletedItems, deletedItem],
                orders: prev.orders.filter(o => o.id !== id)
            };
        });
    }, []);

    const handleDeleteExpense = useCallback((id: string) => {
        setAppData(prev => {
            const expense = prev.expenses.find(e => e.id === id);
            if (!expense) return prev;
            
            const deletedItem: DeletedItem = { 
                id: `del-${Date.now()}`, 
                type: 'Expense', 
                data: expense, 
                deletedAt: Date.now() 
            };
            
            return {
                ...prev,
                deletedItems: [...prev.deletedItems, deletedItem],
                expenses: prev.expenses.filter(e => e.id !== id)
            };
        });
    }, []);

    /* Fixed: Added handleRestore to fix missing name error */
    const handleRestore = useCallback((item: DeletedItem) => {
        setAppData(prev => {
            const keyMap: Record<string, keyof AppDataBackup> = { 
                'Order': 'orders', 
                'Expense': 'expenses', 
                'Customer': 'customers', 
                'Creditor': 'creditors', 
                'Product': 'products', 
                'Staff': 'staff', 
                'Vendor': 'vendors', 
                'Purchase': 'purchases', 
                'Tracker': 'trackers' 
            };
            const targetKey = keyMap[item.type];
            if (!targetKey) return prev;
            return { 
                ...prev, 
                [targetKey]: [...(prev[targetKey] as any[]), item.data], 
                deletedItems: prev.deletedItems.filter(i => i.id !== item.id) 
            };
        });
    }, []);

    /* Fixed: Added handlePermanentlyDelete to fix missing name error */
    const handlePermanentlyDelete = useCallback((itemId: string) => {
        setAppData(prev => ({ 
            ...prev, 
            deletedItems: prev.deletedItems.filter(i => i.id !== itemId) 
        }));
    }, []);

    const renderSecondaryView = () => {
        switch(currentView) {
            case MainView.ACCOUNTING: return <AccountingScreen orders={orders} expenses={expenses} payments={payments} creditors={creditors} products={products} businessProfile={businessProfile} onHome={goToDashboard} />;
            case MainView.SETTINGS: return <SettingsScreen isVatEnabled={settings.isVatEnabled} onVatToggle={() => updateSettings({isVatEnabled: !settings.isVatEnabled})} businessSettings={settings} onUpdateBusinessSettings={updateSettings} onExportData={()=>{}} onImportData={()=>{}} onLogout={onLogout} activeUser={activeUser} onUpdateUserSettings={(u)=>onUpdateUser({...activeUser,...u})} setCurrentView={setCurrentView} onClearAllData={handleClearAllData} onDeleteUser={onDeleteUser} businessProfile={businessProfile} onUpdateBusinessProfile={(p)=>updateState('businessProfile', p)} />;
            case MainView.PROFILE: return <ProfileScreen appData={appData} profileData={businessProfile} onBack={() => setCurrentView(MainView.DASHBOARD)} onLogout={onLogout} onEdit={() => setCurrentView(MainView.EDIT_PROFILE)} />;
            case MainView.EDIT_PROFILE: return <EditProfileScreen profileData={businessProfile} activeUser={activeUser} onCancel={() => setCurrentView(MainView.PROFILE)} onSave={(u, p) => { onUpdateUser(u); updateState('businessProfile', p); setCurrentView(MainView.PROFILE); }} />;
            case MainView.KOT_LIST: return <KotListScreen kots={kots || []} onBack={() => setCurrentView(MainView.DASHBOARD)} businessProfile={businessProfile} onHome={goToDashboard} />;
            case MainView.DISCOUNTS: return <DiscountManagementScreen products={products} discounts={discounts} onAddClick={() => setModal('addDiscount')} onEditClick={(d) => { setDiscountToEdit(d); setModal('addDiscount'); }} onDelete={(id) => updateState('discounts', discounts.filter(d => d.id !== id))} onToggleStatus={(id) => updateState('discounts', discounts.map(d => d.id === id ? {...d, isActive: !d.isActive} : d))} onBack={() => setCurrentView(MainView.SETTINGS)} onHome={goToDashboard} />;
            case MainView.ORDERS: return <OrdersScreen orders={orders} customers={customers} creditors={creditors} vendors={vendors} products={products} onViewBill={(o) => {}} onEditOrder={(o) => {}} onDeleteOrder={handleDeleteOrder} onUpdateStatus={handleUpdateOrderStatus} onCancelOrder={(id, ref) => handleUpdateOrderStatus(id, 'Cancelled')} onAddNewOrder={() => setCurrentView(MainView.SALES)} businessProfile={businessProfile} onViewKots={(o) => {}} onProcessAdvancedReturn={handleAdvancedReturn} onHome={goToDashboard} />;
            case MainView.TRACKER: return <TrackerScreen trackers={trackers} orders={orders} products={products} onBack={() => setCurrentView(MainView.DASHBOARD)} onAddTracker={(t) => updateState('trackers', [...trackers, { ...t, id: `tr-${Date.now()}` }])} onUpdateTracker={(t) => updateState('trackers', trackers.map(tr => tr.id === t.id ? t : tr))} onDeleteTracker={(id) => updateState('trackers', trackers.filter(tr => tr.id !== id))} onRecordExpense={(title, amount, category) => updateState('expenses', [...expenses, { id: `exp-${Date.now()}`, title, amount, category, date: new Date().toISOString().split('T')[0] }])} onRescheduleOrder={(id, date) => updateState('orders', orders.map(o => o.id === id ? { ...o, deliveryDate: date } : o))} onUpdateStatus={handleUpdateOrderStatus} onProcessAdvancedReturn={handleAdvancedReturn} businessProfile={businessProfile} onHome={goToDashboard} />;
            case MainView.RECYCLE_BIN: return <RecycleBinScreen deletedItems={deletedItems} onRestore={handleRestore} onPermanentlyDelete={handlePermanentlyDelete} onHome={goToDashboard} />;
            case MainView.CALCULATOR: return <CalculatorScreen setCurrentView={setCurrentView} onHome={goToDashboard} />;
            case MainView.CALENDAR: return <CalendarScreen orders={orders} expenses={expenses} payments={payments} reminders={reminders} creditors={creditors} onAddReminder={()=>{}} settings={settings} holidays={holidays} onAddHoliday={()=>{}} onDeleteReminder={()=>{}} onDeleteHoliday={()=>{}} onHome={goToDashboard} />;
            case MainView.REPORTS: return <ReportsScreen orders={orders} expenses={expenses} products={products} payments={payments} onHome={goToDashboard} />;
            case MainView.STAFF: return <StaffManagementScreen staff={staff} onAddClick={() => setModal('addStaff')} onViewStaff={(id) => { setDetailViewId(id); setCurrentView(MainView.STAFF_DETAIL); }} businessProfile={businessProfile} onHome={goToDashboard} />;
            case MainView.STAFF_DETAIL: {
                const member = staff.find(s => s.id === detailViewId);
                if (!member) return null;
                return <StaffDetailScreen staffMember={member} attendance={attendance} payrolls={payrolls} onBack={() => setCurrentView(MainView.STAFF)} onEditStaff={(s)=>{setStaffToEdit(s); setModal('addStaff');}} onDeleteStaff={(id)=>updateState('staff', staff.filter(s=>s.id!==id))} onUpdateStatus={(id, stat)=>updateState('staff', staff.map(s=>s.id===id?{...s,status:stat}:s))} onClockInOut={(id, type)=>updateState('attendance', [...attendance, {id:`att-${Date.now()}`, staffId:id, date:new Date().toISOString().split('T')[0], clockIn:type==='in'?Date.now():null, clockOut:type==='out'?Date.now():null, status:'Present'}])} onMarkLeave={(id, date, type, reason)=>updateState('attendance', [...attendance, {id:`att-${Date.now()}`, staffId:id, date, status:type, reason, clockIn:null, clockOut:null}])} onDeleteAttendance={(id)=>updateState('attendance', attendance.filter(a=>a.id!==id))} onPaySalary={(id, month, amount, bonus, taxDeduction)=>updateState('payrolls', [...payrolls, {id:`pay-${Date.now()}`, staffId:id, month, amount, bonus, taxDeduction, paidOn:Date.now()}])} businessProfile={businessProfile} holidays={holidays} settings={settings} />;
            }
            case MainView.VENDORS: return <VendorsScreen vendors={vendors} onAddVendorClick={() => setModal('addVendor')} onAddPurchaseClick={() => setModal('addPurchase')} onViewVendor={(id) => { setDetailViewId(id); setCurrentView(MainView.VENDOR_DETAIL); }} businessProfile={businessProfile} onHome={goToDashboard} />;
            case MainView.VENDOR_DETAIL: {
                const vendor = vendors.find(v => v.id === detailViewId);
                if (!vendor) return null;
                return <VendorDetailScreen vendor={vendor} purchases={purchases} payments={vendorPayments} onBack={() => setCurrentView(MainView.VENDORS)} onRecordPayment={(id, data)=>updateState('vendorPayments', [...vendorPayments, {...data, id:`vp-${Date.now()}`, vendorId:id, date:Date.now(), type:'Vendor Payment'}])} onRecordAdvance={(id, data)=>updateState('vendorPayments', [...vendorPayments, {...data, id:`vp-${Date.now()}`, vendorId:id, date:Date.now(), type:'Advance Payment'}])} onDeletePurchase={(id)=>updateState('purchases', purchases.filter(p=>p.id!==id))} businessProfile={businessProfile} />;
            }
            case MainView.COMMUNICATIONS: return <CommunicationsScreen appData={appData} setAppData={setAppData} businessProfile={businessProfile} setCurrentView={setCurrentView} onAddContactClick={() => setModal('addContact')} onHome={goToDashboard} />;
            case MainView.WEATHER: return <WeatherScreen onBack={() => setCurrentView(MainView.DASHBOARD)} bossName={activeUser.name} onHome={goToDashboard} />;
            /* Fixed: Added businessProfile to NotesScreen to resolve missing property error in NotesScreen */
            case MainView.NOTES: return <NotesScreen notes={notes} categories={noteCategories} onUpdateNotes={(n)=>updateState('notes', n)} onUpdateCategories={(c)=>updateState('noteCategories', c)} onBack={() => setCurrentView(MainView.DASHBOARD)} onHome={goToDashboard} businessProfile={businessProfile} />;
            case MainView.CUSTOMERS: return <CustomersScreen customers={customers} onAddCustomerClick={() => setModal('addCustomer')} onViewCustomer={(id) => { setDetailViewId(id); setCurrentView(MainView.CUSTOMER_DETAIL); }} onConvertToCreditor={(c) => { updateState('creditors', [...creditors, { ...c, creditDisabled: false }]); updateState('customers', customers.filter(cust => cust.id !== c.id)); }} businessProfile={businessProfile} onHome={goToDashboard} />;
            case MainView.CUSTOMER_DETAIL: {
                const customer = customers.find(c => c.id === detailViewId);
                if (!customer) return null;
                return <CustomerDetailScreen customer={customer} orders={orders} onBack={() => setCurrentView(MainView.CUSTOMERS)} onConvertToCreditor={(c) => { updateState('creditors', [...creditors, { ...c, creditDisabled: false }]); updateState('customers', customers.filter(cust => cust.id !== c.id)); setCurrentView(MainView.CUSTOMERS); }} isVatEnabled={settings.isVatEnabled} businessProfile={businessProfile} />;
            }
            case MainView.CREDITORS: return <CreditorsScreen creditors={creditors} onAddCreditorClick={() => setModal('addCreditor')} onToggleCreditStatus={(id) => updateState('creditors', creditors.map(c => c.id === id ? {...c, creditDisabled: !c.creditDisabled} : c))} onViewCreditor={(id) => { setDetailViewId(id); setCurrentView(MainView.CREDITOR_DETAIL); }} businessProfile={businessProfile} onHome={goToDashboard} />;
            case MainView.CREDITOR_DETAIL: {
                const creditor = creditors.find(c => c.id === detailViewId);
                if (!creditor) return null;
                return <CreditorDetailScreen creditor={creditor} orders={orders} payments={payments} onBack={() => setCurrentView(MainView.CREDITORS)} onCollectPayment={(id, data) => updateState('payments', [...payments, { ...data, id: `p-${Date.now()}`, creditorId: id, date: Date.now(), type: 'Credit Payment' }])} onReturnAdvance={(id, data) => updateState('payments', [...payments, { ...data, id: `p-${Date.now()}`, creditorId: id, date: Date.now(), type: 'Advance Return' }])} isVatEnabled={settings.isVatEnabled} businessProfile={businessProfile} />;
            }
            case MainView.BILLS: return <BillsScreen orders={orders} expenses={expenses} isVatEnabled={settings.isVatEnabled} businessProfile={businessProfile} onDeleteOrder={handleDeleteOrder} onDeleteExpense={handleDeleteExpense} onHome={goToDashboard} activeUser={activeUser} />;
            case MainView.STOCK_REPORT: return <StockReportScreen orders={orders} products={products} purchases={purchases} onBack={() => setCurrentView(MainView.DASHBOARD)} onHome={goToDashboard} onUpdateProducts={(newProds) => updateState('products', newProds)} />;
            default: return null;
        }
    };

    if (isDesktop) {
        return <DesktopLayout appData={appData} setAppData={setAppData} activeUser={activeUser} onUpdateUser={onUpdateUser} onLogout={onLogout} onUpdateUserEmail={onUpdateUserEmail} syncStatus={syncStatus} profileData={businessProfile} setProfileData={(p)=>updateState('businessProfile', p)} pendingOrders={pendingOrders} setPendingOrders={setPendingOrders} isVatEnabled={settings.isVatEnabled} setIsVatEnabled={(v)=>updateSettings({isVatEnabled: typeof v === 'function' ? v(settings.isVatEnabled) : v})} handleClearAllData={handleClearAllData} handleDeleteTable={()=>{}} onDeleteUser={onDeleteUser} />
    }

    const swipeableViews = [MainView.DASHBOARD, MainView.SALES, MainView.EXPENSES, MainView.INVENTORY];
    const swipeIndex = swipeableViews.indexOf(currentView);
    const isSwipeableView = swipeIndex !== -1;

    return (
        <>
            <NotificationsDrawer isOpen={isNotificationsOpen} notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onMarkAsRead={(id)=>updateState('notifications', notifications.map(n=>n.id===id?{...n,read:true}:n))} onMarkAllAsRead={()=>updateState('notifications', notifications.map(n=>({...n,read:true})))} onClearAll={()=>updateState('notifications', [])} />
            <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors relative overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} setCurrentView={setCurrentView} activeUser={activeUser} settings={settings} onLogout={onLogout} />
                <div ref={scrollContainerRef} className={`absolute inset-0 w-full h-full bg-background dark:bg-gray-900 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] gpu-accelerated ${isMenuOpen ? 'shadow-2xl overflow-hidden' : ''}`} style={{ transform: isMenuOpen ? 'translate3d(288px, 0, 0) scale(0.85)' : 'translate3d(0, 0, 0)', borderRadius: isMenuOpen ? '32px' : '0px' }}>
                    {isMenuOpen && <div className="absolute inset-0 z-50 rounded-[32px] cursor-pointer" onClick={() => setIsMenuOpen(false)} />}
                    <div className="relative h-full w-full overflow-hidden">
                        <div 
                            className={`flex h-full w-[400%] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] gpu-accelerated ${!isSwipeableView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            style={{ transform: `translate3d(-${swipeIndex * 25}%, 0, 0)` }}
                        >
                            <div className="w-1/4 h-full overflow-hidden"><DashboardScreen setIsMenuOpen={setIsMenuOpen} setCurrentView={setCurrentView} businessProfile={businessProfile} orders={orders} expenses={expenses} products={products} payments={payments} vendorPayments={vendorPayments} unreadNotificationCount={unreadNotificationCount} onOpenNotifications={() => setIsNotificationsOpen(true)} settings={settings} /></div>
                            <div className="w-1/4 h-full overflow-hidden">
                                <SalesScreen 
                                    products={products} 
                                    tables={tables} 
                                    creditors={creditors} 
                                    customers={customers} 
                                    vendors={vendors} 
                                    deliveryPartners={deliveryPartners} 
                                    onUpdateDeliveryPartners={(p)=>updateState('deliveryPartners', p)} 
                                    discounts={discounts} 
                                    isVatEnabled={settings.isVatEnabled} 
                                    isKotEnabled={settings.isKotEnabled} 
                                    onOrderComplete={handleOrderComplete} 
                                    onUpdateTableStatus={(id, status) => updateState('tables', tables.map(t => t.id === id ? {...t, status} : t))} 
                                    onSavePendingOrder={(o) => {
                                        setPendingOrders(prev => {
                                            const newMap = new Map(prev);
                                            const key = (o.type === 'Table' && o.tableId) ? o.tableId : o.id;
                                            newMap.set(key, o);
                                            return newMap;
                                        });
                                    }} 
                                    onPrintKot={(order) => {
                                        const kot: KOT = {
                                            id: `kot-${Date.now()}`,
                                            orderId: order.id,
                                            type: 'NEW',
                                            kotNumber: 1, 
                                            timestamp: Date.now(),
                                            items: order.items.map(i => ({ name: i.product.name, quantity: i.quantity })),
                                            tableName: order.tableId ? tables.find(t => t.id === order.tableId)?.name : (order.type === 'Takeaway' ? 'Takeaway' : 'Delivery')
                                        };
                                        printKOT(kot, businessProfile);
                                    }} 
                                    onReprintLatestKot={() => {}} 
                                    pendingOrders={pendingOrders} 
                                    orders={orders} 
                                    onAddProductClick={() => setModal('addProduct')} 
                                    onAddTableClick={() => setModal('addTable')} 
                                    businessProfile={businessProfile} 
                                    onDeleteTable={(id)=>updateState('tables', tables.filter(t=>t.id!==id))} 
                                    onEditorToggle={setEditorActive} 
                                    onUpdateSettings={updateSettings} 
                                    businessSettings={settings} 
                                    onUpdateOrderStatus={handleUpdateOrderStatus}
                                    onHome={goToDashboard}
                                />
                            </div>
                            <div className="w-1/4 h-full overflow-hidden"><ExpensesScreen expenses={expenses} onAddClick={() => setModal('addExpense')} onEditClick={(e)=>{setExpenseToEdit(e); setModal('addExpense');}} onDeleteExpense={(id)=>updateState('expenses', expenses.filter(e=>e.id!==id))} businessProfile={businessProfile} onHome={goToDashboard} /></div>
                            <div className="w-1/4 h-full overflow-hidden"><InventoryScreen products={products} onAddProductClick={() => setModal('addProduct')} onEditProductClick={(p)=>{setProductToEdit(p); setModal('addProduct');}} onDeleteProduct={(id)=>updateState('products', products.filter(p=>p.id!==id))} onToggleQuickAdd={(id)=>updateState('products', products.map(p=>p.id===id?{...p,isQuickAdd:!p.isQuickAdd}:p))} businessProfile={businessProfile} onHome={goToDashboard} /></div>
                        </div>
                        {!isSwipeableView && <div className="absolute inset-0 h-full w-full overflow-y-auto bg-background dark:bg-gray-900 animate-fade-in no-scrollbar">{renderSecondaryView()}</div>}
                    </div>
                </div>
                {!isEditorActive && !isMenuOpen && isSwipeableView && <BottomNav currentView={currentView} setCurrentView={setCurrentView} />}
            </div>
            {modal === 'addProduct' && <AddEditProductModal product={productToEdit} onClose={() => { setModal(null); setProductToEdit(null); }} onSave={(p)=>{ if(productToEdit) updateState('products', products.map(x=>x.id===productToEdit.id?{...p, id:x.id}:x)); else updateState('products', [...products, {...p, id:`p-${Date.now()}`}]); setModal(null); setProductToEdit(null); }} />}
            {modal === 'addExpense' && <AddExpenseModal expense={expenseToEdit} onClose={() => { setModal(null); setExpenseToEdit(null); }} onSave={(e)=>{ if(expenseToEdit) updateState('expenses', expenses.map(x=>x.id===expenseToEdit.id?{...e, id:x.id}:x)); else updateState('expenses', [...expenses, {...e, id:`exp-${Date.now()}`}]); setModal(null); setExpenseToEdit(null); }} />}
            {modal === 'addTable' && <AddTableModal existingTables={tables} onClose={() => setModal(null)} onSave={(name)=>updateState('tables', [...tables, {id:`t-${Date.now()}`, name, status:'Free'}])} />}
            {modal === 'addDiscount' && <AddEditDiscountModal products={products} discount={discountToEdit} onClose={() => { setModal(null); setDiscountToEdit(null); }} onSave={(d)=>{ if(discountToEdit) updateState('discounts', discounts.map(x=>x.id===discountToEdit.id?{...d, id:x.id}:x)); else updateState('discounts', [...discounts, {...d, id:`disc-${Date.now()}`}]); setModal(null); setDiscountToEdit(null); }} />}
            {modal === 'addCustomer' && <AddCustomerModal onClose={() => setModal(null)} onSave={(data) => { updateState('customers', [...customers, { ...data, id: `c-${Date.now()}` }]); setModal(null); }} />}
            {modal === 'addCreditor' && <AddCreditorModal onClose={() => setModal(null)} onSave={(data) => { updateState('creditors', [...customers, { ...data, id: `cr-${Date.now()}`, creditDisabled: false }]); setModal(null); }} />}
            {modal === 'addStaff' && <AddEditStaffModal staffMember={staffToEdit} onClose={() => { setModal(null); setStaffToEdit(null); }} onSave={(s) => { if(staffToEdit) updateState('staff', staff.map(x => x.id === staffToEdit.id ? {...s, id: x.id} : x)); else updateState('staff', [...staff, {...s, id: `staff-${Date.now()}`, status: 'Active'}]); setModal(null); setStaffToEdit(null); }} />}
            {modal === 'addContact' && <AddContactModal onClose={() => setModal(null)} onSave={(data) => { const { type, ...rest } = data; const key = type === 'Customer' ? 'customers' : type === 'Creditor' ? 'creditors' : 'vendors'; const idPrefix = type === 'Customer' ? 'c-' : type === 'Creditor' ? 'cr-' : 'v-'; const newItem = { ...rest, id: `${idPrefix}${Date.now()}`, creditDisabled: type === 'Creditor' ? false : undefined }; updateState(key, [...(appData[key] as any), newItem]); setModal(null); }} />}
        </>
    );
};

export default MainScreen;
