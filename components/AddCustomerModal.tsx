import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';

type CustomerData = {
    name: string;
    phone: string;
    address: string;
};

interface AddCustomerModalProps {
    onClose: () => void;
    onSave: (data: CustomerData) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState<CustomerData>({
        name: '',
        phone: '',
        address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim()) {
            alert("Please fill in the customer's name and phone number.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-900 rounded-t-[40px] sm:rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 shrink-0 sm:hidden"></div>

                <header className="px-8 pt-8 pb-4 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">NEW CONNECTION</p>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">
                            Add Customer
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6 overflow-y-auto no-scrollbar pb-16">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">FULL NAME *</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder="CLIENT NAME"
                                    required 
                                    className="input-field pl-12"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MOBILE NUMBER *</label>
                            <div className="relative">
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    placeholder="98XXXX"
                                    required 
                                    className="input-field pl-12"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ADDRESS</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    placeholder="CITY, LOCATION"
                                    className="input-field pl-12"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="primary-button py-6 shadow-2xl uppercase tracking-[0.3em] text-xs">
                            Secure Client Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;