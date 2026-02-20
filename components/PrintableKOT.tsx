import React from 'react';
import { KOT, BusinessProfile } from '../types';

interface PrintableKOTProps {
    kot: KOT;
    businessProfile: BusinessProfile;
}

const PrintableKOT: React.FC<PrintableKOTProps> = ({ kot, businessProfile }) => {
    const getTitle = () => {
        switch (kot.type) {
            case 'NEW':
                return 'KOT';
            case 'UPDATE':
                return 'KOT UPDATE';
            case 'CANCEL':
                return 'CANCEL KOT';
        }
    };
    
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
        body { font-family: 'Roboto Mono', monospace; margin: 0; padding: 10px; color: #000; background: #fff; }
        .kot-container { width: 100%; max-width: 280px; margin: auto; }
        .header { text-align: center; margin-bottom: 10px; }
        .header h1 { margin: 0; font-size: 1.2em; font-weight: 700; }
        .details { font-size: 0.8em; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 0.9em; }
        .items-table th, .items-table td { text-align: left; padding: 4px 0; }
        .items-table th:first-child, .items-table td:first-child { width: 20px; text-align: center; }
        .items-table th:last-child, .items-table td:last-child { text-align: center; }
        .items-table thead tr { border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
        .item-name { font-weight: 500; }
        .footer { text-align: center; margin-top: 10px; font-size: 0.7em; }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="kot-container">
                <header className="header">
                    <h1>{getTitle()}</h1>
                </header>

                <div className="details">
                    <div className="details-row"><span>Table/Type:</span> <strong>{kot.tableName}</strong></div>
                    <div className="details-row"><span>KOT No:</span> <strong>{kot.kotNumber}</strong></div>
                    <div className="details-row"><span>Date:</span> <span>{new Date(kot.timestamp).toLocaleDateString()}</span></div>
                    <div className="details-row"><span>Time:</span> <span>{new Date(kot.timestamp).toLocaleTimeString()}</span></div>
                </div>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Item</th>
                            <th>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kot.items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="item-name">{item.name}</td>
                                <td>{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <footer className="footer">
                    <p>Order ID: #{kot.orderId.slice(-6).toUpperCase()}</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableKOT;
