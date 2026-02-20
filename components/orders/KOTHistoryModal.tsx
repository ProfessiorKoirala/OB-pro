import React from 'react';
import { KOT, BusinessProfile } from '../../types';
import { printKOT } from '../../utils/printUtils';
import PrinterIcon from '../icons/PrinterIcon';

interface KOTHistoryModalProps {
    kots: KOT[];
    onClose: () => void;
    businessProfile: BusinessProfile;
}

const KOTHistoryModal: React.FC<KOTHistoryModalProps> = ({ kots, onClose, businessProfile }) => {

    const getTypeStyles = (type: KOT['type']) => {
        switch (type) {
            case 'NEW': return 'bg-blue-100 text-blue-800';
            case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
            case 'CANCEL': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">KOT History</h2>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto flex-grow">
                    {kots.length > 0 ? (
                        kots.map(kot => (
                            <div key={kot.id} className="bg-gray-50 p-3 rounded-lg border">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-text-primary">KOT #{kot.kotNumber}</h3>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTypeStyles(kot.type)}`}>
                                            {kot.type}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(kot.timestamp).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => printKOT(kot, businessProfile)} className="flex items-center space-x-1.5 text-sm text-primary font-semibold p-2 rounded-lg hover:bg-primary/10">
                                        <PrinterIcon className="h-5 w-5" />
                                        <span>Reprint</span>
                                    </button>
                                </div>
                                <ul className="mt-2 text-sm list-disc list-inside text-gray-700">
                                    {kot.items.map((item, index) => (
                                        <li key={index}><strong>{item.quantity}x</strong> {item.name}</li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No KOTs have been generated for this order yet.</p>
                    )}
                </div>
                
                <div className="p-4 border-t shrink-0">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 text-text-primary font-bold rounded-lg hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KOTHistoryModal;
