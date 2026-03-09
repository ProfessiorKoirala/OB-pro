import React, { useState, useMemo } from 'react';
import LogoutIcon from '../components/icons/LogoutIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import PencilIcon from '../components/icons/PencilIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import SalesIcon from '../components/icons/SalesIcon';
import ReceiptIcon from '../components/icons/ReceiptIcon';
import UsersIcon from '../components/icons/UsersIcon';
import { BusinessProfile, AppDataBackup } from '../types';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: (force?: boolean, expiry?: boolean) => void;
  onEdit: () => void;
  profileData: BusinessProfile;
  appData: AppDataBackup;
  isDesktop?: boolean;
}

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-3 shadow-sm`}>
            {icon}
        </div>
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-bold text-black dark:text-white">{value}</p>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none mb-1">{label}</p>
            <p className="text-sm font-bold text-black dark:text-white truncate">{value || 'Not provided'}</p>
        </div>
    </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout, onEdit, profileData, appData, isDesktop }) => {
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const stats = useMemo(() => {
    if (!appData) return { revenue: '₹0', orders: '0', customers: '0' };
    const orders = appData.orders || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = (appData.customers || []).length + (appData.creditors || []).length;
    return {
        revenue: `₹${Math.round(totalRevenue).toLocaleString()}`,
        orders: totalOrders.toString(),
        customers: totalCustomers.toString()
    };
  }, [appData]);

  if (!profileData) return null;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-32 transition-colors">
      {isLogoutConfirmOpen && (
          <ConfirmationModal
              title="Confirm Logout"
              message="Are you sure you want to log out of OB?"
              onConfirm={onLogout}
              onCancel={() => setLogoutConfirmOpen(false)}
              confirmText="Logout"
              confirmButtonClass="bg-red-600 hover:bg-red-700"
          />
      )}
      
      <header className="fixed top-0 left-0 right-0 z-30 px-4 pt-6 pb-4 flex items-center justify-between pointer-events-none">
        <button 
            onClick={onBack} 
            className="w-11 h-11 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-black dark:text-white shadow-lg pointer-events-auto active:scale-90 transition-all border border-white/20"
        >
            <ArrowLeftIcon />
        </button>
        <button 
            onClick={onEdit}
            className="bg-black dark:bg-white text-white dark:text-black font-black text-[11px] px-6 py-3 rounded-full shadow-xl pointer-events-auto active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest"
        >
            <PencilIcon className="w-4 h-4" /> Edit Profile
        </button>
      </header>

      <main>
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img src={profileData.coverPic} alt="Cover" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center sm:items-start sm:flex-row sm:gap-6">
            <div className="relative group mb-4 sm:mb-0">
                <img 
                    src={profileData.profilePic} 
                    alt="Profile" 
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-[40px] border-4 border-white dark:border-gray-800 shadow-2xl object-cover bg-white" 
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-lg border-4 border-white dark:border-gray-800 uppercase tracking-tighter shadow-lg">Active</div>
            </div>
            <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-tight">{profileData.businessName}</h2>
                    <SparklesIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-white/80 font-bold text-sm sm:text-base uppercase tracking-[0.2em]">{profileData.tagline}</p>
            </div>
          </div>
        </div>

        {/* Lowered these cards by changing -mt-10 to mt-6 to improve cover image visibility */}
        <div className="px-6 mt-6 relative z-10">
            <div className="grid grid-cols-3 gap-4">
                <StatCard 
                    icon={<SalesIcon className="w-6 h-6 text-blue-600" />} 
                    label="Revenue" 
                    value={stats.revenue} 
                    color="bg-blue-50 dark:bg-blue-900/30" 
                />
                <StatCard 
                    icon={<ReceiptIcon className="w-6 h-6 text-purple-600" />} 
                    label="Orders" 
                    value={stats.orders} 
                    color="bg-purple-50 dark:bg-purple-900/30" 
                />
                <StatCard 
                    icon={<UsersIcon className="w-6 h-6 text-green-600" />} 
                    label="Customers" 
                    value={stats.customers} 
                    color="bg-green-50 dark:bg-green-900/30" 
                />
            </div>
        </div>

        <div className="px-6 mt-10 space-y-8">
            <div>
                <h3 className="text-lg font-black text-black dark:text-white uppercase tracking-[0.2em] mb-6 px-1">Business Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Business Email" value={profileData.email} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>} />
                    <InfoRow label="Phone Contact" value={profileData.phone} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>} />
                    <InfoRow label="PAN Number" value={profileData.pan} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 2.056c4.502 0 8.288-2.224 9.98-5.612A12.02 12.02 0 0021 7.984a11.955 11.955 0 01-2.382-3.04z"/></svg>} />
                    <InfoRow label="VAT Number" value={profileData.vatNumber || 'N/A'} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 00-2-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>} />
                </div>
            </div>

            {profileData.paymentQR && (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[48px] border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                    <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-6">Store Payment QR</h3>
                    <div className="bg-white p-4 rounded-[32px] shadow-2xl mb-4 border-8 border-gray-100 dark:border-gray-700">
                        <img src={profileData.paymentQR} alt="QR Code" className="w-48 h-48 object-contain" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center max-w-[200px]">Scan this code for quick digital settlements</p>
                </div>
            )}
            
            <div className="pt-4">
                <button
                    onClick={() => setLogoutConfirmOpen(true)}
                    className="w-full flex items-center justify-center gap-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black py-5 rounded-[32px] border border-red-100 dark:border-red-900/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                >
                  <LogoutIcon className="h-5 w-5" />
                  Sign Out of Profile
                </button>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;