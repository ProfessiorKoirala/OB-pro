
import React, { useState } from 'react';
import TrashIcon from '../icons/TrashIcon';

interface FlirtyTemplateModalProps {
    englishTemplates: { text: string }[];
    nepaliTemplates: { text: string }[];
    onClose: () => void;
    onSelect: (templateText: string) => void;
    onAddTemplate: (newTemplateText: string, language: 'english' | 'nepali') => void;
    onDeleteTemplate: (templateIndex: number, language: 'english' | 'nepali') => void;
}

const FlirtyTemplateModal: React.FC<FlirtyTemplateModalProps> = ({ englishTemplates, nepaliTemplates, onClose, onSelect, onAddTemplate, onDeleteTemplate }) => {
    const [newTemplate, setNewTemplate] = useState('');
    const [language, setLanguage] = useState<'english' | 'nepali'>('english');

    const handleAdd = () => {
        if (newTemplate.trim()) {
            onAddTemplate(newTemplate.trim(), language);
            setNewTemplate('');
        }
    };

    const currentTemplates = language === 'english' ? englishTemplates : nepaliTemplates;
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">Flirty Templates</h2>
                    <div className="flex items-center space-x-2 mt-2 bg-gray-100 p-1 rounded-full">
                        <button onClick={() => setLanguage('english')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${language === 'english' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>
                            English
                        </button>
                        <button onClick={() => setLanguage('nepali')} className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${language === 'nepali' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}>
                            Nepali
                        </button>
                    </div>
                </div>

                <div className="p-4 border-b shrink-0">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newTemplate}
                            onChange={e => setNewTemplate(e.target.value)}
                            placeholder={`Add your own ${language} template... 😉`}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            onClick={handleAdd}
                            className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 shrink-0"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div className="p-2 overflow-y-auto flex-grow">
                    <div className="space-y-2">
                        {currentTemplates.map((template, index) => (
                            <div key={index} className="group w-full flex items-center space-x-2 text-left bg-gray-50 p-2 rounded-lg hover:bg-primary/10 transition-colors">
                                <button onClick={() => onSelect(template.text)} className="flex-grow p-1">
                                    <p className="text-sm text-text-primary group-hover:text-primary">{template.text}</p>
                                </button>
                                <button
                                    onClick={() => onDeleteTemplate(index, language)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full shrink-0"
                                    aria-label="Delete template"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                         {currentTemplates.length === 0 && (
                            <div className="text-center text-gray-500 p-8">
                                <p>No templates yet.</p>
                                <p className="text-sm">Add your first one above!</p>
                            </div>
                         )}
                    </div>
                </div>

                <div className="p-4 border-t shrink-0">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 text-text-primary font-bold rounded-lg hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlirtyTemplateModal;
