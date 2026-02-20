import React, { useState } from 'react';
import { Customer, BusinessProfile } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import UserCheckIcon from '../components/icons/UserCheckIcon';
import { printList } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import { Column } from '../components/PrintableList';
import AnimatedSearchBar from '../components/AnimatedSearchBar';
import HomeIcon from '../components/icons/HomeIcon';

interface CustomersScreenProps {
    customers: Customer[];
    onAddCustomerClick: () => void;
    onViewCustomer: (customerId: string) => void;
    onConvertToCreditor: (customer: Customer) => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

const CustomersScreen: React.FC<CustomersScreenProps> = ({ customers, onAddCustomerClick, onViewCustomer, onConvertToCreditor, businessProfile, onHome }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customerToConvert, setCustomerToConvert] = useState<Customer | null>(null);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const handleConvertClick = (customer: Customer) => {
        setCustomerToConvert(customer);
    };

    const handleConfirmConversion = () => {
        if (customerToConvert) {
            onConvertToCreditor(customerToConvert);
            setCustomerToConvert(null);
        }
    };

    const handlePrint = () => {
        const columns: Column<Customer>[] = [
            { header: 'Name', accessor: 'name' },
            { header: 'Phone', accessor: 'phone' },
            { header: 'Address', accessor: 'address' },
        ];
        printList('Customer List', columns, filteredCustomers, businessProfile);
    };

    return (
        <div className="relative p-4 pb-24 bg-gray-50 min-h-full">
            {customerToConvert && (
                <ConfirmationModal
                    title="Convert to Creditor"
                    message={`Are you sure you want to make ${customerToConvert.name} a creditor? They will be able to receive credit on sales.`}
                    onConfirm={handleConfirmConversion}
                    onCancel={() => setCustomerToConvert(null)}
                    confirmText="Yes, Convert"
                />
            )}
            <header className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1">Pro</span></h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Customers</p>
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
                        placeholder="Search customers..."
                     />
                </div>
            </header>

            <div className="space-y-3">
                {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                    <div 
                        key={customer.id}
                        className="w-full text-left bg-white p-3 rounded-xl shadow-sm"
                    >
                        <div className="flex items-center space-x-4">
                           <div className="p-3 bg-secondary/10 rounded-full">
                             <UserIcon className="h-6 w-6 text-secondary"/>
                           </div>
                           <div className="flex-1 cursor-pointer" onClick={() => onViewCustomer(customer.id)}>
                               <p className="font-bold text-text-primary">{customer.name}</p>
                               <p className="text-sm text-text-secondary">{customer.phone}</p>
                           </div>
                           <button onClick={() => onViewCustomer(customer.id)} className="text-gray-400 hover:text-primary p-2">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                           </button>
                        </div>
                        <div className="border-t mt-3 pt-3 flex justify-end">
                            <button
                                onClick={() => handleConvertClick(customer)}
                                className="flex items-center space-x-2 text-xs bg-blue-100 text-primary font-bold px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors"
                            >
                                <UserCheckIcon className="h-4 w-4" />
                                <span>Make Creditor</span>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 text-text-secondary bg-white rounded-lg">
                        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Customers Found</h3>
                    </div>
                )}
            </div>

            <button
                onClick={onAddCustomerClick}
                className="fixed bottom-20 right-4 bg-secondary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-transform transform active:scale-95 z-10"
                aria-label="Add Customer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
        </div>
    );
};

export default CustomersScreen;