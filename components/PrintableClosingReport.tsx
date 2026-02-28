import React from 'react';
import { CashClosing, BusinessProfile } from '../types';

interface PrintableClosingReportProps {
    closing: CashClosing;
    businessProfile: BusinessProfile;
}

const PrintableClosingReport: React.FC<PrintableClosingReportProps> = ({ closing, businessProfile }) => {
    const denoms = ['1000', '500', '100', '50', '20', '10', '5', 'coins'] as const;

    return (
        <div className="p-8 bg-white text-black font-sans max-w-[800px] mx-auto">
            <div className="text-center mb-8 border-b-2 border-black pb-6">
                <h1 className="text-3xl font-black uppercase tracking-tighter italic">{businessProfile.name}</h1>
                <p className="text-xs font-bold uppercase tracking-widest mt-1">{businessProfile.address}</p>
                <p className="text-xs font-bold uppercase tracking-widest">{businessProfile.phone}</p>
                <div className="mt-4 inline-block bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] italic">
                    Cash Closing Report
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Report Details</p>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-xs font-bold uppercase">Date</span>
                        <span className="text-xs font-black">{closing.date}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-xs font-bold uppercase">Closed By</span>
                        <span className="text-xs font-black">{closing.closedBy}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-xs font-bold uppercase">Time</span>
                        <span className="text-xs font-black">{new Date(closing.timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Financial Summary</p>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-xs font-bold uppercase">Opening Float</span>
                        <span className="text-xs font-black">₹{closing.openingCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-xs font-bold uppercase">Expected Cash</span>
                        <span className="text-xs font-black">₹{closing.expectedCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1">
                        <span className="text-xs font-bold uppercase">Actual Cash</span>
                        <span className="text-xs font-black">₹{closing.actualCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-black py-2 mt-2">
                        <span className="text-sm font-black uppercase">Difference</span>
                        <span className={`text-sm font-black ${closing.difference === 0 ? 'text-black' : closing.difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ₹{closing.difference.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {closing.reason && (
                <div className="mb-8 p-4 bg-gray-50 border-l-4 border-black">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Accountability Reason</p>
                    <p className="text-sm font-bold italic">"{closing.reason}"</p>
                </div>
            )}

            <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Denomination Breakdown</p>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-2 text-[10px] font-black uppercase">Denom</th>
                            <th className="py-2 text-[10px] font-black uppercase text-center">Qty</th>
                            <th className="py-2 text-[10px] font-black uppercase text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {denoms.map(d => {
                            const qty = closing.denominations[d];
                            const multiplier = d === 'coins' ? 1 : parseInt(d, 10);
                            const total = qty * multiplier;
                            if (qty === 0) return null;
                            return (
                                <tr key={d}>
                                    <td className="py-2 text-xs font-black italic">{d === 'coins' ? 'Coins' : `₹${d}`}</td>
                                    <td className="py-2 text-xs font-bold text-center">{qty}</td>
                                    <td className="py-2 text-xs font-black text-right">₹{total.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-16 pt-8 border-t border-dashed border-gray-300 grid grid-cols-2 gap-12">
                <div className="text-center">
                    <div className="h-px bg-black w-32 mx-auto mb-2"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Manager Signature</p>
                </div>
                <div className="text-center">
                    <div className="h-px bg-black w-32 mx-auto mb-2"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Owner Signature</p>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.5em]">Generated by OB Pro Empire Terminal</p>
            </div>
        </div>
    );
};

export default PrintableClosingReport;
