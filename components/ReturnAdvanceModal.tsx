import React, { useState } from 'react';

interface ReturnData {
    amount: number;
    method: 'Cash' | 'Bank';
}

interface ReturnAdvanceModalProps {
    onClose: () => void;
    onSave: (data: ReturnData) => void;
    maxAmount: number;
}

const ReturnAdvanceModal: React.FC<ReturnAdvanceModalProps> = ({ onClose, onSave, maxAmount }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [method, setMethod] = useState<'Cash' | 'Bank'>('Cash');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = Number(amount);
        if (!numericAmount || numericAmount <= 0) {
            alert("Please enter a valid amount to return.");
            return;
        }
        if (numericAmount > maxAmount) {
            alert(`Cannot return more than the available advance of ₹${maxAmount.toFixed(2)}.`);
            return;
        }
        onSave({ amount: numericAmount, method });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Return Advance Payment</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount to Return (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(parseFloat(e.target.value) || '')}
                            required
                            autoFocus
                            max={maxAmount}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                         <p className="text-xs text-gray-500 mt-1">Maximum returnable amount: ₹{maxAmount.toFixed(2)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Return Method</label>
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
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Confirm Return</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnAdvanceModal;