import React, { useState, useEffect } from 'react';
import { Table } from '../../types';

interface AddTableModalProps {
    onClose: () => void;
    onSave: (tableName: string) => void;
    existingTables: Table[];
}

const AddTableModal: React.FC<AddTableModalProps> = ({ onClose, onSave, existingTables }) => {
    const [tableName, setTableName] = useState('');

    useEffect(() => {
        // Suggest a new table name, e.g., T10 if T9 exists
        const tableNumbers = existingTables
            .map(t => {
                const match = t.name.match(/^T(\d+)$/i);
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter(num => num > 0);
        
        const nextNumber = tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;
        setTableName(`T${nextNumber}`);
    }, [existingTables]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tableName.trim()) {
            alert("Please enter a table name.");
            return;
        }
        if (existingTables.some(t => t.name.toLowerCase() === tableName.trim().toLowerCase())) {
            alert("A table with this name already exists.");
            return;
        }
        onSave(tableName.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Add New Table</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                        <input
                            type="text"
                            id="tableName"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            required
                            autoFocus
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save Table</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTableModal;
