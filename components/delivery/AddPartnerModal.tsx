import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DeliveryPartner } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddPartnerModalProps {
    onClose: () => void;
    onSave: (partner: Omit<DeliveryPartner, 'id' | 'totalOrdersHandled' | 'balanceToPay' | 'balanceToCollect'>) => void;
}

const AddPartnerModal: React.FC<AddPartnerModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        type: 'External' as 'External' | 'Self',
        vehicleNumber: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert("Partner name is mandatory.");
        onSave(formData);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-900 rounded-t-[40px] sm:rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[95vh] relative" 
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Handle */}
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mt-4 shrink-0 sm:hidden"></div>

                <header className="p-8 pb-4 flex justify-between items-start shrink-0">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">RECRUITMENT</p>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">New Partner</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6 overflow-y-auto no-scrollbar pb-16">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PARTNER TYPE</label>
                            <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({...formData, type: 'External'})}
                                    className={`flex-1 py-3.5 text-[10px] font-black rounded-xl transition-all ${formData.type === 'External' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
                                >EXTERNAL</button>
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({...formData, type: 'Self'})}
                                    className={`flex-1 py-3.5 text-[10px] font-black rounded-xl transition-all ${formData.type === 'Self' ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
                                >STAFF/SELF</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PARTNER NAME</label>
                            <input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="E.G. DASH DELIVERY"
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4.5 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PHONE</label>
                                <input 
                                    type="tel" 
                                    value={formData.phone} 
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="98XXXX"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4.5 px-6 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">VEHICLE NO.</label>
                                <input 
                                    type="text" 
                                    value={formData.vehicleNumber} 
                                    onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                    placeholder="BA 1 PA 123"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4.5 px-6 font-bold focus:ring-2 focus:ring-black dark:focus:ring-white outline-none shadow-inner text-black dark:text-white placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-6 bg-black dark:bg-white text-white dark:text-black font-black rounded-[28px] text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-95 transition-all">
                            Onboard Partner
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddPartnerModal;