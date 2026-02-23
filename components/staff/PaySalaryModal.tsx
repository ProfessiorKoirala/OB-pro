import React, { useState, useMemo } from 'react';
import { Staff, Payroll } from '../../types';

interface PaySalaryModalProps {
    staffMember: Staff;
    payrolls: Payroll[];
    onClose: () => void;
    onPay: (payroll: Omit<Payroll, 'id'>) => void;
}

const PaySalaryModal: React.FC<PaySalaryModalProps> = ({ staffMember, payrolls, onClose, onPay }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [basePay, setBasePay] = useState<number | ''>(staffMember.salary || '');
    const [overtimePay, setOvertimePay] = useState<number | ''>('');
    const [bonus, setBonus] = useState<number | ''>('');
    const [taxDeduction, setTaxDeduction] = useState<number | ''>('');
    const [otherDeductions, setOtherDeductions] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<Payroll['paymentMethod']>('Bank');

    const isMonthPaid = useMemo(() => {
        return payrolls.some(p => p.staffId === staffMember.id && p.month === selectedMonth);
    }, [payrolls, staffMember.id, selectedMonth]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isMonthPaid) {
            alert('Salary for this month has already been paid.');
            return;
        }
        
        const totalAmount = (Number(basePay) || 0) + (Number(overtimePay) || 0) + (Number(bonus) || 0) - (Number(taxDeduction) || 0) - (Number(otherDeductions) || 0);

        onPay({
            staffId: staffMember.id,
            month: selectedMonth,
            basePay: Number(basePay) || 0,
            overtimePay: Number(overtimePay) || 0,
            bonus: Number(bonus) || 0,
            taxDeduction: Number(taxDeduction) || 0,
            otherDeductions: Number(otherDeductions) || 0,
            totalAmount,
            paidOn: Date.now(),
            paymentMethod,
            status: 'Paid'
        });
    };

    const totalPayable = (Number(basePay) || 0) + (Number(overtimePay) || 0) + (Number(bonus) || 0) - (Number(taxDeduction) || 0) - (Number(otherDeductions) || 0);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Pay Salary</h2>
                    <p className="text-sm text-text-secondary">to {staffMember.name}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="basePay" className="block text-sm font-medium text-gray-700 mb-1">Base Pay (₹)</label>
                            <input
                                type="number"
                                id="basePay"
                                value={basePay}
                                onChange={(e) => setBasePay(parseFloat(e.target.value) || '')}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="overtimePay" className="block text-sm font-medium text-gray-700 mb-1">Overtime (₹)</label>
                            <input
                                type="number"
                                id="overtimePay"
                                value={overtimePay}
                                onChange={(e) => setOvertimePay(parseFloat(e.target.value) || '')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="bonus" className="block text-sm font-medium text-gray-700 mb-1">Bonus (₹)</label>
                            <input
                                type="number"
                                id="bonus"
                                value={bonus}
                                onChange={(e) => setBonus(parseFloat(e.target.value) || '')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="taxDeduction" className="block text-sm font-medium text-gray-700 mb-1">Tax (₹)</label>
                            <input
                                type="number"
                                id="taxDeduction"
                                value={taxDeduction}
                                onChange={(e) => setTaxDeduction(parseFloat(e.target.value) || '')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="otherDeductions" className="block text-sm font-medium text-gray-700 mb-1">Other Deductions (₹)</label>
                        <input
                            type="number"
                            id="otherDeductions"
                            value={otherDeductions}
                            onChange={(e) => setOtherDeductions(parseFloat(e.target.value) || '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
                        >
                            <option value="Bank">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Check">Check</option>
                        </select>
                    </div>

                    <div className="pt-2 border-t text-right">
                        <p className="text-sm text-gray-500">Total Payable</p>
                        <p className="font-bold text-xl text-primary">₹{totalPayable.toLocaleString('en-IN')}</p>
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