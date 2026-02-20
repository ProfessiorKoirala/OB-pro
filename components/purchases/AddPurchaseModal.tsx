import React, { useState, useMemo } from 'react';
import { Purchase, PurchaseItem, Vendor } from '../../types';
import TrashIcon from '../icons/TrashIcon';

interface AddPurchaseModalProps {
    vendors: Vendor[];
    onClose: () => void;
    onSave: (data: Omit<Purchase, 'id'>) => void;
}

type PaymentStatus = 'full' | 'partial' | 'credit';

const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({ vendors, onClose, onSave }) => {
    const [vendorId, setVendorId] = useState<string>('');
    const [items, setItems] = useState<Omit<PurchaseItem, 'id'>[]>([{ itemName: '', quantity: 1, rate: 0 }]);
    
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('full');
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank'>('Cash');
    const [partialAmount, setPartialAmount] = useState<number | ''>('');

    const isVendorRequired = paymentStatus === 'partial' || paymentStatus === 'credit';

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    }, [items]);

    const handleItemChange = (index: number, field: keyof Omit<PurchaseItem, 'id'>, value: string | number) => {
        const newItems = [...items];
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        (newItems[index] as any)[field] = field === 'itemName' ? value : (isNaN(numValue) ? 0 : numValue);
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { itemName: '', quantity: 1, rate: 0 }]);
    };
    
    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isVendorRequired && !vendorId) {
            alert('Please select a vendor for partial or credit payments.');
            return;
        }
        if (items.some(item => !item.itemName.trim() || item.quantity <= 0 || item.rate < 0)) {
            alert('Please fill all item details correctly (Name, Quantity > 0, Rate >= 0).');
            return;
        }

        let finalPaidAmount: number;
        let finalPaymentMethod: 'Cash' | 'Bank' | 'Credit';

        switch (paymentStatus) {
            case 'full':
                finalPaidAmount = totalAmount;
                finalPaymentMethod = paymentMethod;
                break;
            case 'partial':
                const parsedPartial = typeof partialAmount === 'number' ? partialAmount : 0;
                if (parsedPartial <= 0 || parsedPartial >= totalAmount) {
                    alert(`For partial payment, amount must be greater than 0 and less than ${totalAmount.toFixed(2)}.`);
                    return;
                }
                finalPaidAmount = parsedPartial;
                finalPaymentMethod = paymentMethod;
                break;
            case 'credit':
                finalPaidAmount = 0;
                finalPaymentMethod = 'Credit';
                break;
        }

        const newPurchase: Omit<Purchase, 'id'> = {
            vendorId: vendorId || undefined,
            items: items.map(item => ({...item, id: `pi-${Date.now()}-${Math.random()}`})),
            timestamp: Date.now(),
            totalAmount,
            paidAmount: finalPaidAmount,
            paymentMethod: finalPaymentMethod,
        };
        
        onSave(newPurchase);
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">Record New Purchase</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div>
                        <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor
                            {isVendorRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <select id="vendorId" value={vendorId} onChange={e => setVendorId(e.target.value)} required={isVendorRequired} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-text-primary">
                            <option value="">Select a Vendor (Optional)</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Purchase Items</h3>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-2 rounded-lg space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input type="text" placeholder="Item Name" value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)} className="flex-grow p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 disabled:opacity-50 shrink-0" disabled={items.length <= 1}><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-1/4 p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                                        <span className="text-gray-500">x</span>
                                        <input type="number" placeholder="Rate" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="w-1/3 p-2 border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-secondary" />
                                        <span className="text-gray-500">=</span>
                                        <span className="flex-grow text-sm font-semibold text-right text-text-primary p-2">₹{(item.quantity * item.rate).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addItem} className="mt-2 text-sm font-semibold text-primary">+ Add another item</button>
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Status</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => setPaymentStatus('full')} className={`py-2 text-sm font-bold rounded-lg border-2 transition-colors ${paymentStatus === 'full' ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-gray-200'}`}>Full Payment</button>
                            <button type="button" onClick={() => setPaymentStatus('partial')} className={`py-2 text-sm font-bold rounded-lg border-2 transition-colors ${paymentStatus === 'partial' ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-gray-200'}`}>Partial Payment</button>
                            <button type="button" onClick={() => setPaymentStatus('credit')} className={`py-2 text-sm font-bold rounded-lg border-2 transition-colors ${paymentStatus === 'credit' ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-gray-200'}`}>Credit</button>
                        </div>
                    </div>

                    {paymentStatus !== 'credit' && (
                        <div className="space-y-4 animate-fade-in p-3 bg-gray-50 rounded-lg border">
                            <div>
                                <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                                <input
                                    type="number"
                                    id="paidAmount"
                                    value={paymentStatus === 'full' ? totalAmount : partialAmount}
                                    onChange={e => setPartialAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    placeholder={paymentStatus === 'partial' ? `Enter amount < ${totalAmount.toFixed(2)}` : ''}
                                    disabled={paymentStatus === 'full'}
                                    required={paymentStatus === 'partial'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => setPaymentMethod('Cash')} className={`py-2 text-sm font-bold rounded-lg border-2 transition-colors ${paymentMethod === 'Cash' ? 'bg-secondary text-white border-secondary' : 'bg-white text-text-primary border-gray-200'}`}>Cash</button>
                                    <button type="button" onClick={() => setPaymentMethod('Bank')} className={`py-2 text-sm font-bold rounded-lg border-2 transition-colors ${paymentMethod === 'Bank' ? 'bg-secondary text-white border-secondary' : 'bg-white text-text-primary border-gray-200'}`}>Bank</button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
                 <div className="p-4 border-t bg-gray-50 rounded-b-xl shrink-0">
                    <div className="flex justify-between font-bold text-lg mb-2 text-text-primary">
                        <span>Total Amount:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                     {(paymentStatus === 'partial' || paymentStatus === 'credit') && (
                         <div className="flex justify-between font-medium text-sm mb-4 text-red-600">
                            <span>Amount Due:</span>
                            <span>₹{(totalAmount - (paymentStatus === 'partial' ? (Number(partialAmount) || 0) : 0)).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save Purchase</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPurchaseModal;