import React from 'react';
import { Denominations } from '@/types';

interface CashCounterProps {
    denominations: Denominations;
    onChange: (key: keyof Denominations, value: number) => void;
}

const CashCounter: React.FC<CashCounterProps> = ({ denominations, onChange }) => {
    const denoms = ['1000', '500', '100', '50', '20', '10', '5', 'coins'] as const;

    return (
        <div className="w-full overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Denomination</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Quantity</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Auto Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-800">
                    {denoms.map((denom) => {
                        const multiplier = denom === 'coins' ? 1 : parseInt(denom, 10);
                        const total = denominations[denom] * multiplier;
                        return (
                            <tr key={denom} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-black dark:text-white uppercase tracking-tighter italic">
                                        {denom === 'coins' ? 'Coins' : `₹${denom}`}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <input 
                                        type="number"
                                        value={denominations[denom] || ''}
                                        onChange={(e) => onChange(denom, parseInt(e.target.value, 10) || 0)}
                                        placeholder="0"
                                        className="w-24 mx-auto block bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl py-2 px-3 font-black text-center text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                        ₹{total.toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CashCounter;
