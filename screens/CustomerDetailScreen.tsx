import React, { useMemo, useState } from 'react';
import { Customer, Order } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import UserCheckIcon from '../components/icons/UserCheckIcon';
import BillDetailModal from '../components/BillDetailModal';
import { printCustomerStatement } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';

interface BusinessProfile {
    businessName: string;
    tagline: string;
    email: string;
    phone: string;
    pan: string;
    profilePic: string;
    coverPic: string;
}

interface CustomerDetailScreenProps {
  customer: Customer;
  orders: Order[];
  onBack: () => void;
  onConvertToCreditor: (customer: Customer) => void;
  isVatEnabled: boolean;
  businessProfile: BusinessProfile;
  isDesktop?: boolean;
}

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({ customer, orders, onBack, onConvertToCreditor, isVatEnabled, businessProfile, isDesktop }) => {
    const [isConverting, setIsConverting] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const customerOrders = useMemo(() => {
        return orders
            .filter(o => o.customerId === customer.id || (o.customerName === customer.name && o.customerPhone === customer.phone))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [orders, customer]);

    const stats = useMemo(() => {
        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        return { totalSpent, totalOrders: customerOrders.length };
    }, [customerOrders]);
    
    const handleConfirmConversion = () => {
        onConvertToCreditor(customer);
        setIsConverting(false);
    };

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
    
    const handlePrintStatement = () => {
        printCustomerStatement(customer, customerOrders, stats, businessProfile);
    };

    return (
        <div className="bg-gray-50 min-h-full">
            {isConverting && (
                 <ConfirmationModal
                    title="Convert to Creditor"
                    message={`Are you sure you want to make ${customer.name} a creditor? They will be able to receive credit on sales.`}
                    onConfirm={handleConfirmConversion}
                    onCancel={() => setIsConverting(false)}
                    confirmText="Yes, Convert"
                />
            )}
            {selectedOrder && <BillDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} isVatEnabled={isVatEnabled} businessProfile={businessProfile} />}

             <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 w-full">
                {!isDesktop && <button onClick={onBack} className="text-gray-600 p-2 -ml-2"><ArrowLeftIcon /></button>}
                <h1 className="text-xl font-bold text-text-primary text-center flex-grow">Customer Details</h1>
                <button onClick={handlePrintStatement} className="text-primary p-2 -mr-2">
                    <PrinterIcon className="h-6 w-6" />
                </button>
            </header>
            
            <main className="p-4 space-y-4 pb-24">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-text-primary">{customer.name}</h2>
                    <p className="text-text-secondary">{customer.phone}</p>
                    <p className="text-text-secondary text-sm">{customer.address}</p>
                     <button
                        onClick={() => setIsConverting(true)}
                        className="mt-3 flex items-center space-x-2 text-xs bg-blue-100 text-primary font-bold px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors"
                    >
                        <UserCheckIcon className="h-4 w-4" />
                        <span>Make Creditor</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <p className="text-sm text-text-secondary">Total Spent</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(stats.totalSpent)}</p>
                    </div>
                     <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                        <p className="text-sm text-text-secondary">Total Orders</p>
                        <p className="text-xl font-bold text-primary">{stats.totalOrders}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg text-text-primary mb-3">Order History</h3>
                    <div className="space-y-3">
                        {customerOrders.length > 0 ? customerOrders.map(order => (
                            <div key={order.id} className="border-b pb-3 last:border-b-0">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-text-primary">Order #{order.id.slice(-6).toUpperCase()}</p>
                                        <p className="text-xs text-text-secondary">{new Date(order.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className="font-bold text-lg text-primary">{formatCurrency(order.grandTotal || 0)}</p>
                                </div>
                                <div className="text-right mt-2">
                                     <button onClick={() => setSelectedOrder(order)} className="text-sm font-semibold text-primary hover:underline">View Bill</button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-text-secondary text-center py-4">No orders found for this customer.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerDetailScreen;