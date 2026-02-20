import React, { useState } from 'react';

interface PrintDateSelectorModalProps {
    onClose: () => void;
    onPrint: (date: string) => void;
}

const PrintDateSelectorModal: React.FC<PrintDateSelectorModalProps> = ({ onClose, onPrint }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const handlePrintClick = () => {
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }
        onPrint(selectedDate);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-text-primary">Print Bills by Date</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="print-date" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                        <input
                            type="date"
                            id="print-date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="button" onClick={handlePrintClick} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800">Print</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintDateSelectorModal;