import { AppDataBackup, BusinessSettings, Product, Table, BusinessProfile, NoteCategory, DeliveryPartner } from '../types';
import { getDirectoryHandle, writeFile, readFile } from './fileSystemApi';

const mockProducts: Product[] = [
    { id: 'p1', name: 'Product A', price: 250, category: 'GENERAL', stock: 45, trackStock: true, isQuickAdd: true },
    { id: 'p2', name: 'Product B', price: 180, category: 'GENERAL', stock: 12, trackStock: true, isQuickAdd: true },
    { id: 'p3', name: 'Product C', price: 120, category: 'GENERAL', stock: 5, trackStock: true, isQuickAdd: true },
];

const mockTables: Table[] = Array.from({ length: 9 }, (_, i) => ({
    id: `t${i + 1}`,
    name: `Table 0${i + 1}`,
    status: 'Free'
}));

const initialSettings: BusinessSettings = {
    workingDays: { sunday: true, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false },
    saveDataLocally: true,
    theme: 'system',
    isVatEnabled: true,
    isKotEnabled: false,
    autoApplyProductOffers: true,
    dailySalesTarget: 2000,
};

const initialBusinessProfile: BusinessProfile = {
    businessName: 'My Business',
    tagline: 'Quality and Excellence',
    email: '',
    phone: '',
    pan: '',
    profilePic: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
    coverPic: 'https://images.unsplash.com/photo-1497515114629-48446e82d162?q=80&w=2070',
    paymentQR: '',
};

const initialMarketingTemplates = [
    { text: "Welcome to {BUSINESS_NAME}! Check out our fresh specials today." },
];
const initialNepaliMarketingTemplates = [
     { text: "{BUSINESS_NAME} मा स्वागत छ!" },
];

const initialNoteCategories: NoteCategory[] = [
    { id: 'cat-starters', name: 'Starters', order: 0 },
    { id: 'cat-mains', name: 'Mains', order: 1 },
    { id: 'cat-sides', name: 'Sides', order: 2 },
    { id: 'cat-desserts', name: 'Desserts', order: 3 },
    { id: 'cat-specials', name: 'Specials', order: 4 },
];


export const getInitialData = (): AppDataBackup => ({
    businessProfile: initialBusinessProfile,
    products: mockProducts,
    orders: [],
    payments: [],
    expenses: [],
    customers: [],
    creditors: [],
    staff: [],
    deliveryPartners: [
        { id: 'self', name: 'Self Delivery', phone: '', type: 'Self', status: 'Active', totalOrdersHandled: 0, balanceToPay: 0, balanceToCollect: 0 }
    ],
    tables: mockTables,
    deletedItems: [],
    reminders: [],
    holidays: [],
    settings: initialSettings,
    discounts: [],
    vendors: [],
    purchases: [],
    vendorPayments: [],
    attendance: [],
    payrolls: [],
    marketingTemplates: initialMarketingTemplates,
    nepaliMarketingTemplates: initialNepaliMarketingTemplates,
    kots: [],
    notifications: [],
    trackers: [],
    notes: [],
    noteCategories: initialNoteCategories,
});

export type SaveStatus = 'FILE_SYSTEM' | 'LOCAL_STORAGE' | 'LOCAL_STORAGE_FALLBACK';

/**
 * Ensures all required keys of AppDataBackup exist by merging saved data with initial defaults.
 */
export const mergeWithInitialData = (savedData: any): AppDataBackup => {
    const initial = getInitialData();
    if (!savedData || typeof savedData !== 'object') return initial;

    return {
        ...initial,
        ...savedData,
        // Guaranteed fields from merge:
        businessProfile: {
            ...initial.businessProfile,
            ...(savedData.businessProfile || {}),
        },
        settings: {
            ...initial.settings,
            ...(savedData.settings || {})
        },
        // Fallbacks for arrays:
        products: savedData.products || initial.products,
        orders: savedData.orders || initial.orders,
        payments: savedData.payments || initial.payments,
        expenses: savedData.expenses || initial.expenses,
        customers: savedData.customers || initial.customers,
        creditors: savedData.creditors || initial.creditors,
        staff: savedData.staff || initial.staff,
        deliveryPartners: savedData.deliveryPartners || initial.deliveryPartners,
        tables: savedData.tables || initial.tables,
        deletedItems: savedData.deletedItems || initial.deletedItems,
        reminders: savedData.reminders || initial.reminders,
        holidays: savedData.holidays || initial.holidays,
        discounts: savedData.discounts || initial.discounts,
        vendors: savedData.vendors || initial.vendors,
        purchases: savedData.purchases || initial.purchases,
        vendorPayments: savedData.vendorPayments || initial.vendorPayments,
        attendance: savedData.attendance || initial.attendance,
        payrolls: savedData.payrolls || initial.payrolls,
        trackers: savedData.trackers || initial.trackers,
        notes: savedData.notes || initial.notes,
        noteCategories: savedData.noteCategories || initial.noteCategories,
        notifications: savedData.notifications || initial.notifications,
        kots: savedData.kots || initial.kots,
    };
};

const parseAndMergeData = (dataStr: string): AppDataBackup => {
    try {
        const savedData = JSON.parse(dataStr);
        return mergeWithInitialData(savedData);
    } catch (e) {
        console.error("Failed to parse local data", e);
        return getInitialData();
    }
};

export const saveLocalDataForUser = async (userId: string, data: AppDataBackup): Promise<SaveStatus> => {
    const dirHandle = await getDirectoryHandle(false);
    if (dirHandle) {
        try {
            const fileName = `ob-pro-data-${userId}.json`;
            await writeFile(dirHandle, fileName, JSON.stringify(data, null, 2));
            return 'FILE_SYSTEM';
        } catch (err) {
            console.error("File system save failed, falling back to localStorage", err);
            localStorage.setItem(`ob-pro-data-${userId}`, JSON.stringify(data));
            return 'LOCAL_STORAGE_FALLBACK';
        }
    } else {
        localStorage.setItem(`ob-pro-data-${userId}`, JSON.stringify(data));
        return 'LOCAL_STORAGE';
    }
};

export const loadLocalDataForUser = async (userId: string): Promise<AppDataBackup> => {
    const dirHandle = await getDirectoryHandle(false);
    const localStorageKey = `ob-pro-data-${userId}`;
    const localStorageDataStr = localStorage.getItem(localStorageKey);

    if (dirHandle) {
        const fileName = `ob-pro-data-${userId}.json`;
        const fileContents = await readFile(dirHandle, fileName);
        if (fileContents) {
            return parseAndMergeData(fileContents);
        }
    }

    if (localStorageDataStr) {
        return parseAndMergeData(localStorageDataStr);
    }

    return getInitialData();
};

export const deleteLocalDataForUser = async (userId: string): Promise<void> => {
    localStorage.removeItem(`ob-pro-data-${userId}`);
};

export const stringToArrayBuffer = (str: string): ArrayBuffer => {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
};

export const arrayBufferToBase64Url = (buffer: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

export const base64UrlToArrayBuffer = (base64Url: string): ArrayBuffer => {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binaryString = atob(paddedBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};