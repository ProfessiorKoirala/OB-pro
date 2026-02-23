import React, { useState, useEffect } from 'react';
import { Staff } from '../../types';

interface AddEditStaffModalProps {
    staffMember: Staff | null;
    onClose: () => void;
    onSave: (data: Omit<Staff, 'id' | 'status'>) => void;
}

const staffRoles: Staff['role'][] = ['Manager', 'Cashier', 'Waiter', 'Chef', 'Other'];

const AddEditStaffModal: React.FC<AddEditStaffModalProps> = ({ staffMember, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: 'Waiter' as Staff['role'],
        pin: '',
        payType: 'Monthly' as Staff['payType'],
        salary: undefined as number | undefined,
        hourlyRate: undefined as number | undefined,
        overtimeRate: undefined as number | undefined,
        joiningDate: undefined as string | undefined,
        bankAccountNumber: '',
        pan: '',
    });

    useEffect(() => {
        if (staffMember) {
            setFormData({
                name: staffMember.name,
                role: staffMember.role,
                pin: staffMember.pin,
                payType: staffMember.payType || 'Monthly',
                salary: staffMember.salary,
                hourlyRate: staffMember.hourlyRate,
                overtimeRate: staffMember.overtimeRate,
                joiningDate: staffMember.joiningDate,
                bankAccountNumber: staffMember.bankAccountNumber || '',
                pan: staffMember.pan || '',
            });
        } else {
            setFormData({
                name: '',
                role: 'Waiter',
                pin: '',
                payType: 'Monthly',
                salary: undefined,
                hourlyRate: undefined,
                overtimeRate: undefined,
                joiningDate: new Date().toISOString().split('T')[0],
                bankAccountNumber: '',
                pan: '',
            });
        }
    }, [staffMember]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'pin') {
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 4) {
                setFormData(prev => ({ ...prev, pin: numericValue }));
            }
        } else if (['salary', 'hourlyRate', 'overtimeRate'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || formData.pin.length !== 4) {
            alert("Please provide a valid name and a 4-digit PIN.");
            return;
        }
        const dataToSave = { ...formData, id: staffMember?.id || `staff-${Date.now()}` };
        onSave(dataToSave);
    };

    const isEditMode = !!staffMember;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">{isEditMode ? 'Edit Staff Member' : 'Add New Staff'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div className="relative">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select name="role" id="role" value={formData.role} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface appearance-none text-text-primary">
                            {staffRoles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 top-7">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">4-Digit PIN *</label>
                        <input 
                            type="password" 
                            name="pin" 
                            id="pin" 
                            value={formData.pin} 
                            onChange={handleChange} 
                            required 
                            maxLength={4}
                            pattern="\d{4}"
                            inputMode="numeric"
                            placeholder="e.g., 1234"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"
                         />
                    </div>
                    <div className="relative">
                        <label htmlFor="payType" className="block text-sm font-medium text-gray-700 mb-1">Payment Type *</label>
                        <select name="payType" id="payType" value={formData.payType} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface appearance-none text-text-primary">
                            <option value="Monthly">Monthly Salary</option>
                            <option value="Hourly">Hourly Pay</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 top-7">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    {formData.payType === 'Monthly' ? (
                        <div>
                            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
                            <input type="number" name="salary" id="salary" value={formData.salary || ''} onChange={handleChange} placeholder="e.g., 30000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                                <input type="number" name="hourlyRate" id="hourlyRate" value={formData.hourlyRate || ''} onChange={handleChange} placeholder="e.g., 200" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                            </div>
                            <div>
                                <label htmlFor="overtimeRate" className="block text-sm font-medium text-gray-700 mb-1">Overtime Rate (₹/hr)</label>
                                <input type="number" name="overtimeRate" id="overtimeRate" value={formData.overtimeRate || ''} onChange={handleChange} placeholder="e.g., 300" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                            </div>
                        </div>
                    )}
                     <div>
                        <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                        <input type="date" name="joiningDate" id="joiningDate" value={formData.joiningDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary" style={{ colorScheme: 'light' }}/>
                    </div>
                    <div>
                        <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                        <input type="text" name="bankAccountNumber" id="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} placeholder="For salary payment" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div>
                        <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                        <input type="text" name="pan" id="pan" value={formData.pan} onChange={handleChange} placeholder="For tax purposes" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary placeholder:text-text-secondary"/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditStaffModal;