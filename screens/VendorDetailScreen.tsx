import React, { useMemo, useState } from 'react';
import { Vendor, Purchase, VendorPayment, BusinessProfile } from '../types';
import RecordVendorPaymentModal from '../components/vendors/RecordVendorPaymentModal';
import RecordVendorAdvanceModal from '../components/vendors/RecordVendorAdvanceModal';
import { printVendorStatement, printPurchaseBill } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import TrashIcon from '../components/icons/TrashIcon';

type TransactionHistoryItem = (Purchase & { historyType: 'purchase' }) | (VendorPayment & { historyType: 'payment' });

interface VendorDetailScreenProps {
  vendor: Vendor;
  purchases: Purchase[];
  payments: VendorPayment[];
  onBack: () => void;
  onRecordPayment: (vendorId: string, data: { amount: number; method: 'Cash' | 'Bank' }) => void;
  onRecordAdvance: (vendorId: string, data: { amount: number; method: 'Cash' | 'Bank' }) => void;
  onDeletePurchase: (purchaseId: string) => void;
  businessProfile: BusinessProfile;
  isDesktop?: boolean;
}

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const VendorDetailScreen: React.FC<VendorDetailScreenProps> = (props) => {
    const { vendor, purchases, payments, onBack, onRecordPayment, onRecordAdvance, onDeletePurchase, businessProfile, isDesktop } = props;
    const [isPaying, setIsPaying] = useState(false);
    const [isGivingAdvance, setIsGivingAdvance] = useState(false);
    const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);

    const { transactionHistory, balance, advance } = useMemo(() => {
        const vendorPurchases = purchases.filter(p => p.vendorId === vendor.id);
        const vendorPayments = payments.filter(p => p.vendorId === vendor.id);

        const totalPurchased = vendorPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPaidForPurchases = vendorPurchases.reduce((sum, p) => sum + p.paidAmount, 0);

        const totalSeparatePayments = vendorPayments
            .filter(p => p.type === 'Vendor Payment')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const totalAdvancePaid = vendorPayments
            .filter(p => p.type === 'Advance Payment')
            .reduce((sum, p) => sum + p.amount, 0);

        const effectiveBalance = totalPurchased - totalPaidForPurchases - totalSeparatePayments - totalAdvancePaid;
        
        const balance = effectiveBalance > 0 ? effectiveBalance : 0;
        const advance = effectiveBalance < 0 ? -effectiveBalance : 0;

        const historyItems: TransactionHistoryItem[] = [
            ...vendorPurchases.map(p => ({ ...p, historyType: 'purchase' as const })),
            ...vendorPayments.map(p => ({ ...p, historyType: 'payment' as const }))
        ];

        historyItems.sort((a, b) => (b.historyType === 'purchase' ? b.timestamp : b.date) - (a.historyType === 'purchase' ? a.timestamp : a.date));

        return { transactionHistory: historyItems, balance, advance };
    }, [purchases, payments, vendor.id]);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

    const handleSavePayment = (data: { amount: number; method: 'Cash' | 'Bank' }) => {
        onRecordPayment(vendor.id, data);
        setIsPaying(false);
    };

    const handleSaveAdvance = (data: { amount: number; method: 'Cash' | 'Bank' }) => {
        onRecordAdvance(vendor.id, data);
        setIsGivingAdvance(false);
    };

    const handlePrintStatement = () => {
        printVendorStatement(vendor, transactionHistory, balance, advance, businessProfile);
    };
    
    const handleConfirmDelete = () => {
        if(purchaseToDelete) {
            onDeletePurchase(purchaseToDelete.id);
            setPurchaseToDelete(null);
        }
    }

    return (
        <div className="bg-gray-50 min-h-full">
            {isPaying && <RecordVendorPaymentModal onClose={() => setIsPaying(false)} onSave={handleSavePayment} maxAmount={balance} />}
            {isGivingAdvance && <RecordVendorAdvanceModal onClose={() => setIsGivingAdvance(false)} onSave={handleSaveAdvance} />}
            {purchaseToDelete && (
                <ConfirmationModal
                    title="Delete Purchase"
                    message="Are you sure you want to delete this purchase record? This will move it to the recycle bin."
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setPurchaseToDelete(null)}
                    confirmText="Delete"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}

            <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 w-full">
                {!isDesktop && <button onClick={onBack} className="text-gray-600 p-2 -ml-2"><ArrowLeftIcon /></button>}
                <h1 className="text-xl font-bold text-text-primary text-center flex-grow">Vendor Details</h1>
                <button onClick={handlePrintStatement} className="text-primary p-2 -mr-2"><PrinterIcon className="h-6 w-6" /></button>
            </header>
            
            <main className="p-4 space-y-4 pb-24">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-text-primary">{vendor.name}</h2>
                    <p className="text-text-secondary">{vendor.phone}</p>
                    <p className="text-text-secondary text-sm">{vendor.address}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg shadow-sm text-center ${balance > 0 ? 'bg-red-50' : 'bg-white'}`}>
                        <p className="text-sm font-medium">Amount Due</p>
                        <p className={`text-xl font-bold ${balance > 0 ? 'text-red-600' : 'text-text-primary'}`}>{formatCurrency(balance)}</p>
                    </div>
                     <div className={`p-4 rounded-lg shadow-sm text-center ${advance > 0 ? 'bg-green-50' : 'bg-white'}`}>
                        <p className="text-sm font-medium text-green-800">Advance Paid</p>
                        <p className={`text-xl font-bold ${advance > 0 ? 'text-green-800' : 'text-text-primary'}`}>{formatCurrency(advance)}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                     <button onClick={() => setIsPaying(true)} disabled={balance <= 0} className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-800 disabled:bg-gray-300">Record Payment</button>
                     <button onClick={() => setIsGivingAdvance(true)} className="w-full bg-secondary text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700">Give Advance</button>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg text-text-primary mb-3">Transaction History</h3>
                    <div className="space-y-3">
                        {transactionHistory.map(item => (
                            <div key={item.id} className="border-b pb-3 last:border-b-0">
                                {item.historyType === 'purchase' ? (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-text-primary">Purchase #{item.id.slice(-6)}</p>
                                            <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <button onClick={() => printPurchaseBill(item, vendor, businessProfile)} className="text-xs font-semibold text-primary hover:underline">View/Print Bill</button>
                                                <button onClick={() => setPurchaseToDelete(item)} title="Delete Purchase" className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="font-bold text-lg text-red-600">+{formatCurrency(item.totalAmount)}</p>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-text-primary">{item.type}</p>
                                            <p className="text-xs text-gray-500">{new Date(item.date).toLocaleString()} ({item.method})</p>
                                        </div>
                                        <p className="font-bold text-lg text-green-600">-{formatCurrency(item.amount)}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VendorDetailScreen;