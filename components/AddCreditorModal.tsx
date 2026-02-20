import React, { useState } from 'react';

type CreditorData = {
    name: string;
    phone: string;
    address: string;
};

interface AddCreditorModalProps {
    onClose: () => void;
    onSave: (data: CreditorData) => void;
}

const AddCreditorModal: React.FC<AddCreditorModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState<CreditorData>({
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
            alert("Please fill in the creditor's name and phone number.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Add New Creditor</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save Creditor</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCreditorModal;