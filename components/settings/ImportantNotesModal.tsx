
import React from 'react';
import CloseIcon from '../icons/CloseIcon';
import InformationCircleIcon from '../icons/InformationCircleIcon';

interface ImportantNotesModalProps {
    onClose: () => void;
}

const Note: React.FC<{ title: string; children: React.ReactNode; type: 'warning' | 'info' | 'tip' }> = ({ title, children, type }) => {
    const colors = {
        warning: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300',
        info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
        tip: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    };
    return (
        <div className={`p-4 rounded-lg border-l-4 ${colors[type]} mb-4`}>
            <h4 className="font-bold">{title}</h4>
            <div className="text-sm mt-1">{children}</div>
        </div>
    );
};

const ImportantNotesModal: React.FC<ImportantNotesModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                 <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-text-primary dark:text-gray-100 flex items-center"><InformationCircleIcon className="h-6 w-6 text-yellow-500 mr-2"/>Important: Data Safety</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><CloseIcon className="h-6 w-6" /></button>
                </header>
                 <main className="p-6 overflow-y-auto flex-grow">
                     <Note title="CRITICAL: Do Not Clear Browser Data" type="warning">
                         <p>Unless you have enabled "Persistent Storage", all your business data is stored in your web browser's cache.</p>
                         <p className="mt-2"><strong>Clearing your browser's history, cache, or "Site Data" will PERMANENTLY DELETE all your OB data.</strong> This action is irreversible.</p>
                     </Note>

                     <Note title="RECOMMENDED: Use Persistent Storage" type="info">
                        <p>For maximum data safety, we strongly recommend using the "Enable Persistent Storage" option in Settings. This saves your data directly to a folder on your device, protecting it from accidental browser data clearing.</p>
                     </Note>

                     <Note title="BEST PRACTICE: Export Your Data Daily" type="tip">
                        <p>Get into the habit of using the <strong>"Export Data"</strong> feature at the end of each business day. This creates a backup file (`.json`) that you can save to a safe place (like an external drive, email, or cloud storage).</p>
                        <p className="mt-2">If anything goes wrong, you can always use the "Import Data" feature to restore your business from this backup file.</p>
                     </Note>
                 </main>
            </div>
        </div>
    );
};

export default ImportantNotesModal;
