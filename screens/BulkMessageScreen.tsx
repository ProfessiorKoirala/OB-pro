
import React, { useState, useRef, useEffect, useMemo } from 'react';
import BackIcon from '../components/icons/BackIcon';
import { AppDataBackup } from '../types';
import FlirtyTemplateModal from '../components/communications/FlirtyTemplateModal';
import SparklesIcon from '../components/icons/SparklesIcon';

interface BulkMessageScreenProps {
    onBack: () => void;
    appData: AppDataBackup;
    setAppData: React.Dispatch<React.SetStateAction<AppDataBackup>>;
}

const CheckboxRow: React.FC<{
    label: string;
    count: number;
    checked: boolean;
    onChange: (isChecked: boolean) => void;
}> = ({ label, count, checked, onChange }) => (
    <label className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
        <div>
            <span className="font-semibold text-text-primary">{label}</span>
            <span className="text-sm text-text-secondary ml-2">({count} contacts)</span>
        </div>
        <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            className="h-5 w-5 rounded text-primary focus:ring-primary border-gray-300"
        />
    </label>
);

const BulkMessageScreen: React.FC<BulkMessageScreenProps> = ({ onBack, appData, setAppData }) => {
    const [input, setInput] = useState('');
    const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState({
        customers: false,
        creditors: false,
        vendors: false,
    });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [input]);

    const { totalRecipients, recipientNumbers } = useMemo(() => {
        const numbers = new Set<string>();
        if (selectedGroups.customers) {
            appData.customers.forEach(c => c.phone && numbers.add(c.phone));
        }
        if (selectedGroups.creditors) {
            appData.creditors.forEach(c => c.phone && numbers.add(c.phone));
        }
        if (selectedGroups.vendors) {
            appData.vendors.forEach(v => v.phone && numbers.add(v.phone));
        }
        const uniqueNumbers = Array.from(numbers);
        return {
            totalRecipients: uniqueNumbers.length,
            recipientNumbers: uniqueNumbers,
        };
    }, [selectedGroups, appData]);

    const handlePrepareSms = () => {
        if (!input.trim()) {
            alert("Please write a message first.");
            return;
        }
        if (recipientNumbers.length === 0) {
            alert("Please select at least one recipient group.");
            return;
        }
        const numbersString = recipientNumbers.join(',');
        const smsLink = `sms:${numbersString}?body=${encodeURIComponent(input)}`;
        window.location.href = smsLink;
    };
    
    const handleSelectTemplate = (templateText: string) => {
        setInput(templateText);
        setTemplateModalOpen(false);
    };

    const handleAddTemplate = (newTemplateText: string, language: 'english' | 'nepali') => {
        if (!newTemplateText.trim()) return;
        const newTemplate = { text: newTemplateText };
        const key = language === 'english' ? 'marketingTemplates' : 'nepaliMarketingTemplates';
        setAppData(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), newTemplate]
        }));
    };

    const handleDeleteTemplate = (templateIndex: number, language: 'english' | 'nepali') => {
        const key = language === 'english' ? 'marketingTemplates' : 'nepaliMarketingTemplates';
        setAppData(prev => ({
            ...prev,
            [key]: prev[key].filter((_, index) => index !== templateIndex)
        }));
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {isTemplateModalOpen && (
                <FlirtyTemplateModal
                    englishTemplates={appData.marketingTemplates || []}
                    nepaliTemplates={appData.nepaliMarketingTemplates || []}
                    onClose={() => setTemplateModalOpen(false)}
                    onSelect={handleSelectTemplate}
                    onAddTemplate={handleAddTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                />
            )}
            <header className="sticky top-0 z-10 bg-white shadow-sm p-3 flex items-center shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-gray-600">
                    <BackIcon className="h-6 w-6" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-text-primary text-xl">Bulk Message</h1>
                    <p className="text-sm text-text-secondary">Compose a message to send to your customers.</p>
                </div>
            </header>

            <main className="flex-grow p-4 space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label htmlFor="bulk-message-input" className="font-semibold text-text-primary">Your Message</label>
                    <textarea
                        id="bulk-message-input"
                        ref={textareaRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your promotional offer or invitation here..."
                        rows={6}
                        className="mt-2 w-full p-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none"
                    />
                </div>
                 <div>
                    <button
                        onClick={() => setTemplateModalOpen(true)}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-secondary/10 text-secondary font-bold rounded-lg hover:bg-secondary/20 transition-colors"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        <span>Choose a Flirty Template</span>
                    </button>
                </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-text-primary mb-3">Select Recipients</h3>
                    <div className="space-y-2">
                        <CheckboxRow label="All Customers" count={appData.customers.length} checked={selectedGroups.customers} onChange={c => setSelectedGroups(s => ({...s, customers: c}))} />
                        <CheckboxRow label="All Creditors" count={appData.creditors.length} checked={selectedGroups.creditors} onChange={c => setSelectedGroups(s => ({...s, creditors: c}))} />
                        <CheckboxRow label="All Vendors" count={appData.vendors.length} checked={selectedGroups.vendors} onChange={c => setSelectedGroups(s => ({...s, vendors: c}))} />
                    </div>
                    <div className="text-center mt-4 text-sm font-semibold text-primary">
                        Total Selected: {totalRecipients} unique recipient{totalRecipients !== 1 ? 's' : ''}
                    </div>
                 </div>

                 <div className="text-xs text-gray-500 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <strong>How it works:</strong> Tapping "Send" will open your phone's default messaging app with your message and all selected contacts pre-filled.
                </div>
            </main>
            
            <footer className="sticky bottom-0 p-4 bg-white/80 backdrop-blur-sm border-t shrink-0">
                <button 
                    onClick={handlePrepareSms}
                    disabled={!input.trim() || totalRecipients === 0}
                    className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-blue-800 disabled:bg-gray-400"
                >
                    {totalRecipients > 0 ? `Send to ${totalRecipients} Recipient${totalRecipients !== 1 ? 's' : ''}` : 'Send SMS'}
                </button>
            </footer>
        </div>
    );
};

export default BulkMessageScreen;
