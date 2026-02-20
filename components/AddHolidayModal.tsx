import React, { useState } from 'react';
import { Holiday } from '../types';

interface AddHolidayModalProps {
    onClose: () => void;
    onSave: (data: Omit<Holiday, 'id'>) => void;
}

const AddHolidayModal: React.FC<AddHolidayModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter a name for the holiday.');
            return;
        }
        onSave({ name, date });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Add New Holiday</h2>
                    <p className="text-sm text-text-secondary">Mark a specific day as a holiday or closed.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g., Christmas Day"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save Holiday</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHolidayModal;