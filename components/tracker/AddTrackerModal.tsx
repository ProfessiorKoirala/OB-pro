
import React, { useState } from 'react';
import { Tracker } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddTrackerModalProps {
    onClose: () => void;
    onSave: (tracker: Omit<Tracker, 'id'>) => void;
    initialData?: Tracker;
}

const categories: Tracker['category'][] = ['Rent', 'Electricity', 'Water', 'Internet', 'Employee', 'Other'];

const AddTrackerModal: React.FC<AddTrackerModalProps> = ({ onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        amount: initialData?.amount || '',
        dueDate: initialData?.dueDate || 1,
        category: initialData?.category || 'Rent' as Tracker['category'],
        status: initialData?.status || 'Active' as Tracker['status'],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.amount || !formData.dueDate) {
            alert("Please fill all required fields.");
            return;
        }
        onSave({
            ...formData,
            amount: Number(formData.amount),
            dueDate: Number(formData.dueDate)
        });
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="p-8 pb-0 flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">SETUP OBLIGATION</p>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">New Tracker</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${formData.category === cat ? 'bg-black text-white border-black shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">TRACKER TITLE</label>
                            <input 
                                type="text" 
                                value={formData.title} 
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. SHOP RENT"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">AMOUNT (₹)</label>
                                <input 
                                    type="number" 
                                    value={formData.amount} 
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-black outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">DUE DAY (1-31)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="31" 
                                    value={formData.dueDate} 
                                    onChange={e => setFormData({ ...formData, dueDate: Number(e.target.value) })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-black outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[24px] text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                            Create Tracker
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTrackerModal;
