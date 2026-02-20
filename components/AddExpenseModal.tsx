import React, { useState, useEffect } from 'react';
import { Expense } from '../types';

interface AddEditExpenseModalProps {
    expense?: Expense | null;
    onClose: () => void;
    onSave: (data: Omit<Expense, 'id'>, id?: string) => void;
}

const expenseCategories = ['Supplies', 'Rent', 'Utilities', 'Wages', 'Marketing', 'Maintenance', 'Other'];

const AddExpenseModal: React.FC<AddEditExpenseModalProps> = ({ expense, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '' as number | '',
        category: expenseCategories[0],
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (expense) {
            setFormData({
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                date: expense.date,
            });
        }
    }, [expense]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { amount, title } = formData;
        if (!title || typeof amount !== 'number' || amount <= 0) {
            alert("Please fill in a title and a valid amount.");
            return;
        }
        
        const dataToSave = {
            ...formData,
            amount: amount as number,
        };

        onSave(dataToSave, expense?.id);
    };

    const isEditMode = !!expense;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface appearance-none text-text-primary">
                            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary" style={{ colorScheme: 'light' }}/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
