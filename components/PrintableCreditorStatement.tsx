import React from 'react';
import { Creditor, Order, Payment, BusinessProfile } from '../types';

type CreditHistoryItem = (Order & { historyType: 'credit' }) | (Payment & { historyType: 'payment' });

interface PrintableCreditorStatementProps {
    creditor: Creditor;
    creditHistory: CreditHistoryItem[];
    balance: number;
    advance: number;
    businessProfile: BusinessProfile;
}

const PrintableCreditorStatement: React.FC<PrintableCreditorStatementProps> = ({ creditor, creditHistory, balance, advance, businessProfile }) => {
    
    const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; color: #000; background: #fff; }
        .statement-container { width: 100%; max-width: 600px; margin: auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 1.5em; }
        .header p { margin: 2px 0 0; font-size: 0.9em; color: #333; }
        .details { font-size: 0.9em; margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .statement-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9em; }
        .statement-table th, .statement-table td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eee; }
        .statement-table th { font-weight: 700; background-color: #f2f2f2; }
        .statement-table th:last-child, .statement-table td:last-child { text-align: right; }
        .summary { margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; font-size: 1em; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 500;}
        .summary-row.total { font-size: 1.2em; font-weight: 700; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; }
    `;

    // History is sorted newest first, so we'll reverse for calculation and then display.
    let runningBalance = 0;
    const historyWithBalance = [...creditHistory].reverse().map(item => {
        let debit = 0;
        let credit = 0;
        let description = '';
        
        if (item.historyType === 'credit') { // It's an order
            debit = item.grandTotal || 0;
            description = `Credit Sale #${item.id.slice(-6)}`;
        } else { // It's a payment
            if (item.type === 'Credit Payment') {
                credit = item.amount;
                description = `Payment via ${item.method}`;
            } else { // Advance Return
                debit = item.amount;
                description = `Advance Returned via ${item.method}`;
            }
        }
        runningBalance = runningBalance + debit - credit;
        return { ...item, debit, credit, description, balance: runningBalance };
    }).reverse(); // reverse back for display (newest first)


    return (
        <>
            <style>{styles}</style>
            <div className="statement-container">
                <header className="header">
                    <h1>{businessProfile.businessName}</h1>
                    <p>{businessProfile.phone} | PAN: {businessProfile.pan}</p>
                    <h2 style={{marginTop: '10px', fontSize: '1.1em', borderTop: '1px solid #ccc', paddingTop: '10px'}}>Creditor Statement</h2>
                </header>

                <div className="details">
                    <div className="details-row"><strong>Creditor:</strong> <span>{creditor.name}</span></div>
                    <div className="details-row"><strong>Phone:</strong> <span>{creditor.phone}</span></div>
                    <div className="details-row"><strong>Date Issued:</strong> <span>{new Date().toLocaleDateString()}</span></div>
                </div>

                <table className="statement-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th style={{ textAlign: 'right' }}>Debit</th>
                            <th style={{ textAlign: 'right' }}>Credit</th>
                            <th style={{ textAlign: 'right' }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyWithBalance.map(item => {
                             const itemDate = item.historyType === 'credit' ? item.timestamp : item.date;
                             return (
                                <tr key={item.id}>
                                    <td>{new Date(itemDate).toLocaleDateString('en-GB')}</td>
                                    <td>{item.description}</td>
                                    <td style={{ color: item.debit > 0 ? '#C00' : '#333' }}>{item.debit > 0 ? formatCurrency(item.debit) : '-'}</td>
                                    <td style={{ color: item.credit > 0 ? '#080' : '#333' }}>{item.credit > 0 ? formatCurrency(item.credit) : '-'}</td>
                                    <td>{formatCurrency(item.balance)}</td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
                
                <div className="summary">
                    {balance > 0 && (
                        <div className="summary-row total" style={{color: '#C00'}}>
                            <span>Total Amount Due:</span>
                            <span>{formatCurrency(balance)}</span>
                        </div>
                    )}
                    {advance > 0 && (
                         <div className="summary-row total" style={{color: '#080'}}>
                            <span>Advance Paid:</span>
                            <span>{formatCurrency(advance)}</span>
                        </div>
                    )}
                     {balance === 0 && advance === 0 && (
                         <div className="summary-row total">
                            <span>Balance Settled:</span>
                            <span>{formatCurrency(0)}</span>
                        </div>
                    )}
                </div>
                
                <footer className="footer">
                     {businessProfile.paymentQR && balance > 0 && (
                        <div className="qr-code-section" style={{ marginTop: '20px' }}>
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Scan to Pay Outstanding Amount</p>
                            <img src={businessProfile.paymentQR} alt="Payment QR Code" style={{ width: '150px', height: '150px', margin: 'auto', display: 'block' }} />
                        </div>
                    )}
                    <p style={{marginTop: '20px'}}>This is a computer-generated statement.</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableCreditorStatement;