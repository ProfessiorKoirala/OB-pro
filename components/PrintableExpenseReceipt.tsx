import React from 'react';
import { Expense, BusinessProfile } from '../types';

interface PrintableExpenseReceiptProps {
    expense: Expense;
    businessProfile: BusinessProfile;
}

const PrintableExpenseReceipt: React.FC<PrintableExpenseReceiptProps> = ({ expense, businessProfile }) => {
    const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
        body { font-family: 'Roboto Mono', monospace; margin: 0; padding: 20px; color: #000; background: #fff; }
        .receipt-container { width: 100%; max-width: 300px; margin: auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 1.5em; font-weight: 700; }
        .header p { margin: 2px 0 0; font-size: 0.8em; }
        .details, .totals { font-size: 0.9em; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #ccc; }
        .details-row:last-child { border-bottom: none; }
        .details-row span:first-child { color: #555; }
        .dashed-line { border-top: 1px dashed #000; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 0.8em; }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="receipt-container">
                <header className="header">
                    <h1>Expense Receipt</h1>
                    <p>{businessProfile.businessName}</p>
                    <p>PAN: {businessProfile.pan}</p>
                </header>

                <div className="details">
                    <div className="details-row">
                        <span>Date:</span>
                        <strong>{new Date(expense.date + 'T00:00:00').toLocaleDateString('en-GB')}</strong>
                    </div>
                    <div className="details-row">
                        <span>Title:</span>
                        <strong>{expense.title}</strong>
                    </div>
                    <div className="details-row">
                        <span>Category:</span>
                        <strong>{expense.category}</strong>
                    </div>
                    <div className="details-row" style={{fontSize: '1.2em', fontWeight: '700'}}>
                        <span>Amount:</span>
                        <strong>{formatCurrency(expense.amount)}</strong>
                    </div>
                </div>
                
                <footer className="footer">
                    <p>This is a computer-generated receipt.</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableExpenseReceipt;
