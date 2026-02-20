
import React, { useState, useEffect } from 'react';
import { Discount, Product } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddEditDiscountModalProps {
    discount: Discount | null;
    products: Product[];
    onClose: () => void;
    onSave: (data: Omit<Discount, 'id'>) => void;
}

const AddEditDiscountModal: React.FC<AddEditDiscountModalProps> = ({ discount, products, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'PERCENT' as 'PERCENT' | 'AMOUNT',
        value: 0,
        isActive: true,
        productId: undefined as string | undefined
    });

    useEffect(() => {
        if (discount) {
            setFormData({
                name: discount.name,
                type: discount.type,
                value: discount.value,
                isActive: discount.isActive,
                productId: discount.productId
            });
        }
    }, [discount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };
    
    const handleTypeChange = (type: 'PERCENT' | 'AMOUNT') => {
        setFormData(prev => ({ ...prev, type }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.value <= 0) {
            alert("Please provide a valid name and value for the discount.");
            return;
        }
        onSave(formData);
    };

    const isEditMode = !!discount;

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="p-8 pb-0 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">OFFER EDITOR</p>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">{isEditMode ? 'Update' : 'Create'} Offer</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar max-h-[70vh]">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">OFFER LABEL</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="E.G. FESTIVE DEALS"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">OFFER TYPE</label>
                            <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <button 
                                    type="button" 
                                    onClick={() => handleTypeChange('PERCENT')} 
                                    className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all ${formData.type === 'PERCENT' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
                                >
                                    PERCENT %
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleTypeChange('AMOUNT')} 
                                    className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all ${formData.type === 'AMOUNT' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
                                >
                                    CASH ₹
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">SAVINGS VALUE</label>
                            <input 
                                type="number" 
                                name="value"
                                value={formData.value === 0 ? '' : formData.value} 
                                onChange={handleChange} 
                                placeholder="0"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-black text-lg focus:ring-2 focus:ring-black outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">APPLICABILITY</label>
                            <select 
                                name="productId"
                                value={formData.productId || ''} 
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black outline-none appearance-none"
                            >
                                <option value="">EVERYTHING (GLOBAL)</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[24px] text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all">
                            Commit Campaign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditDiscountModal;
