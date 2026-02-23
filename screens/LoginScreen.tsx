import React, { useState } from 'react';
import { User } from '../types';
import GoogleIcon from '../components/icons/GoogleIcon';
import EyeIcon from '../components/icons/EyeIcon';
import EyeSlashIcon from '../components/icons/EyeSlashIcon';

export interface LocalCredentials {
  email: string;
  name?: string;
  password?: string;
}

interface LoginScreenProps {
  onLocalLogin: (credentials: LocalCredentials) => Promise<{ user: User } | { error: string }>;
  onLocalSignUp: (credentials: LocalCredentials) => Promise<{ user: User } | { error: string }>;
  onGoogleSignInClick: () => void;
  onLoginComplete: (user: User) => void;
  onSignUpComplete: (user: User) => void;
}

const SocialIcon: React.FC<{ icon: React.ReactNode; onClick: () => void; borderColor: string; label?: string }> = ({ icon, onClick, borderColor, label }) => (
    <button 
        type="button"
        onClick={onClick}
        className={`w-14 h-14 rounded-full border ${borderColor} flex items-center justify-center transition-all active:scale-90 hover:shadow-md bg-white dark:bg-gray-800 shrink-0 overflow-hidden`}
        aria-label={label}
    >
        {icon}
    </button>
);

const LoginScreen: React.FC<LoginScreenProps> = ({ onLocalLogin, onLocalSignUp, onGoogleSignInClick, onLoginComplete, onSignUpComplete }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = isSignUp 
      ? await onLocalSignUp({ email, name, password })
      : await onLocalLogin({ email, password });

    setLoading(false);

    if ('error' in result) {
      setError(result.error);
    } else {
      if (isSignUp) onSignUpComplete(result.user);
      else onLoginComplete(result.user);
    }
  };

  const handlePremiumAction = () => {
    onGoogleSignInClick(); // Triggers the Premium Feature screen
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'google_login',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to start Google login.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
      {/* Header Branding */}
      <header className="flex justify-between items-center pt-10 px-8 shrink-0 z-20">
          <div className="flex items-center gap-1.5 animate-fade-in">
              <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic">OB</h1>
              <span className="bg-black dark:bg-white text-white dark:text-black text-[7px] font-black px-1 py-0.5 rounded italic uppercase tracking-tighter">Pro</span>
          </div>
      </header>

      <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full p-6">
        <header className="mb-12 text-center">
            <h2 className="text-4xl font-black text-black dark:text-white tracking-tight mb-2 italic">
                {isSignUp ? 'Create Account' : 'Welcome Boss'}
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                {isSignUp ? 'Empower your empire today.' : 'Please Login to proceed.'}
            </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
           {isSignUp && (
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Business Name" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="input-field pl-14"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
             </div>
           )}
           <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="input-field pl-14"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
           </div>
           <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="input-field pl-14 pr-12"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-2 active:scale-90 transition-transform z-10"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
           </div>

           {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
           
            <button type="submit" disabled={loading} className="primary-button mt-4 py-5 shadow-2xl">
                {loading ? 'Authenticating...' : (isSignUp ? 'Create My Account' : 'Sign In Now')}
                {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>}
            </button>

            <p className="text-center text-gray-400 font-medium mt-4">
                {isSignUp ? "Already have an account? " : "New to OB? "}
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-black dark:text-white font-black hover:underline underline-offset-4">
                  {isSignUp ? 'Sign In' : 'Join Now'}
                </button>
            </p>
        </form>
        
        <div className="flex items-center my-10">
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            <span className="flex-shrink mx-4 text-gray-300 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">Connect with</span>
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar pb-2">
                <SocialIcon borderColor="border-blue-100" onClick={handlePremiumAction} label="Facebook" icon={<svg className="w-6 h-6 text-[#3b5998]" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>} />
                <SocialIcon borderColor="border-gray-100" onClick={handlePremiumAction} label="Apple" icon={<svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M17.057 10.742c-.015-2.07 1.688-3.067 1.762-3.116-1.01-1.479-2.585-1.681-3.14-1.705-1.332-.136-2.602.784-3.277.784-.674 0-1.724-.766-2.83-.744-1.455.022-2.795.845-3.543 2.146-1.51 2.622-.386 6.51 1.077 8.622.715 1.031 1.564 2.188 2.684 2.146 1.078-.044 1.486-.699 2.79-.699s1.673.699 2.812.677c1.157-.022 1.915-1.054 2.62-2.072.816-1.189 1.152-2.339 1.171-2.399-.025-.011-2.254-.866-2.278-3.41zM14.512 5.093c.6-.726 1.003-1.735.892-2.743-.866.035-1.915.576-2.537 1.299-.556.637-.993 1.666-.862 2.646.966.074 1.905-.476 2.507-1.202z"/></svg>} />
                <SocialIcon borderColor="border-amber-100" onClick={handleGoogleLogin} label="Google" icon={<GoogleIcon className="w-8 h-8" />} />
                <SocialIcon borderColor="border-blue-100" onClick={handlePremiumAction} label="LinkedIn" icon={<svg className="w-6 h-6 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>} />
                <SocialIcon borderColor="border-blue-50" onClick={handlePremiumAction} label="Twitter" icon={<svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;