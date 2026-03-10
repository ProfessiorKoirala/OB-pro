import React from 'react';

const TermsOfServiceScreen: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans p-8 md:p-16 max-w-4xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Terms of Service</h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Last Updated: March 10, 2026</p>
            </header>

            <section className="space-y-8">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">1. Acceptance of Terms</h2>
                    <p className="leading-relaxed">
                        By accessing or using OB Pro, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">2. Description of Service</h2>
                    <p className="leading-relaxed">
                        OB Pro is a business management tool designed to help users track inventory, sales, expenses, and other business-related data. The service includes data synchronization features via Google Drive.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">3. User Accounts</h2>
                    <p className="leading-relaxed">
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">4. User Content</h2>
                    <p className="leading-relaxed">
                        You retain all rights to the data you input into the application. You are solely responsible for the accuracy, quality, and legality of your data. We do not claim ownership of your business data.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">5. Prohibited Conduct</h2>
                    <p className="leading-relaxed">
                        You agree not to use the application for any illegal purposes or in any manner that could damage, disable, or impair the service.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">6. Limitation of Liability</h2>
                    <p className="leading-relaxed">
                        OB Pro is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the application.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">7. Changes to Terms</h2>
                    <p className="leading-relaxed">
                        We reserve the right to modify these Terms of Service at any time. Your continued use of the application after such changes constitutes your acceptance of the new terms.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 border-b-2 border-black dark:border-white inline-block">8. Contact Us</h2>
                    <p className="leading-relaxed">
                        If you have any questions about these Terms of Service, please contact us at sandeshkoirala009@gmail.com.
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

export default TermsOfServiceScreen;
