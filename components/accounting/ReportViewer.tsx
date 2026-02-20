
import React from 'react';
import PrinterIcon from '../icons/PrinterIcon';
import { printReport } from '../../utils/printUtils';
import { BusinessProfile } from '../../types';

// Fixed: Added optional onHome prop to interface to resolve TypeScript error in AccountingScreen.tsx
interface ReportViewerProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
    businessProfile: BusinessProfile;
    isDesktop?: boolean;
    onHome?: () => void;
}

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const ReportViewer: React.FC<ReportViewerProps> = ({ title, onBack, children, businessProfile, isDesktop, onHome }) => {

    const handlePrint = () => {
        printReport(title, businessProfile, <>{children}</>);
    };

    return (
        <div className="bg-gray-50 min-h-full flex flex-col">
            <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 w-full shrink-0">
                {!isDesktop && <button onClick={onBack} className="text-gray-600 p-2 -ml-2"><ArrowLeftIcon /></button>}
                <h1 className="text-xl font-bold text-text-primary text-center flex-grow">{title}</h1>
                {/* Fixed: Show Home button in header if onHome is provided */}
                {onHome && (
                    <button onClick={onHome} className="p-2 text-gray-400 hover:text-black transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </button>
                )}
                {!onHome && <div className="w-8"></div>}
            </header>
            
            <main className="flex-grow p-4">
                {children}
            </main>

            <footer className="p-4 bg-white border-t sticky bottom-0 z-10 shrink-0">
                 <button 
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center text-sm bg-primary text-white font-semibold px-3 py-3 rounded-lg hover:bg-blue-800 transition-colors"
                >
                    <PrinterIcon className="h-5 w-5 mr-2" /> Print Report
                </button>
            </footer>
        </div>
    );
};

export default ReportViewer;
