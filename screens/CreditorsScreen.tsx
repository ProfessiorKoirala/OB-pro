import React, { useState } from 'react';
import { Creditor, BusinessProfile } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import CreditCardSlashIcon from '../components/icons/CreditCardSlashIcon';
import CreditCardIcon from '../components/icons/CreditCardIcon';
import { printList } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import { Column } from '../components/PrintableList';
import AnimatedSearchBar from '../components/AnimatedSearchBar';
import HomeIcon from '../components/icons/HomeIcon';

interface CreditorsScreenProps {
    creditors: Creditor[];
    onAddCreditorClick: () => void;
    onToggleCreditStatus: (creditorId: string) => void;
    onViewCreditor: (creditorId: string) => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const UserGroupIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);


const CreditorsScreen: React.FC<CreditorsScreenProps> = ({ creditors, onAddCreditorClick, onToggleCreditStatus, onViewCreditor, businessProfile, onHome }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [creditorToToggle, setCreditorToToggle] = useState<Creditor | null>(null);

    const filteredCreditors = creditors.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const handleToggleClick = (creditor: Creditor) => {
        setCreditorToToggle(creditor);
    };

    const handleConfirmToggle = () => {
        if (creditorToToggle) {
            onToggleCreditStatus(creditorToToggle.id);
            setCreditorToToggle(null);
        }
    };

    const handlePrint = () => {
        const columns: Column<Creditor>[] = [
            { header: 'Name', accessor: 'name' },
            { header: 'Phone', accessor: 'phone' },
            { header: 'Address', accessor: 'address' },
            { header: 'Credit Status', accessor: (item) => item.creditDisabled ? 'Disabled' : 'Enabled' },
        ];
        printList('Creditor List', columns, filteredCreditors, businessProfile);
    };

    return (
        <div className="relative p-4 pb-28 bg-background min-h-full">
            {creditorToToggle && (
                <ConfirmationModal
                    title={`${creditorToToggle.creditDisabled ? 'Enable' : 'Disable'} Credit`}
                    message={`Are you sure you want to ${creditorToToggle.creditDisabled ? 'ENABLE' : 'DISABLE'} credit for ${creditorToToggle.name}? They will ${creditorToToggle.creditDisabled ? '' : 'no longer'} be able to make purchases on credit.`}
                    onConfirm={handleConfirmToggle}
                    onCancel={() => setCreditorToToggle(null)}
                    confirmText={`Yes, ${creditorToToggle.creditDisabled ? 'Enable' : 'Disable'}`}
                    confirmButtonClass={creditorToToggle.creditDisabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                />
            )}
            <header className="mb-4">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-black italic uppercase tracking-tighter">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1">Pro</span></h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Creditors</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center text-sm bg-primary/10 text-primary font-semibold px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors">
                            <PrinterIcon className="h-4 w-4 mr-2" />
                        </button>
                        {onHome && (
                            <button onClick={onHome} className="p-2 text-gray-400 hover:text-black transition-all">
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-2">
                     <AnimatedSearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Search creditors..."
                    />
                </div>
            </header>

            <div className="space-y-3">
                {filteredCreditors.length > 0 ? filteredCreditors.map(creditor => {
                    const isCreditDisabled = creditor.creditDisabled;
                    return (
                        <div 
                            key={creditor.id} 
                            className="w-full text-left bg-white p-4 rounded-xl shadow-sm"
                        >
                            <button onClick={() => onViewCreditor(creditor.id)} className="w-full flex items-center space-x-4 text-left">
                                <div className="p-3 bg-primary/10 rounded-full">
                                <UserGroupIcon className="h-6 w-6 text-primary"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-text-primary text-lg">{creditor.name}</p>
                                    <p className="text-sm text-text-secondary">{creditor.phone}</p>
                                </div>
                                <div className="text-gray-400">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </button>
                            <div className="border-t mt-3 pt-3 flex justify-end">
                                <button
                                    onClick={() => handleToggleClick(creditor)}
                                    className={`flex items-center space-x-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                        isCreditDisabled 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                                >
                                    {isCreditDisabled ? <CreditCardIcon className="h-4 w-4" /> : <CreditCardSlashIcon className="h-4 w-4" />}
                                    <span>{isCreditDisabled ? 'Enable Credit' : 'Disable Credit'}</span>
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                     <div className="text-center py-16 text-text-secondary bg-white rounded-xl">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Creditors Found</h3>
                    </div>
                )}
            </div>

            <button
                onClick={onAddCreditorClick}
                className="fixed bottom-20 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 transition-transform transform active:scale-95 z-10"
                aria-label="Add Creditor"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </button>
        </div>
    );
};

export default CreditorsScreen;