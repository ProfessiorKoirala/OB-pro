import React, { useState, useMemo } from 'react';
import { Staff, BusinessProfile } from '../types';
import AddIcon from '../components/icons/AddIcon';
import UsersIcon from '../components/icons/UsersIcon';
import { printList } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import { Column } from '../components/PrintableList';
import AnimatedSearchBar from '../components/AnimatedSearchBar';
import HomeIcon from '../components/icons/HomeIcon';

interface StaffManagementScreenProps {
    staff: Staff[];
    onAddClick: () => void;
    onViewStaff: (staffId: string) => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex items-center space-x-3 transition-colors">
        <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
        <div>
            <p className="text-sm text-text-secondary dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold text-text-primary dark:text-white">{value}</p>
        </div>
    </div>
);


const StaffManagementScreen: React.FC<StaffManagementScreenProps> = ({ staff, onAddClick, onViewStaff, businessProfile, onHome }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFormer, setShowFormer] = useState(false);

    const { activeStaff, formerStaff, stats } = useMemo(() => {
        const active = staff.filter(s => s.status !== 'Former');
        const former = staff.filter(s => s.status === 'Former');
        const statsData = {
            total: active.length,
            active: active.filter(s => s.status === 'Active').length,
            onLeave: active.filter(s => s.status === 'On Leave').length,
        };
        return { activeStaff: active, formerStaff: former, stats: statsData };
    }, [staff]);
    
    const filteredStaff = useMemo(() => {
        let staffList = showFormer ? [...activeStaff, ...formerStaff] : activeStaff;
        
        if (!searchTerm) return staffList;

        return staffList.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeStaff, formerStaff, showFormer, searchTerm]);
    
    const formatCurrency = (value: number | undefined) => value ? `₹${value.toLocaleString('en-IN')}`: 'N/A';

    const handlePrint = () => {
        const columns: Column<Staff>[] = [
            { header: 'Name', accessor: 'name' },
            { header: 'Role', accessor: 'role' },
            { header: 'Salary/Month', accessor: (item) => formatCurrency(item.salary), align: 'right' },
            { header: 'Status', accessor: 'status' },
        ];
        printList('Staff List', columns, filteredStaff, businessProfile);
    }

    return (
        <div className="relative p-4 pb-24 bg-gray-50 dark:bg-gray-900 min-h-full transition-colors">
            <header className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1 font-black">Pro</span></h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Staff</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrint} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                            <PrinterIcon className="h-4 w-4" />
                        </button>
                        {onHome && (
                            <button onClick={onHome} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        )}
                        <button onClick={onAddClick} className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-xl active:scale-95 transition-all">
                            <AddIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatCard label="Total Staff" value={stats.total} icon={<UsersIcon className="h-5 w-5 text-primary"/>} />
                    <StatCard label="Active" value={stats.active} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>} />
                    <StatCard label="On Leave" value={stats.onLeave} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
                <div className="mt-4">
                    <AnimatedSearchBar
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Search by name or role..."
                    />
                </div>
            </header>

            <div className="space-y-3">
                {filteredStaff.length > 0 ? filteredStaff.map(member => (
                    <button 
                        key={member.id}
                        onClick={() => onViewStaff(member.id)}
                        className={`w-full text-left bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${member.status === 'Former' ? 'opacity-60' : ''}`}
                    >
                        <div className="p-3 bg-primary/10 rounded-full">
                            <UsersIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-text-primary dark:text-white">{member.name}</p>
                            <p className="text-sm text-text-secondary dark:text-gray-400">{member.role} {member.salary ? `(${formatCurrency(member.salary)}/mo)` : ''}</p>
                        </div>
                    </button>
                )) : (
                    <div className="text-center py-16 text-text-secondary bg-white dark:bg-gray-800 rounded-lg">
                        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">No Staff Found</h3>
                    </div>
                )}
            </div>

            <button
                onClick={onAddClick}
                className="fixed bottom-20 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 transition-transform transform active:scale-95 z-10"
                aria-label="Add Staff Member"
            >
                <AddIcon className="h-7 w-7" />
            </button>
        </div>
    );
};

export default StaffManagementScreen;