import React, { useState } from 'react';
import { DeletedItem } from '../types';
import RestoreIcon from '../components/icons/RestoreIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import HomeIcon from '../components/icons/HomeIcon';

interface RecycleBinScreenProps {
    deletedItems: DeletedItem[];
    onRestore: (item: DeletedItem) => void;
    onPermanentlyDelete: (itemId: string) => void;
    onHome?: () => void;
}

const getItemDescription = (item: DeletedItem) => {
    switch (item.type) {
        case 'Expense':
            return `${item.data.title} - ₹${item.data.amount}`;
        case 'Customer':
        case 'Creditor':
        case 'Staff':
            return `${item.data.name} - ${item.data.phone || 'No Phone'}`;
        case 'Order':
             return `Order #${item.data.id.slice(-5)} - ₹${item.data.grandTotal?.toFixed(2)}`;
        case 'Product':
            return `${item.data.name} - ₹${item.data.price}`;
        default:
            return `Item ID: ${item.id}`;
    }
}

const RecycleBinScreen: React.FC<RecycleBinScreenProps> = ({ deletedItems, onRestore, onPermanentlyDelete, onHome }) => {
    const [itemToRestore, setItemToRestore] = useState<DeletedItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<DeletedItem | null>(null);
    
    const handleConfirmRestore = () => {
        if (itemToRestore) {
            onRestore(itemToRestore);
            setItemToRestore(null);
        }
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onPermanentlyDelete(itemToDelete.id);
            setItemToDelete(null);
        }
    };
    
    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-full">
            {itemToRestore && (
                <ConfirmationModal
                    title="Restore Item"
                    message={`Are you sure you want to restore this ${itemToRestore.type.toLowerCase()}?`}
                    onConfirm={handleConfirmRestore}
                    onCancel={() => setItemToRestore(null)}
                    confirmText="Yes, Restore"
                    confirmButtonClass="bg-green-600 hover:bg-green-700"
                />
            )}
            {itemToDelete && (
                 <ConfirmationModal
                    title="Permanently Delete"
                    message={`Are you sure you want to permanently delete this item? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setItemToDelete(null)}
                    confirmText="Delete Forever"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}

            <header className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-black italic uppercase tracking-tighter leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1 font-black">Pro</span></h1>
                        <p className="text-sm text-text-secondary mt-1">Recycle Bin</p>
                    </div>
                    {onHome && (
                        <button onClick={onHome} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-all shadow-sm">
                            <HomeIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
                <p className="text-xs text-text-secondary">Items deleted in the last 30 days are shown here.</p>
            </header>

            <div className="space-y-3">
                {deletedItems.length > 0 ? deletedItems.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-bold text-text-primary">{item.type}</p>
                            <p className="text-sm text-text-secondary">{getItemDescription(item)}</p>
                            <p className="text-xs text-gray-400 mt-1">Deleted: {new Date(item.deletedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <button onClick={() => setItemToRestore(item)} className="p-2 text-green-600 hover:bg-green-100 rounded-full">
                                <RestoreIcon className="h-5 w-5" />
                             </button>
                             <button onClick={() => setItemToDelete(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 text-text-secondary bg-white rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Recycle Bin is Empty</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecycleBinScreen;