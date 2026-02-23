export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  accountType: 'google' | 'local';
  profilePicUrl?: string;
  coverPicUrl?: string;
  accessToken?: string;
  password?: string;
  enablePinLogin?: boolean;
  pinCode?: string | null;
  enableBiometricLogin?: boolean;
  biometricCredentialId?: string;
}

export interface BusinessProfile {
    businessName: string;
    tagline: string;
    email: string;
    phone: string;
    pan: string;
    profilePic: string;
    coverPic: string;
    paymentQR?: string;
    vatNumber?: string;
}

export interface Staff {
    id: string;
    name: string;
    role: 'Manager' | 'Cashier' | 'Waiter' | 'Chef' | 'Other';
    pin: string;
    payType: 'Monthly' | 'Hourly';
    salary?: number;
    hourlyRate?: number;
    overtimeRate?: number;
    joiningDate?: string;
    status: 'Active' | 'On Leave' | 'Former';
    bankAccountNumber?: string;
    pan?: string;
}

export interface DeliveryPartner {
    id: string;
    name: string;
    phone: string;
    type: 'External' | 'Self';
    vehicleNumber?: string;
    status: 'Active' | 'Inactive';
    totalOrdersHandled: number;
    balanceToPay: number; 
    balanceToCollect: number; 
}

export interface Attendance {
    id: string;
    staffId: string;
    date: string;
    clockIn: number | null;
    clockOut: number | null;
    status: 'Present' | 'Leave' | 'Half Day' | 'Sick Leave' | 'Absent';
    reason?: string;
    hoursWorked?: number;
}

export interface Roster {
    id: string;
    staffId: string;
    date: string;
    shiftStart: string;
    shiftEnd: string;
    notes?: string;
}

export interface Payroll {
    id: string;
    staffId: string;
    month: string;
    basePay: number;
    overtimePay: number;
    bonus: number;
    taxDeduction: number;
    otherDeductions: number;
    totalAmount: number;
    paidOn: number;
    paymentMethod: 'Cash' | 'Bank' | 'Check';
    status: 'Pending' | 'Paid';
}

export interface Discount {
    id: string;
    name: string;
    type: 'PERCENT' | 'AMOUNT';
    value: number;
    isActive: boolean;
    productId?: string;
}

export interface Vendor {
    id: string;
    name: string;
    phone: string;
    address: string;
    pan?: string;
}

export interface PurchaseItem {
    id: string;
    itemName: string;
    quantity: number;
    rate: number;
}

export interface Purchase {
    id: string;
    vendorId?: string;
    items: PurchaseItem[];
    timestamp: number;
    totalAmount: number;
    paidAmount: number;
    paymentMethod: 'Cash' | 'Bank' | 'Credit';
}

export interface VendorPayment {
    id: string;
    vendorId: string;
    amount: number;
    method: 'Cash' | 'Bank';
    date: number;
    type: 'Vendor Payment' | 'Advance Payment';
}

export enum MainView {
  DASHBOARD = 'DASHBOARD',
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  EXPENSES = 'EXPENSES',
  CUSTOMERS = 'CUSTOMERS',
  CREDITORS = 'CREDITORS',
  VENDORS = 'VENDORS',
  STAFF = 'STAFF',
  SETTINGS = 'SETTINGS',
  REPORTS = 'REPORTS',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
  CUSTOMER_DETAIL = 'CUSTOMER_DETAIL',
  CREDITOR_DETAIL = 'CREDITOR_DETAIL',
  VENDOR_DETAIL = 'VENDOR_DETAIL',
  STAFF_DETAIL = 'STAFF_DETAIL',
  RECYCLE_BIN = 'RECYCLE_BIN',
  CALCULATOR = 'CALCULATOR',
  BILLS = 'BILLS',
  CALENDAR = 'CALENDAR',
  ACCOUNTING = 'ACCOUNTING',
  DISCOUNTS = 'DISCOUNTS',
  ORDERS = 'ORDERS',
  ADD_ORDER = 'ADD_ORDER',
  AI_ASSISTANT = 'AI_ASSISTANT',
  HISTORICAL_DATA_ENTRY = 'HISTORICAL_DATA_ENTRY',
  COMMUNICATIONS = 'COMMUNICATIONS',
  BULK_MESSAGE = 'BULK_MESSAGE',
  KOT_LIST = 'KOT_LIST',
  TRANSACTIONS = 'TRANSACTIONS',
  TRACKER = 'TRACKER',
  WEATHER = 'WEATHER',
  NOTES = 'NOTES',
  STOCK_REPORT = 'STOCK_REPORT',
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock?: number;
    trackStock: boolean;
    isQuickAdd?: boolean;
}

export interface OrderItem {
    product: Product;
    quantity: number;
    status?: 'Active' | 'Returned' | 'Cancelled' | 'Exchanged' | 'Replacement';
    returnedQuantity?: number;
    exchangedQuantity?: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Out for Delivery' | 'Completed' | 'Cancelled' | 'Returned';

export interface Order {
    id: string;
    type: 'Takeaway' | 'Table' | 'Order';
    tableId?: string;
    items: OrderItem[];
    status: OrderStatus;
    timestamp: number;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    customerId?: string;
    creditorId?: string;
    vendorId?: string;
    deliveryPartnerId?: string;
    discount: number;
    discountType: 'PERCENT' | 'AMOUNT';
    appliedDiscountId?: string;
    appliedDiscountName?: string;
    paymentMethod?: 'Cash' | 'Bank' | 'Credit' | 'Split';
    paymentStatus?: 'Unpaid' | 'Partial' | 'Paid';
    cashPaid?: number;
    bankPaid?: number;
    grandTotal?: number;
    deliveryDate?: string;
    deliveryTime?: string;
    advanceAmount?: number;
    deliveryFee?: number;
}

export interface Expense {
    id: string;
    title: string;
    category: string;
    amount: number;
    date: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
}

export interface Creditor {
    id:string;
    name: string;
    phone: string;
    address: string;
    creditDisabled: boolean;
}

export interface Table {
    id: string;
    name: string;
    status: 'Free' | 'Occupied';
}

export interface Payment {
    id: string;
    creditorId: string;
    amount: number;
    method: 'Cash' | 'Bank';
    date: number;
    type: 'Credit Payment' | 'Advance Return' | 'Delivery Advance' | 'Delivery Settlement' | 'Direct Payment';
}

export interface DeletedItem {
    id: string;
    type: 'Expense' | 'Customer' | 'Creditor' | 'Order' | 'Product' | 'Staff' | 'Vendor' | 'Purchase' | 'Tracker';
    data: any;
    deletedAt: number;
}

export interface Reminder {
    id: string;
    title: string;
    date: string;
    type: 'Payment Due' | 'Meeting' | 'Appointment' | 'Other';
}

export interface Holiday {
    id: string;
    name: string;
    date: string;
}

export interface KOTItem {
    name: string;
    quantity: number;
}

export interface KOT {
    id: string;
    orderId: string;
    type: 'NEW' | 'UPDATE' | 'CANCEL';
    kotNumber: number;
    timestamp: number;
    items: KOTItem[];
    tableName?: string;
}

export interface Notification {
    id: string;
    text: string;
    icon: 'sale' | 'expense' | 'inventory' | 'customer' | 'system' | 'fun' | 'alert';
    timestamp: number;
    read: boolean;
    alertId?: string;
}

export interface Tracker {
    id: string;
    title: string;
    amount: number;
    dueDate: number;
    category: 'Rent' | 'Electricity' | 'Water' | 'Internet' | 'Employee' | 'Other';
    status: 'Active' | 'Paused';
    lastNotifiedMonth?: string;
}

export interface Note {
  id: string;
  categoryId: string;
  type: 'text' | 'sketch';
  title?: string;
  text?: string;
  drawingData?: string;
  timestamp: number;
}

export interface NoteCategory {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface BusinessSettings {
    workingDays: {
        sunday: boolean;
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
    };
    saveDataLocally: boolean;
    theme: Theme;
    isVatEnabled: boolean;
    isKotEnabled: boolean;
    autoApplyProductOffers: boolean;
    dailySalesTarget?: number;
}

export interface AppDataBackup {
    businessProfile: BusinessProfile;
    products: Product[];
    orders: Order[];
    payments: Payment[];
    expenses: Expense[];
    customers: Customer[];
    creditors: Creditor[];
    vendors: Vendor[];
    purchases: Purchase[];
    vendorPayments: VendorPayment[];
    staff: Staff[];
    deliveryPartners: DeliveryPartner[];
    reminders: Reminder[];
    holidays: Holiday[];
    settings: BusinessSettings;
    deletedItems: DeletedItem[];
    tables: Table[];
    discounts: Discount[];
    attendance: Attendance[];
    rosters: Roster[];
    payrolls: Payroll[];
    marketingTemplates: { text: string }[];
    nepaliMarketingTemplates: { text: string }[];
    kots: KOT[];
    notifications: Notification[];
    trackers: Tracker[];
    notes: Note[];
    noteCategories: NoteCategory[];
}

export type UnifiedContact = {
    id: string;
    name: string;
    phone: string;
    address: string;
    type: 'Customer' | 'Creditor' | 'Vendor';
    originalId: string;
};