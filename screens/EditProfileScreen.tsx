import React, { useState, useRef } from 'react';
import CameraIcon from '../components/icons/CameraIcon';
import { BusinessProfile, User } from '../types';

interface EditProfileScreenProps {
  onCancel: () => void;
  onSave: (updatedUser: User, updatedBusiness: BusinessProfile) => void;
  profileData: BusinessProfile;
  activeUser: User;
  isDesktop?: boolean;
}

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const FormInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; type?: string; placeholder?: string }> = 
({ label, value, onChange, name, type = 'text', placeholder = '' }) => (
    <div className="space-y-1.5">
        <label htmlFor={name} className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            placeholder={placeholder}
            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold uppercase tracking-widest focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white"
            value={value}
            onChange={onChange}
        />
    </div>
);

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onCancel, onSave, profileData, activeUser, isDesktop }) => {
    const [businessFormData, setBusinessFormData] = useState<BusinessProfile>(profileData);
    const [userFormData, setUserFormData] = useState<User>(activeUser);
    
    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const triggerProfileUpload = () => profileInputRef.current?.click();
    const triggerCoverUpload = () => coverInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePic' | 'coverPic') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                if (field === 'profilePic') {
                    setBusinessFormData(prev => ({ ...prev, profilePic: base64 }));
                    setUserFormData(prev => ({ ...prev, profilePicUrl: base64 }));
                } else {
                    setBusinessFormData(prev => ({ ...prev, coverPic: base64 }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBusinessFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(userFormData, businessFormData);
    };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors font-sans">
      <header className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-md p-4 flex items-center sticky top-0 z-30 w-full border-b dark:border-gray-900">
        {!isDesktop && (
            <button onClick={onCancel} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-600 dark:text-gray-400 active:scale-90 transition-all">
              <ArrowLeftIcon />
            </button>
        )}
        <h1 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter text-center flex-grow">Global Profile</h1>
        <div className="w-12"></div>
      </header>

      <main className="p-6 space-y-10 max-w-lg mx-auto">
        {/* Media Upload Section */}
        <section className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">Brand Assets</h2>
            <div className="relative">
                <div className="h-52 bg-gray-100 dark:bg-gray-800 rounded-[40px] overflow-hidden group border-4 border-white dark:border-gray-900 shadow-sm">
                    <img src={businessFormData.coverPic} alt="Cover" className="w-full h-full object-cover" />
                    <button 
                        onClick={triggerCoverUpload} 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                    >
                        <CameraIcon className="w-8 h-8 mr-2" />
                        <span className="font-black uppercase tracking-widest text-xs">Change Cover</span>
                    </button>
                </div>
                
                <div className="absolute -bottom-10 left-8">
                    <div className="relative group">
                        <img 
                            src={userFormData.profilePicUrl || businessFormData.profilePic} 
                            alt="Profile" 
                            className="w-28 h-28 rounded-[36px] border-8 border-white dark:border-gray-950 shadow-2xl object-cover bg-white" 
                        />
                        <button 
                            onClick={triggerProfileUpload} 
                            className="absolute inset-0 bg-black/40 rounded-[28px] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                        >
                           <CameraIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <input type="file" ref={profileInputRef} onChange={(e) => handleFileChange(e, 'profilePic')} hidden accept="image/*" />
        <input type="file" ref={coverInputRef} onChange={(e) => handleFileChange(e, 'coverPic')} hidden accept="image/*" />
        
        <form onSubmit={handleSubmit} className="pt-8 space-y-8 pb-32">
            
            {/* User Account Section */}
            <div className="space-y-5">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">Account Identity</h3>
                <FormInput 
                    label="Master Account Name" 
                    name="name" 
                    value={userFormData.name} 
                    onChange={handleUserChange} 
                    placeholder="ENTER YOUR FULL NAME"
                />
            </div>

            {/* Business Profile Section */}
            <div className="space-y-5">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">Business Credentials</h3>
                <FormInput 
                    label="Business Name" 
                    name="businessName" 
                    value={businessFormData.businessName} 
                    onChange={handleBusinessChange} 
                    placeholder="YOUR SHOP OR COMPANY NAME"
                />
                <FormInput 
                    label="Tagline / Slogan" 
                    name="tagline" 
                    value={businessFormData.tagline} 
                    onChange={handleBusinessChange} 
                    placeholder="QUALITY OVER QUANTITY"
                />
                <FormInput 
                    label="Contact Email" 
                    name="email" 
                    type="email" 
                    value={businessFormData.email} 
                    onChange={handleBusinessChange} 
                    placeholder="BUSINESS@EMAIL.COM"
                />
                <FormInput 
                    label="Phone Number" 
                    name="phone" 
                    type="tel" 
                    value={businessFormData.phone} 
                    onChange={handleBusinessChange} 
                    placeholder="98XXXXXXXX"
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput 
                      label="PAN Number" 
                      name="pan" 
                      value={businessFormData.pan} 
                      onChange={handleBusinessChange} 
                      placeholder="PAN REG. NO."
                  />
                  <FormInput 
                      label="VAT Number" 
                      name="vatNumber" 
                      value={businessFormData.vatNumber || ''} 
                      onChange={handleBusinessChange} 
                      placeholder="VAT REG. NO."
                  />
                </div>
            </div>
            
            <div className="fixed bottom-10 left-0 right-0 px-10 pointer-events-none z-40">
                 <button 
                    type="submit" 
                    className="w-full pointer-events-auto bg-black dark:bg-white text-white dark:text-black font-black py-6 rounded-[32px] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.4em]"
                >
                    Sync & Save Changes
                 </button>
            </div>
        </form>
      </main>
    </div>
  );
};

export default EditProfileScreen;