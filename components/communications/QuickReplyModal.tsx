
import React, { useState, useMemo } from 'react';
import { UnifiedContact, BusinessProfile } from '../../types';
import AnimatedSearchBar from '../AnimatedSearchBar';

// --- Icons ---
const HandIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11" /></svg>;
const TagIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5a2 2 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>;
const TruckIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 17H6V6h11v5l4 4H13zM6 6H4" /></svg>;
const StarIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className, filled }) => {
    if (filled) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    );
};
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21.5l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
const BellIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const CashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ShoppingBagIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;


// --- Template Data ---
const templates = {
    Customer: {
        'Promotions & Offers': {
            icon: <TagIcon className="h-5 w-5 text-yellow-600" />,
            description: "Engage customers with special deals.",
            items: [
                { text: "Hi {CONTACT_NAME}! A special offer just for you: Get 20% OFF on your next order at {BUSINESS_NAME}. Show this message to redeem.", attachStatement: false, placeholders: ['CONTACT_NAME', 'BUSINESS_NAME'] },
                { text: "We miss you, {CONTACT_NAME}! Come back and enjoy a free coffee on us with any purchase. We look forward to seeing you!", attachStatement: false, placeholders: ['CONTACT_NAME'] },
                { text: "Flash Sale! Today only, buy one get one free on all pastries. Don't miss out!", attachStatement: false, placeholders: [] },
                { text: "Happy Birthday {CONTACT_NAME}! 🎉 Celebrate with a free dessert on us. Valid for this week.", attachStatement: false, placeholders: ['CONTACT_NAME'] },
            ]
        },
        'Order Updates': {
            icon: <TruckIcon className="h-5 w-5 text-blue-600" />,
            description: "Keep customers informed about their orders.",
            items: [
                { text: "Hi {CONTACT_NAME}, your order is ready for pickup!", attachStatement: false, placeholders: ['CONTACT_NAME'] },
                { text: "Good news, {CONTACT_NAME}! Your order is out for delivery and should arrive soon.", attachStatement: false, placeholders: ['CONTACT_NAME'] },
                { text: "We've received your order. We're preparing it now and will notify you when it's ready.", attachStatement: false, placeholders: [] },
            ]
        },
        'Feedback & Reviews': {
            icon: <StarIcon filled={false} className="h-5 w-5 text-purple-600" />,
            description: "Request feedback to improve your service.",
            items: [
                { text: "Hi {CONTACT_NAME}, thank you for your recent visit on {LAST_ORDER_DATE}. Could you please take a moment to leave us a review? We'd love to hear your feedback!", attachStatement: false, placeholders: ['CONTACT_NAME', 'LAST_ORDER_DATE'] },
                { text: "How was everything, {CONTACT_NAME}? We value your opinion and would appreciate it if you could share your experience with us.", attachStatement: false, placeholders: ['CONTACT_NAME'] },
            ]
        },
         'Greetings & Thanks': {
            icon: <HeartIcon className="h-5 w-5 text-red-500" />,
            description: "Build relationships with new and loyal customers.",
            items: [
                { text: "Hello {CONTACT_NAME}! Welcome to {BUSINESS_NAME}. We're delighted to have you as a customer.", attachStatement: false, placeholders: ['CONTACT_NAME', 'BUSINESS_NAME'] },
                { text: "Thank you for your purchase, {CONTACT_NAME}! We appreciate your business and hope to see you again soon.", attachStatement: false, placeholders: ['CONTACT_NAME'] },
            ]
        },
    },
    Creditor: {
        'Payment Reminders': {
            icon: <BellIcon className="h-5 w-5 text-orange-500" />,
            description: "Gently remind creditors about payments.",
            items: [
                { text: "Hello {CONTACT_NAME}, this is a friendly reminder that your payment of {BALANCE} is due. Please find your statement attached for details.", attachStatement: true, placeholders: ['CONTACT_NAME', 'BALANCE'] },
                { text: "Hi {CONTACT_NAME}, regarding your account at {BUSINESS_NAME}, your outstanding balance is {BALANCE}. We'd appreciate a prompt settlement.", attachStatement: false, placeholders: ['CONTACT_NAME', 'BUSINESS_NAME', 'BALANCE'] },
                { text: "Gentle Reminder: Your payment is now overdue. Please clear your outstanding balance as soon as possible. Your statement is attached.", attachStatement: true, placeholders: [] },
            ]
        },
        'Payment Confirmations': {
            icon: <CashIcon className="h-5 w-5 text-green-600" />,
            description: "Confirm payments and update account status.",
            items: [
                { text: "Thank you for your recent payment, {CONTACT_NAME}. We have received it and your account has been updated.", attachStatement: false, placeholders: ['CONTACT_NAME'] },
                { text: "Confirming receipt of your payment. Your account is now settled. We appreciate your business!", attachStatement: false, placeholders: [] },
            ]
        },
        'Account Queries': {
            icon: <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" />,
            description: "Clarify account details and follow up.",
            items: [
                { text: "Hi {CONTACT_NAME}, we have a quick question about your account. Could you please give us a call at your convenience?", attachStatement: false, placeholders: ['CONTACT_NAME'] },
                { text: "Here is your latest account statement as requested. Please let us know if you have any questions.", attachStatement: true, placeholders: [] },
            ]
        }
    },
    Vendor: {
        'Order & Quotes': {
            icon: <ShoppingBagIcon className="h-5 w-5 text-indigo-500" />,
            description: "Place new orders or request quotations.",
            items: [
                { text: "Hi {CONTACT_NAME}, we'd like to place a new order for the following items:", attachStatement: false, placeholders: ['CONTACT_NAME'] },
                { text: "Hello, could you please provide a quote for the following supplies?", attachStatement: false, placeholders: [] },
            ]
        },
        'Payment Information': {
            icon: <CashIcon className="h-5 w-5 text-green-600" />,
            description: "Communicate about payments and invoices.",
            items: [
                { text: "We have just processed the payment for invoice #{INVOICE_NUMBER}. Please confirm receipt.", attachStatement: false, placeholders: [] },
                { text: "Hi {CONTACT_NAME}, here is our latest account statement. Let us know if there are any discrepancies.", attachStatement: true, placeholders: ['CONTACT_NAME'] },
            ]
        },
        'Follow-ups': {
            icon: <TruckIcon className="h-5 w-5 text-blue-600" />,
            description: "Follow up on orders and deliveries.",
            items: [
                { text: "Hi {CONTACT_NAME}, following up on our recent purchase order. Do you have an estimated delivery date?", attachStatement: false, placeholders: ['CONTACT_NAME'] },
                { text: "Thank you for the prompt delivery. Everything has been received in good order.", attachStatement: false, placeholders: [] },
            ]
        }
    }
};

type TemplateItem = { text: string; attachStatement: boolean; placeholders?: string[] };
type TemplateCategory = { icon: React.ReactNode; description: string; items: TemplateItem[] };
type TemplateSet = { [key: string]: TemplateCategory };


interface QuickReplyModalProps {
    onClose: () => void;
    onSelectTemplate: (template: TemplateItem) => void;
    contact: UnifiedContact;
    businessProfile: BusinessProfile;
}

const AccordionItem: React.FC<{
    category: TemplateCategory;
    categoryName: string;
    isOpen: boolean;
    onToggle: () => void;
    onSelectTemplate: (template: TemplateItem) => void;
    searchTerm: string;
}> = ({ category, categoryName, isOpen, onToggle, onSelectTemplate, searchTerm }) => {

    const filteredItems = useMemo(() => {
        if (!searchTerm) return category.items;
        return category.items.filter(item => item.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [category.items, searchTerm]);

    if (searchTerm && filteredItems.length === 0) {
        return null;
    }

    return (
        <div className="border-b">
            <button onClick={onToggle} className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                    {category.icon}
                    <div>
                        <h4 className="font-semibold text-text-primary">{categoryName}</h4>
                        <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                </div>
                <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-2 space-y-1 bg-gray-50">
                    {filteredItems.map((template, index) => (
                         <button
                            key={index}
                            onClick={() => onSelectTemplate(template)}
                            className="w-full text-left p-2.5 text-sm text-text-primary hover:bg-primary/10 rounded-lg flex items-center"
                        >
                            <span dangerouslySetInnerHTML={{ __html: template.text.replace(/{[A-Z_]+}/g, match => `<span class="font-semibold text-primary">${match}</span>`).replace(/\n/g, '<br />') }} />
                            {template.attachStatement && <span className="text-xs text-blue-600 font-semibold ml-2 shrink-0">(+ Statement)</span>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


const QuickReplyModal: React.FC<QuickReplyModalProps> = ({ onClose, onSelectTemplate, contact }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    const relevantTemplates: TemplateSet = templates[contact.type] || {};
    const title = `Quick Replies for ${contact.type}`;
    
    const handleToggle = (categoryName: string) => {
        setOpenCategory(prev => prev === categoryName ? null : categoryName);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <div className="mt-2">
                        <AnimatedSearchBar 
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Search templates..."
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {Object.entries(relevantTemplates).length > 0 ? (
                        Object.entries(relevantTemplates).map(([categoryName, category]) => (
                           <AccordionItem 
                             key={categoryName}
                             category={category}
                             categoryName={categoryName}
                             isOpen={openCategory === categoryName}
                             onToggle={() => handleToggle(categoryName)}
                             onSelectTemplate={onSelectTemplate}
                             searchTerm={searchTerm}
                           />
                        ))
                    ) : (
                        <p className="p-8 text-center text-sm text-gray-500">No quick replies available for this contact type.</p>
                    )}
                </div>

                <div className="p-2 border-t shrink-0">
                    <button onClick={onClose} className="w-full py-3 text-text-secondary font-semibold">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default QuickReplyModal;
