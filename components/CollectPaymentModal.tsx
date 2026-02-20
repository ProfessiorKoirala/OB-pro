import React, { useState } from 'react';

interface PaymentData {
    amount: number;
    method: 'Cash' | 'Bank';
}

interface CollectPaymentModalProps {
    onClose: () => void;
    onSave: (data: PaymentData) => void;
}

const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({ onClose, onSave }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [method, setMethod] = useState<'Cash' | 'Bank'>('Cash');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount !== 'number' || amount <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }
        onSave({ amount, method });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Collect Payment</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount Received (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(parseFloat(e.target.value) || '')}
                            required
                            autoFocus
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setMethod('Cash')}
                                className={`py-3 text-sm font-bold rounded-lg border-2 transition-colors ${method === 'Cash' ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-gray-200'}`}
                            >
                                Cash
                            </button>
                            <button
                                type="button"
                                onClick={() => setMethod('Bank')}
                                className={`py-3 text-sm font-bold rounded-lg border-2 transition-colors ${method === 'Bank' ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-gray-200'}`}
                            >
                                Bank
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectPaymentModal;