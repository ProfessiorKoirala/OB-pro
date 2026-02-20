import React, { useState, useMemo } from 'react';
import { Vendor, BusinessProfile } from '../types';
import AddIcon from '../components/icons/AddIcon';
import TruckIcon from '../components/icons/TruckIcon';
import ShoppingBagIcon from '../components/icons/ShoppingBagIcon';
import { printList } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import { Column } from '../components/PrintableList';
import AnimatedSearchBar from '../components/AnimatedSearchBar';
import HomeIcon from '../components/icons/HomeIcon';

interface VendorsScreenProps {
    vendors: Vendor[];
    onAddVendorClick: () => void;
    onAddPurchaseClick: () => void;
    onViewVendor: (vendorId: string) => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const VendorsScreen: React.FC<VendorsScreenProps> = ({ vendors, onAddVendorClick, onAddPurchaseClick, onViewVendor, businessProfile, onHome }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVendors = useMemo(() => {
        if (!searchTerm) return vendors;
        return vendors.filter(v =>
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.phone.includes(searchTerm)
        );
    }, [vendors, searchTerm]);
    
    const handlePrint = () => {
        const columns: Column<Vendor>[] = [
            { header: 'Name', accessor: 'name' },
            { header: 'Phone', accessor: 'phone' },
            { header: 'Address', accessor: 'address' },
            { header: 'PAN', accessor: 'pan' },
        ];
        printList('Vendor List', columns, filteredVendors, businessProfile);
    };

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-full">
            <header className="mb-4">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-black italic uppercase tracking-tighter leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1 font-black">Pro</span></h1>
                        <p className="text-sm text-text-secondary">Vendors & Purchases</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center text-sm bg-primary/10 text-primary font-semibold px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors">
                            <PrinterIcon className="h-4 w-4 mr-2" />
                        </button>
                        {onHome && (
                            <button onClick={onHome} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-all shadow-sm">
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
                 <div className="mt-2 space-y-2">
                    <button onClick={onAddVendorClick} className="w-full text-sm text-center bg-blue-100 text-primary p-2 rounded-lg font-semibold">
                        + Add New Vendor
                    </button>
                    <AnimatedSearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Search vendors..."
                    />
                </div>
            </header>

            <div className="space-y-3">
                {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
                    <button
                        key={vendor.id}
                        onClick={() => onViewVendor(vendor.id)}
                        className="w-full text-left bg-white p-3 rounded-xl shadow-sm flex items-center space-x-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="p-3 bg-blue-100 rounded-full">
                            <TruckIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-text-primary">{vendor.name}</p>
                            <p className="text-sm text-text-secondary">{vendor.phone}</p>
                        </div>
                        <div className="text-gray-400">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                    </button>
                )) : (
                    <div className="text-center py-16 text-text-secondary bg-white rounded-lg">
                        <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Vendors Found</h3>
                    </div>
                )}
            </div>

            <button
                onClick={onAddPurchaseClick}
                className="fixed bottom-20 right-4 bg-secondary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-transform transform active:scale-95 z-10"
                aria-label="Add Purchase"
            >
                <ShoppingBagIcon className="h-7 w-7" />
            </button>
        </div>
    );
};

export default VendorsScreen;