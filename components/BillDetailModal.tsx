import React, { useState } from 'react';
import { Order } from '../types';
import PrinterIcon from './icons/PrinterIcon';
import ShareIcon from './icons/ShareIcon';
import { printOrder } from '../utils/printUtils';
import { shareBillAsText, shareOnWhatsApp } from '../utils/shareUtils';
import { calculateOrderTotals } from '../utils/calculationUtils';

interface BusinessProfile {
    businessName: string;
    tagline: string;
    email: string;
    phone: string;
    pan: string;
    profilePic: string;
    coverPic: string;
}

interface BillDetailModalProps {
    order: Order | null;
    onClose: () => void;
    isVatEnabled: boolean;
    businessProfile: BusinessProfile;
}

const BillDetailModal: React.FC<BillDetailModalProps> = ({ order, onClose, isVatEnabled, businessProfile }) => {
    const [isPrinting, setIsPrinting] = useState(false);
    if (!order) return null;

    const { subtotal, discountAmount, taxAmount, deliveryFee, grandTotal, amountDue } = calculateOrderTotals(order, isVatEnabled);
    
    const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

    const handlePrint = () => {
        setIsPrinting(true);
        printOrder(order, businessProfile, isVatEnabled, () => {
            setIsPrinting(false);
        });
    };

    const handleShare = () => {
        const billText = shareBillAsText(order, businessProfile);
        shareOnWhatsApp(billText);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={isPrinting ? undefined : onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center border-b">
                    <h2 className="text-xl font-bold text-text-primary">Order Receipt</h2>
                    <p className="text-sm text-text-secondary">{businessProfile.businessName}</p>
                </div>
                <div className="p-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-semibold text-text-primary">#{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-text-primary">{new Date(order.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-semibold text-text-primary">{order.customerName || 'Walk-in'}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-semibold text-text-primary text-right">
                            {order.paymentMethod === 'Split'
                                ? (
                                    <div className="flex flex-col items-end">
                                        <span>Split Payment</span>
                                        <span className="text-xs font-normal text-gray-500">
                                            (Cash: {formatCurrency(order.cashPaid || 0)}, Bank: {formatCurrency(order.bankPaid || 0)})
                                        </span>
                                    </div>
                                )
                                : order.paymentMethod || 'N/A'
                            }
                        </span>
                    </div>

                    <div className="border-t border-dashed my-3"></div>

                    <div>
                        {order.items.map(item => (
                            <div key={item.product.id} className="flex justify-between items-center py-1">
                                <div>
                                    <p className="font-semibold text-text-primary">{item.product.name}</p>
                                    <p className="text-gray-500">{item.quantity} x {formatCurrency(item.product.price)}</p>
                                </div>
                                <p className="font-semibold text-text-primary">{formatCurrency(item.product.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                     <div className="border-t border-dashed my-3 pt-2 space-y-1">
                         <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold text-text-primary">{formatCurrency(subtotal)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">Discount {order.appliedDiscountName ? `(${order.appliedDiscountName})` : ''}:</span>
                            <span className="font-semibold text-red-500">- {formatCurrency(discountAmount)}</span>
                        </div>
                        {deliveryFee > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee:</span>
                                <span className="font-semibold text-text-primary">{formatCurrency(deliveryFee)}</span>
                            </div>
                        )}
                        {isVatEnabled && (
                             <div className="flex justify-between">
                                <span className="text-gray-600">VAT (13%):</span>
                                <span className="font-semibold text-text-primary">{formatCurrency(taxAmount)}</span>
                            </div>
                        )}
                         <div className="flex justify-between font-bold text-text-primary pt-1">
                            <span>Grand Total:</span>
                            <span className="text-text-primary">{formatCurrency(grandTotal)}</span>
                        </div>
                        {(order.advanceAmount || 0) > 0 && (
                             <div className="flex justify-between">
                                <span className="text-gray-600">Advance Paid:</span>
                                <span className="font-semibold text-green-600">- {formatCurrency(order.advanceAmount!)}</span>
                            </div>
                        )}
                         <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t mt-2">
                            <span>Amount Due:</span>
                            <span className="text-text-primary">{formatCurrency(amountDue)}</span>
                        </div>
                     </div>
                </div>
                 <div className="p-4 bg-gray-50 rounded-b-xl flex space-x-2">
                    <button onClick={onClose} className="w-full py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">Close</button>
                    <button onClick={handleShare} className="py-2 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 flex items-center justify-center">
                        <ShareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handlePrint} className="flex-1 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 flex items-center justify-center">
                        <PrinterIcon className="h-5 w-5 mr-2" />
                        Print Bill
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillDetailModal;