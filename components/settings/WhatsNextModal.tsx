
import React from 'react';
import CloseIcon from '../icons/CloseIcon';
import SparklesIcon from '../icons/SparklesIcon';

interface WhatsNextModalProps {
    onClose: () => void;
}

const features = [
    { title: "Advanced Inventory", description: "Track items by batch, set expiry dates, and manage stock across multiple locations." },
    { title: "Staff Permissions", description: "Create roles for your staff (e.g., Cashier, Manager) with specific access levels." },
    { title: "Dedicated Mobile Apps", description: "Get a faster, more integrated experience with native apps for Android & iOS." },
    { title: "Advanced Analytics", description: "Dive deeper into your data with customizable charts and predictive insights." },
    { title: "Payment Gateway Integration", description: "Accept online payments directly through the app via services like eSewa or Khalti." }
];

const FeatureItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
        <h4 className="font-bold text-primary dark:text-white">{title}</h4>
        <p className="text-sm text-text-secondary dark:text-gray-300">{description}</p>
    </div>
);

const WhatsNextModal: React.FC<WhatsNextModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                 <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-text-primary dark:text-gray-100 flex items-center"><SparklesIcon className="h-6 w-6 text-primary dark:text-white mr-2"/>What's Coming Next</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><CloseIcon className="h-6 w-6" /></button>
                </header>
                 <main className="p-6 overflow-y-auto flex-grow space-y-4">
                    <p className="text-center text-text-secondary dark:text-gray-400 mb-4">We're constantly working to make OB better! Here's a sneak peek at what's on our roadmap.</p>
                    {features.map(feature => <FeatureItem key={feature.title} {...feature} />)}
                 </main>
            </div>
        </div>
    );
};

export default WhatsNextModal;
