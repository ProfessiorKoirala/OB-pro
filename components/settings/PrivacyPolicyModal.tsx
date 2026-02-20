
import React from 'react';
import CloseIcon from '../icons/CloseIcon';
import PhoneIcon from '../icons/PhoneIcon';
import SmsIcon from '../icons/SmsIcon';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-4">
        <h3 className="font-bold text-lg text-text-primary dark:text-gray-100 mb-1">{title}</h3>
        <div className="text-sm text-text-secondary dark:text-gray-400 space-y-2">{children}</div>
    </div>
);

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">Privacy Policy</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><CloseIcon className="h-6 w-6" /></button>
                </header>
                <main className="p-6 overflow-y-auto flex-grow">
                    <p className="text-xs text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <Section title="1. Your Data is Yours">
                        <p><strong>OB is designed with your privacy as the top priority.</strong> All business data you enter into this application—including sales, expenses, inventory, customer information, and settings—is stored entirely locally on your device.</p>
                    </Section>

                    <Section title="2. How Data is Stored">
                        <p>Your data is saved in your web browser's storage or, if you grant permission, directly to a folder on your device's file system. This means your data never leaves your computer or phone unless you explicitly export it or sync it with your own Google Drive.</p>
                    </Section>

                    <Section title="3. Developer Access">
                        <p className="font-bold text-red-600">The developer (Sandesh Koirala) has absolutely NO ACCESS to your business data.</p>
                        <p>We cannot see, copy, or analyze your sales, customers, or any other sensitive information. Your business is your business, and we are committed to keeping it that way.</p>
                    </Section>

                    <Section title="4. Third-Party Services (Premium)">
                        <p>For premium users, OB offers an optional feature to sync data with your personal Google Drive account. When you use this feature, your data is transferred securely between your device and your Google Drive. This process is governed by Google's Privacy Policy. We do not have access to your Google Drive files.</p>
                    </Section>

                    <Section title="5. Contact for Business or Bug Reports">
                        <p>If you wish to build a custom website or software for your business, or if you encounter a bug in the application, you can contact the developer. Please note that this contact is for business inquiries and technical support only.</p>
                        <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
                            <p className="font-bold text-lg text-primary dark:text-white">Sandesh Koirala</p>
                            <p className="text-text-secondary dark:text-gray-300">sandeshkoirala009@gmail.com</p>
                            <p className="text-text-secondary dark:text-gray-300">+977-9825953166</p>
                            <div className="flex space-x-3 mt-3">
                                <a href="tel:+9779825953166" className="flex-1 flex items-center justify-center py-2 bg-primary dark:bg-white text-white dark:text-black font-bold rounded-lg hover:bg-blue-800 transition-colors">
                                    <PhoneIcon className="h-5 w-5 mr-2" />
                                    Call
                                </a>
                                <a href="sms:+9779825953166" className="flex-1 flex items-center justify-center py-2 bg-secondary dark:bg-gray-600 text-white dark:text-gray-100 font-bold rounded-lg hover:bg-green-700 transition-colors">
                                    <SmsIcon className="h-5 w-5 mr-2" />
                                    Send
                                </a>
                            </div>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
};

export default PrivacyPolicyModal;
