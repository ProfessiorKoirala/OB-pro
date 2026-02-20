import React, { useState } from 'react';

type ContactType = 'Customer' | 'Creditor' | 'Vendor';

interface AddContactModalProps {
    onClose: () => void;
    onSave: (data: { name: string, phone: string, address: string, type: ContactType }) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState<ContactType>('Customer');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            alert("Please fill in the contact's name and phone number.");
            return;
        }
        onSave({ name, phone, address, type });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Add New Contact</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type *</label>
                        <div className="grid grid-cols-3 gap-2">
                           {(['Customer', 'Creditor', 'Vendor'] as ContactType[]).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`py-2 text-sm font-bold rounded-lg border-2 transition-colors ${type === t ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-gray-200'}`}
                                >
                                    {t}
                                </button>
                           ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" name="name" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input type="tel" name="phone" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                        <input type="text" name="address" id="address" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save Contact</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContactModal;