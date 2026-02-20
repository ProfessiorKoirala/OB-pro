import React from 'react';
import { createPortal } from 'react-dom';
import { Order, BusinessProfile } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import PrinterIcon from '../icons/PrinterIcon';
import ShareIcon from '../icons/ShareIcon';
import { shareOnWhatsApp } from '../../utils/shareUtils';
import { calculateOrderTotals } from '../../utils/calculationUtils';
import { printTodayDeliveryManifest } from '../../utils/printUtils';

interface TodayDeliveryListModalProps {
    orders: Order[];
    onClose: () => void;
    businessProfile: BusinessProfile;
    isVatEnabled: boolean;
}

const TodayDeliveryListModal: React.FC<TodayDeliveryListModalProps> = ({ orders, onClose, businessProfile, isVatEnabled }) => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const manifestItems = orders.map(order => {
        const { amountDue } = calculateOrderTotals(order, isVatEnabled);
        return {
            name: order.customerName || 'Walk-in',
            phone: order.customerPhone || 'N/A',
            address: order.customerAddress || 'No Address Provided',
            balance: amountDue
        };
    });

    const totalToCollect = manifestItems.reduce((sum, item) => sum + item.balance, 0);

    const handleShare = () => {
        let text = `*OB Pro - Delivery Manifest*\nDate: ${today}\n\n`;
        text += `| NAME | PHONE | ADDRESS | DUE |\n`;
        text += `|---|---|---|---|\n`;
        manifestItems.forEach(item => {
            text += `| ${item.name} | ${item.phone} | ${item.address} | ₹${Math.round(item.balance)} |\n`;
        });
        text += `\n*Total to Collect: ₹${Math.round(totalToCollect)}*`;
        shareOnWhatsApp(text);
    };

    const handlePrint = () => {
        printTodayDeliveryManifest(manifestItems, businessProfile);
    };

    return createPortal(
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[48px] w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="px-8 pt-10 pb-6 border-b dark:border-gray-800 shrink-0 flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">FLEET OPERATIONS</p>
                        <h2 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Daily Manifest</h2>
                        <p className="text-[11px] font-bold text-gray-400 mt-2">{today} • {orders.length} Deliveries</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"><PrinterIcon className="w-6 h-6" /></button>
                        <button onClick={handleShare} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-green-600 active:scale-90 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"><ShareIcon className="w-6 h-6" /></button>
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all border border-gray-100 dark:border-gray-700 shadow-sm"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 no-scrollbar">
                    <div className="min-w-[600px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse font-sans">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">Client Name</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">Contact Number</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">Delivery Address</th>
                                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Due Collection</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-800">
                                {manifestItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-5 text-sm font-black text-black dark:text-white uppercase italic border-r dark:border-gray-700">{item.name}</td>
                                        <td className="p-5 text-sm font-bold text-gray-500 dark:text-gray-400 border-r dark:border-gray-700">{item.phone}</td>
                                        <td className="p-5 text-sm font-medium text-gray-400 dark:text-gray-500 border-r dark:border-gray-700">{item.address}</td>
                                        <td className="p-5 text-sm font-black text-red-600 dark:text-red-400 italic">₹{Math.round(item.balance).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-black dark:bg-white">
                                    <td colSpan={3} className="p-5 text-right text-[10px] font-black text-white/50 dark:text-black/50 uppercase tracking-widest">ESTIMATED TOTAL COLLECTION</td>
                                    <td className="p-5 text-xl font-black text-white dark:text-black italic">₹{Math.round(totalToCollect).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <footer className="p-8 border-t dark:border-gray-800 shrink-0 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em]">Logistics Intelligence Layer</p>
                    <button 
                        onClick={onClose}
                        className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-full shadow-xl active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                    >
                        Close Registry
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};

export default TodayDeliveryListModal;