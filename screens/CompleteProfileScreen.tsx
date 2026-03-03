import React, { useState } from 'react';
import { User, BusinessProfile } from '../types';

interface CompleteProfileScreenProps {
    user: User;
    initialBusinessProfile: BusinessProfile;
    onComplete: (updatedProfile: BusinessProfile) => void;
}

const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({ user, initialBusinessProfile, onComplete }) => {
    const [profile, setProfile] = useState<BusinessProfile>({
        ...initialBusinessProfile,
        businessName: '',
        email: user.email,
        phone: '',
        pan: '',
        vatNumber: '',
        profilePic: user.profilePicUrl || initialBusinessProfile.profilePic,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof BusinessProfile, string>>>({});

    const validate = () => {
        const newErrors: Partial<Record<keyof BusinessProfile, string>> = {};
        if (!profile.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!profile.phone.trim()) newErrors.phone = 'Phone number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onComplete(profile);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 bg-black text-white text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-white/20 shadow-2xl">
                            <img 
                                src={profile.profilePic} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tight">Complete Your Profile</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 opacity-80">Welcome, {user.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Business Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Ordinary Business Pro"
                            value={profile.businessName}
                            onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium ${errors.businessName ? 'border-red-500' : 'border-gray-100'}`}
                        />
                        {errors.businessName && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.businessName}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+977 98XXXXXXXX"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium ${errors.phone ? 'border-red-500' : 'border-gray-100'}`}
                            />
                            {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">PAN Number</label>
                            <input
                                type="text"
                                placeholder="Optional"
                                value={profile.pan}
                                onChange={e => setProfile({ ...profile, pan: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">VAT Number</label>
                            <input
                                type="text"
                                placeholder="Optional"
                                value={profile.vatNumber || ''}
                                onChange={e => setProfile({ ...profile, vatNumber: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-xl hover:bg-gray-900 active:scale-[0.98] transition-all uppercase italic tracking-widest"
                        >
                            Start Business
                        </button>
                    </div>
                </form>
            </div>
            
            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Ordinary Business Pro</p>
        </div>
    );
};

export default CompleteProfileScreen;
