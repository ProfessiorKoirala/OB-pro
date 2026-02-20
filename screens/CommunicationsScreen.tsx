import React, { useState, useMemo } from 'react';
import { AppDataBackup, UnifiedContact, MainView, BusinessProfile } from '../types';
import ContactList from '../components/communications/ContactList';
import ChatView from '../components/communications/ChatView';
import ContactProfile from '../components/communications/ContactProfile';

// Fixed: Added optional onHome to CommunicationsScreenProps interface to resolve TS errors in MainScreen.tsx and DesktopLayout.tsx
interface CommunicationsScreenProps {
    appData: AppDataBackup;
    setAppData: React.Dispatch<React.SetStateAction<AppDataBackup>>;
    businessProfile: BusinessProfile;
    setCurrentView: (view: MainView) => void;
    onAddContactClick: () => void;
    onHome?: () => void;
}

const CommunicationsScreen: React.FC<CommunicationsScreenProps> = ({ appData, setAppData, businessProfile, setCurrentView, onAddContactClick, onHome }) => {
    const [view, setView] = useState<'list' | 'profile' | 'chat'>('list');
    const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);

    const unifiedContacts = useMemo(() => {
        const contacts: UnifiedContact[] = [];
        const phoneSet = new Set<string>();

        const addContact = (contact: any, type: 'Customer' | 'Creditor' | 'Vendor') => {
            if (contact.phone && !phoneSet.has(contact.phone)) {
                contacts.push({
                    id: `${type}-${contact.id}`,
                    name: contact.name,
                    phone: contact.phone,
                    address: contact.address || '',
                    type,
                    originalId: contact.id
                });
                phoneSet.add(contact.phone);
            }
        };

        appData.customers.forEach(c => addContact(c, 'Customer'));
        appData.creditors.forEach(c => addContact(c, 'Creditor'));
        appData.vendors.forEach(v => addContact(v, 'Vendor'));
        
        return contacts.sort((a, b) => a.name.localeCompare(b.name));
    }, [appData.customers, appData.creditors, appData.vendors]);
    
    const handleSelectContact = (contact: UnifiedContact) => {
        setSelectedContact(contact);
        setView('chat'); // Directly go to chat as implied by the redesigned "Chats" list
    };

    const handleBack = () => {
        switch (view) {
            case 'chat':
                setView('list');
                setSelectedContact(null);
                break;
            case 'profile':
                setView('chat');
                break;
            case 'list':
                setCurrentView(MainView.DASHBOARD);
                break;
        }
    };

    const renderCurrentView = () => {
        if (view === 'chat' && selectedContact) {
            return (
                <ChatView
                    contact={selectedContact}
                    onBack={handleBack}
                    appData={appData}
                    setAppData={setAppData}
                    businessProfile={businessProfile}
                />
            );
        }

        if (view === 'profile' && selectedContact) {
            return (
                <ContactProfile
                    contact={selectedContact}
                    onBack={handleBack}
                    onSendMessage={() => setView('chat')}
                />
            );
        }

        return (
            <ContactList
                contacts={unifiedContacts}
                onSelectContact={handleSelectContact}
                onBack={handleBack}
                onAddContactClick={onAddContactClick}
                onHome={onHome}
            />
        );
    };

    return (
        <div className="h-full flex flex-col bg-background">
           {renderCurrentView()}
        </div>
    );
};

export default CommunicationsScreen;