import React from 'react';

const PrivacyPolicyScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans p-8 md:p-16 max-w-4xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Privacy Policy</h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Last Updated: March 10, 2026</p>
            </header>

            <section className="space-y-8">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">1. Introduction</h2>
                    <p className="leading-relaxed">
                        Welcome to OB Pro ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">2. Information We Collect</h2>
                    <p className="leading-relaxed mb-4">
                        We collect information that you provide directly to us when you use the application:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Information:</strong> Name, email address, and profile picture when you sign in via Google or create a local account.</li>
                        <li><strong>Business Data:</strong> Information about your business, including products, sales, expenses, and customer details that you input into the app.</li>
                        <li><strong>Google Drive Data:</strong> If you enable Google Drive Sync, we access your Google Drive to store and retrieve your application data in a dedicated folder.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">3. How We Use Your Information</h2>
                    <p className="leading-relaxed mb-4">
                        We use the collected information to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Provide, maintain, and improve the application's features.</li>
                        <li>Synchronize your data across devices via Google Drive.</li>
                        <li>Personalize your experience and provide customer support.</li>
                        <li>Ensure the security of your account and data.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">4. Data Storage and Security</h2>
                    <p className="leading-relaxed">
                        Your data is stored locally on your device and, if enabled, on your personal Google Drive. We do not store your business data on our own servers. We implement industry-standard security measures to protect your account information.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">5. Third-Party Services</h2>
                    <p className="leading-relaxed">
                        We use Google OAuth for authentication and Google Drive API for data synchronization. These services are governed by Google's own Privacy Policy.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">6. Your Rights</h2>
                    <p className="leading-relaxed">
                        You have the right to access, correct, or delete your data at any time through the application settings. You can also revoke our access to your Google Drive through your Google Account settings.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">7. Contact Us</h2>
                    <p className="leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at sandeshkoirala009@gmail.com.
                    </p>
                </div>
            </section>

            <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                <button 
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-full text-xs uppercase tracking-[0.3em] active:scale-95 transition-all"
                >
                    Back to App
                </button>
            </footer>
        </div>
    );
};

export default PrivacyPolicyScreen;
