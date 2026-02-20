import React, { useState, useMemo } from 'react';
import { Staff, Payroll } from '../../types';

interface PaySalaryModalProps {
    staffMember: Staff;
    payrolls: Payroll[];
    onClose: () => void;
    onPay: (month: string, amount: number, bonus: number, taxDeduction: number) => void;
}

const PaySalaryModal: React.FC<PaySalaryModalProps> = ({ staffMember, payrolls, onClose, onPay }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [amount, setAmount] = useState<number | ''>(staffMember.salary || '');
    const [bonus, setBonus] = useState<number | ''>('');
    const [deductTax, setDeductTax] = useState(false);

    const isMonthPaid = useMemo(() => {
        return payrolls.some(p => p.staffId === staffMember.id && p.month === selectedMonth);
    }, [payrolls, staffMember.id, selectedMonth]);

    const taxAmount = useMemo(() => {
        return deductTax ? (Number(amount) || 0) * 0.01 : 0;
    }, [deductTax, amount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isMonthPaid) {
            alert('Salary for this month has already been paid.');
            return;
        }
        if (typeof amount !== 'number' || amount < 0) {
            alert('Please enter a valid salary amount.');
            return;
        }
        onPay(selectedMonth, amount, typeof bonus === 'number' ? bonus : 0, taxAmount);
    };

    const totalPayable = (typeof amount === 'number' ? amount : 0) + (typeof bonus === 'number' ? bonus : 0) - taxAmount;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Pay Salary</h2>
                    <p className="text-sm text-text-secondary">to {staffMember.name}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                        <input
                            type="month"
                            id="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Salary Amount (₹)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"
                        />
                    </div>
                    <div>
                        <label htmlFor="bonus" className="block text-sm font-medium text-gray-700 mb-1">Bonus (₹) (Optional)</label>
                        <input
                            type="number"
                            id="bonus"
                            value={bonus}
                            onChange={(e) => setBonus(parseFloat(e.target.value) || '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <label htmlFor="deductTax" className="text-sm font-medium text-gray-700">Deduct 1% Tax</label>
                        <button
                            type="button"
                            id="deductTax"
                            className={`${deductTax ? 'bg-primary' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                            onClick={() => setDeductTax(!deductTax)}
                        >
                            <span className={`${deductTax ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                        </button>
                    </div>

                    <div className="pt-2 border-t text-right">
                        {deductTax && <p className="text-xs text-red-500">Tax Deduction: -₹{taxAmount.toFixed(2)}</p>}
                        <p className="text-sm text-gray-500">Total Payable</p>
                        <p className="font-bold text-lg text-primary">₹{totalPayable.toLocaleString('en-IN')}</p>
                    </div>

                    {isMonthPaid && (
                        <p className="text-sm text-green-600 font-semibold text-center">Salary for this month is already paid.</p>
                    )}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={isMonthPaid} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400">Confirm Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaySalaryModal;