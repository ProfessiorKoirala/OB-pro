
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddEditProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (data: Product) => void;
}

const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string }> = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
        <label htmlFor="stock-toggle" className="text-[11px] font-black uppercase tracking-widest text-gray-500">{label}</label>
        <button
            type="button"
            id="stock-toggle"
            className={`${
                enabled ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex items-center h-7 rounded-full w-12 transition-all active:scale-90`}
            onClick={() => onChange(!enabled)}
        >
            <span
                className={`${
                    enabled ? 'translate-x-6 bg-white dark:bg-black' : 'translate-x-1 bg-white'
                } inline-block w-5 h-5 transform rounded-full transition-transform shadow-sm`}
            />
        </button>
    </div>
);

const AddEditProductModal: React.FC<AddEditProductModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: '',
        category: '',
        price: 0,
        stock: 0,
        trackStock: true,
    });

    useEffect(() => {
        if (product) {
            setFormData(product);
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleToggleStock = (enabled: boolean) => {
        setFormData(prev => ({
            ...prev,
            trackStock: enabled,
            stock: enabled ? prev.stock : 0
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.price <= 0) {
            alert("Please provide a valid name and price.");
            return;
        }
        onSave({ ...formData, id: product?.id || '' });
    };

    const isEditMode = !!product;

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-900 rounded-t-[40px] sm:rounded-[48px] w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up" 
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 shrink-0 sm:hidden"></div>

                <header className="px-8 pt-6 pb-2 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">INVENTORY EDITOR</p>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">
                            {isEditMode ? 'Update' : 'Register'} Item
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 overflow-y-auto no-scrollbar pb-20">
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ITEM NAME</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="E.G. CLASSIC LATTE"
                                required 
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CATEGORY</label>
                            <input 
                                type="text" 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange} 
                                placeholder="E.G. BEVERAGES"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRICE (₹)</label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={formData.price || ''} 
                                    onChange={handleChange} 
                                    placeholder="0"
                                    required 
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-black text-lg focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                />
                            </div>
                            {formData.trackStock && (
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">INITIAL STOCK</label>
                                    <input 
                                        type="number" 
                                        name="stock" 
                                        value={formData.stock || ''} 
                                        onChange={handleChange} 
                                        placeholder="0"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-black text-lg focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-3xl space-y-1">
                            <Toggle enabled={formData.trackStock} onChange={handleToggleStock} label="Auto-Track Quantity" />
                            {!formData.trackStock && (
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center py-2">Stock tracking is paused for this item</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[28px] text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all">
                            Save Item Data
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddEditProductModal;
