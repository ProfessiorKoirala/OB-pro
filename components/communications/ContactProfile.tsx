import React from 'react';
import { UnifiedContact } from '../../types';
import BackIcon from '../icons/BackIcon';
import PhoneIcon from '../icons/PhoneIcon';
import SmsIcon from '../icons/SmsIcon';
import UsersIcon from '../icons/UsersIcon';

interface ContactProfileProps {
    contact: UnifiedContact;
    onBack: () => void;
    onSendMessage: () => void;
}

const getTypeStyles = (type: UnifiedContact['type']) => {
    switch (type) {
        case 'Customer': return 'bg-green-100 text-green-800';
        case 'Creditor': return 'bg-red-100 text-red-800';
        case 'Vendor': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const ContactProfile: React.FC<ContactProfileProps> = ({ contact, onBack, onSendMessage }) => {
    return (
        <div className="flex flex-col h-full bg-background">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm p-4 flex items-center shrink-0">
                <button onClick={onBack} className="p-2 -ml-2 mr-2 text-gray-600">
                    <BackIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-text-primary text-center flex-grow">{contact.name}</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex-grow flex flex-col p-6 items-center">
                <div className="p-6 bg-primary/10 rounded-full mb-4">
                    <UsersIcon className="h-20 w-20 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-text-primary">{contact.name}</h2>
                <p className="text-lg text-text-secondary mt-1">{contact.phone}</p>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full mt-3 ${getTypeStyles(contact.type)}`}>
                    {contact.type}
                </span>

                <div className="w-full grid grid-cols-2 gap-4 mt-12">
                    <a href={`tel:${contact.phone}`} className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <PhoneIcon className="h-8 w-8 text-primary" />
                        <span className="mt-2 font-semibold text-primary">Call</span>
                    </a>
                     <a href={`sms:${contact.phone}`} className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <SmsIcon className="h-8 w-8 text-secondary" />
                        <span className="mt-2 font-semibold text-secondary">SMS</span>
                    </a>
                </div>
            </main>

            <footer className="p-4 bg-white/80 backdrop-blur-sm border-t shrink-0">
                <button onClick={onSendMessage} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-colors">
                    Send Message
                </button>
            </footer>
        </div>
    );
};

export default ContactProfile;