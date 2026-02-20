import React from 'react';
import { Customer, Order, BusinessProfile } from '../types';

interface PrintableCustomerStatementProps {
    customer: Customer;
    orders: Order[];
    stats: { totalSpent: number; totalOrders: number };
    businessProfile: BusinessProfile;
}

const PrintableCustomerStatement: React.FC<PrintableCustomerStatementProps> = ({ customer, orders, stats, businessProfile }) => {
    
    const formatCurrency = (value: number) => `₹${(value || 0).toFixed(2)}`;

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        
        @media print {
            @page {
                size: A4;
                margin: 0.75in;
            }
        }

        body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; color: #000; background: #fff; }
        .statement-container { width: 100%; max-width: 600px; margin: auto; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;}
        .header h1 { margin: 0; font-size: 1.5em; }
        .header p { margin: 2px 0 0; font-size: 0.9em; color: #333; }
        
        .details { font-size: 0.9em; margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
        .details-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        
        .statement-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9em; }
        .statement-table th, .statement-table td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eee; }
        .statement-table th { font-weight: 700; background-color: #f2f2f2; }
        .statement-table th:last-child, .statement-table td:last-child { text-align: right; }
        
        .summary { margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; font-size: 1em; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 500;}
        .summary-row.total { font-size: 1.2em; font-weight: 700; }
        
        .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; }
        h2, h3 { color: #333; }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="statement-container">
                <header className="header">
                    <h1>{businessProfile.businessName}</h1>
                    <p>{businessProfile.phone} | PAN: {businessProfile.pan}</p>
                    <h2 style={{marginTop: '10px', fontSize: '1.1em', borderTop: '1px solid #ccc', paddingTop: '10px'}}>Customer Statement</h2>
                </header>

                <div className="details">
                    <div className="details-row"><strong>Customer:</strong> <span>{customer.name}</span></div>
                    <div className="details-row"><strong>Phone:</strong> <span>{customer.phone}</span></div>
                    <div className="details-row"><strong>Date Issued:</strong> <span>{new Date().toLocaleDateString()}</span></div>
                </div>

                <div className="summary">
                    <div className="summary-row total">
                        <span>Total Spent:</span>
                        <span>{formatCurrency(stats.totalSpent)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Total Orders:</span>
                        <span>{stats.totalOrders}</span>
                    </div>
                </div>

                <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '30px', borderBottom: '1px solid #ccc', paddingBottom: '5px'}}>Order History</h3>
                <table className="statement-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Order ID</th>
                            <th>Items</th>
                            <th style={{ textAlign: 'right' }}>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                             <tr key={order.id}>
                                 <td>{new Date(order.timestamp).toLocaleDateString('en-GB')}</td>
                                 <td>#{order.id.slice(-6).toUpperCase()}</td>
                                 <td>{order.items.length}</td>
                                 <td style={{ textAlign: 'right' }}>{formatCurrency(order.grandTotal || 0)}</td>
                             </tr>
                        ))}
                    </tbody>
                </table>
                
                <footer className="footer">
                    <p>Thank you for your business!</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableCustomerStatement;
