
import React from 'react';
import { Purchase, Vendor, BusinessProfile } from '../types';

interface PrintablePurchaseBillProps {
    purchase: Purchase;
    vendor: Vendor;
    businessProfile: BusinessProfile;
}

const PrintablePurchaseBill: React.FC<PrintablePurchaseBillProps> = ({ purchase, vendor, businessProfile }) => {
    
    const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
        body { font-family: 'Roboto Mono', monospace; margin: 0; padding: 20px; color: #000; background: #fff; }
        .receipt-container { width: 100%; max-width: 400px; margin: auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 1.5em; font-weight: 700; }
        .header p { margin: 2px 0 0; font-size: 0.8em; }
        .details { font-size: 0.8em; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.8em; }
        .items-table th, .items-table td { text-align: left; padding: 6px 2px; }
        .items-table th:last-child, .items-table td:last-child { text-align: right; }
        .items-table thead tr { border-bottom: 1px dashed #000; }
        .items-table tbody tr { border-bottom: 1px solid #eee; }
        .items-table tbody tr:last-child { border-bottom: none; }
        .dashed-line { border-top: 1px dashed #000; margin: 15px 0; }
        .totals { font-size: 0.9em; }
        .totals-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 0.8em; }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="receipt-container">
                <header className="header">
                    <h1>Purchase Bill</h1>
                    <p>{businessProfile.businessName}</p>
                </header>

                <div className="details">
                    <div className="details-row"><span>Bill ID:</span> <span>#{purchase.id.slice(-6).toUpperCase()}</span></div>
                    <div className="details-row"><span>Date:</span> <span>{new Date(purchase.timestamp).toLocaleString()}</span></div>
                    <div className="details-row"><span>Vendor:</span> <span>{vendor.name}</span></div>
                    <div className="details-row"><span>Payment:</span> <span>{purchase.paymentMethod}</span></div>
                </div>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchase.items.map(item => (
                            <tr key={item.id}>
                                <td>{item.itemName}</td>
                                <td>{item.quantity}</td>
                                <td>{formatCurrency(item.rate)}</td>
                                <td>{formatCurrency(item.rate * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="totals">
                    <div className="totals-row" style={{ fontSize: '1.2em', fontWeight: '700' }}><span>Total Amount:</span> <span>{formatCurrency(purchase.totalAmount)}</span></div>
                    <div className="dashed-line"></div>
                    <div className="totals-row"><span>Amount Paid:</span> <span>{formatCurrency(purchase.paidAmount)}</span></div>
                    <div className="totals-row"><span>Amount Due:</span> <span>{formatCurrency(purchase.totalAmount - purchase.paidAmount)}</span></div>
                </div>
                
                <footer className="footer">
                    <p>Purchase recorded in OB.</p>
                </footer>
            </div>
        </>
    );
};

export default PrintablePurchaseBill;
