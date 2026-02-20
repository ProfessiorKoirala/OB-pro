
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { UnifiedContact, AppDataBackup, BusinessProfile } from '../../types';
import PhoneIcon from '../icons/PhoneIcon';
import BackIcon from '../icons/BackIcon';
import { generateStatementText } from '../../utils/shareUtils';
import ChatBubbleDotsIcon from '../icons/ChatBubbleDotsIcon';
import QuickReplyModal from './QuickReplyModal';
import SparklesIcon from '../icons/SparklesIcon';
import FlirtyTemplateModal from './FlirtyTemplateModal';

interface ChatViewProps {
    contact: UnifiedContact;
    onBack: () => void;
    appData: AppDataBackup;
    businessProfile: BusinessProfile;
    setAppData: React.Dispatch<React.SetStateAction<AppDataBackup>>;
}

interface Message {
    id: number;
    text: string;
    timestamp: string;
}

const ChatView: React.FC<ChatViewProps> = ({ contact, onBack, appData, businessProfile, setAppData }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isQuickReplyModalOpen, setQuickReplyModalOpen] = useState(false);
    const [isFlirtyTemplateModalOpen, setFlirtyTemplateModalOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to new scroll height
        }
    }, [input]);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Open user's default SMS app
        const smsLink = `sms:${contact.phone}?body=${encodeURIComponent(input)}`;
        window.location.href = smsLink;

        setInput('');
    };

    const handleCall = () => {
        window.location.href = `tel:${contact.phone}`;
    };

    const handleSelectTemplate = (template: { text: string; attachStatement: boolean; placeholders?: string[] }) => {
        let templateText = template.text;

        if (template.placeholders && template.placeholders.length > 0) {
            template.placeholders.forEach(placeholder => {
                let replacement = '';
                switch (placeholder) {
                    case 'CONTACT_NAME':
                        replacement = contact.name;
                        break;
                    case 'BUSINESS_NAME':
                        replacement = businessProfile.businessName;
                        break;
                    case 'BALANCE': {
                        if (contact.type === 'Creditor') {
                            const creditor = appData.creditors.find(c => c.id === contact.originalId);
                            if (creditor) {
                                const creditorOrders = appData.orders.filter(o => o.creditorId === creditor.id && o.paymentMethod === 'Credit');
                                const creditorPayments = appData.payments.filter(p => p.creditorId === creditor.id);
                                const totalCredit = creditorOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
                                const totalPaid = creditorPayments.filter(p => p.type === 'Credit Payment').reduce((sum, p) => sum + p.amount, 0);
                                const totalReturned = creditorPayments.filter(p => p.type === 'Advance Return').reduce((sum, p) => sum + p.amount, 0);
                                const balance = totalCredit - totalPaid + totalReturned;
                                replacement = `₹${Math.max(0, balance).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                            } else {
                                replacement = 'your outstanding amount';
                            }
                        }
                        break;
                    }
                     case 'LAST_ORDER_DATE': {
                        const contactOrders = appData.orders.filter(o => o.customerId === contact.originalId || o.creditorId === contact.originalId).sort((a,b) => b.timestamp - a.timestamp);
                        if(contactOrders.length > 0) {
                            replacement = new Date(contactOrders[0].timestamp).toLocaleDateString('en-GB');
                        } else {
                            replacement = 'your last visit';
                        }
                        break;
                    }
                }
                templateText = templateText.replace(new RegExp(`{${placeholder}}`, 'g'), replacement);
            });
        }
        
        let newText = input ? `${input}\n${templateText}` : templateText;
        
        if (template.attachStatement) {
            const statement = generateStatementText(contact, appData, businessProfile);
            newText += `\n\n${statement}`;
        }
        
        setInput(newText);
        setQuickReplyModalOpen(false);
    };

    const handleSelectFlirtyTemplate = (templateText: string) => {
        setInput(prev => prev ? `${prev}\n${templateText}` : templateText);
        setFlirtyTemplateModalOpen(false);
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
        <div className="flex flex-col h-full">
            {isQuickReplyModalOpen && (
                <QuickReplyModal
                    contact={contact}
                    businessProfile={businessProfile}
                    onClose={() => setQuickReplyModalOpen(false)}
                    onSelectTemplate={handleSelectTemplate}
                />
            )}
             {isFlirtyTemplateModalOpen && (
                <FlirtyTemplateModal
                    englishTemplates={appData.marketingTemplates || []}
                    nepaliTemplates={appData.nepaliMarketingTemplates || []}
                    onClose={() => setFlirtyTemplateModalOpen(false)}
                    onSelect={handleSelectFlirtyTemplate}
                    onAddTemplate={handleAddTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                />
            )}
            <header className="sticky top-0 z-10 bg-white shadow-sm p-3 flex items-center shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-gray-600">
                    <BackIcon className="h-6 w-6" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-text-primary">{contact.name}</h1>
                    <p className="text-sm text-text-secondary">{contact.phone}</p>
                </div>
                <button onClick={handleCall} className="p-2 text-primary hover:bg-primary/10 rounded-full">
                    <PhoneIcon className="h-6 w-6"/>
                </button>
            </header>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                <div className="text-center text-xs text-gray-400 my-2">
                    Messages are sent using your device's SMS app. This is not a live chat.
                </div>
                {messages.map(msg => (
                    <div key={msg.id} className="flex flex-col items-end">
                        <div className="max-w-xs md:max-w-md p-3 rounded-xl bg-primary text-white rounded-br-none">
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{msg.timestamp}</span>
                    </div>
                ))}
                 {messages.length === 0 && (
                    <div className="text-center text-gray-500 pt-16">
                        <p>No messages sent from the app yet.</p>
                        <p className="text-sm mt-1">Compose a message below.</p>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>
            
            <footer className="sticky bottom-0 p-2 bg-white/80 backdrop-blur-sm border-t shrink-0">
                <div className="flex items-end space-x-2">
                    <button onClick={() => setFlirtyTemplateModalOpen(true)} title="Flirty Templates" className="p-3 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-full">
                        <SparklesIcon className="h-6 w-6" />
                    </button>
                    <button onClick={() => setQuickReplyModalOpen(true)} title="Quick Replies" className="p-3 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full">
                        <ChatBubbleDotsIcon className="h-6 w-6" />
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={`Message ${contact.name}...`}
                        rows={1}
                        className="w-full px-4 py-2.5 bg-gray-100 border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-none max-h-32 overflow-y-auto"
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <button onClick={handleSend} className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatView;
