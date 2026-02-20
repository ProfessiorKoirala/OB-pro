import React from 'react';
import { Order, BusinessProfile } from '../types';
import { calculateOrderTotals } from '../utils/calculationUtils';

interface PrintableBillProps {
    order: Order;
    businessProfile: BusinessProfile;
    isVatEnabled: boolean;
}

const PrintableBill: React.FC<PrintableBillProps> = ({ order, businessProfile, isVatEnabled }) => {
    const { subtotal, discountAmount, taxAmount, deliveryFee, grandTotal, amountDue } = calculateOrderTotals(order, isVatEnabled);
    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
        
        @media print {
            @page {
                size: 80mm auto;
                margin: 0;
            }
        }

        body { 
            font-family: 'Roboto Mono', monospace; 
            margin: 0; 
            padding: 10mm 4mm; 
            color: #000; 
            background: #fff;
            width: 72mm;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
        }

        .bill-wrapper { width: 100%; }
        
        .header { text-align: center; margin-bottom: 5mm; }
        .header h1 { margin: 0; font-size: 16pt; font-weight: 700; text-transform: uppercase; line-height: 1.1; }
        .header p { margin: 1mm 0; font-size: 8.5pt; font-weight: 500; }
        
        .invoice-title { 
            text-align: center; 
            font-weight: 700; 
            border-top: 0.5pt solid #000; 
            border-bottom: 0.5pt solid #000;
            padding: 1.5mm 0;
            margin: 4mm 0;
            font-size: 10pt;
            letter-spacing: 1.5mm;
        }

        .info-section { font-size: 8pt; margin-bottom: 4mm; line-height: 1.4; }
        .info-row { display: flex; justify-content: space-between; }
        .info-row span:first-child { font-weight: 700; }

        .items-table { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 8.5pt; }
        .items-table th { text-align: left; border-bottom: 0.5pt dashed #000; padding-bottom: 1.5mm; font-weight: 700; }
        .items-table td { padding: 2mm 0; vertical-align: top; border-bottom: 0.2pt solid #eee; }
        .items-table .amt { text-align: right; }
        .item-name { font-weight: 700; font-size: 9pt; }
        
        .totals-section { border-top: 0.5pt solid #000; padding-top: 2.5mm; font-size: 9pt; }
        .totals-row { display: flex; justify-content: space-between; margin-bottom: 1.2mm; }
        .totals-row.grand-total { 
            font-size: 13pt; 
            font-weight: 700; 
            border-top: 0.5pt dashed #000; 
            margin-top: 2mm; 
            padding-top: 3mm; 
            padding-bottom: 1mm;
        }
        
        .footer { text-align: center; margin-top: 8mm; font-size: 8pt; border-top: 0.5pt solid #000; padding-top: 4mm; }
        .footer .qr-box { margin: 4mm auto; width: 32mm; height: 32mm; border: 0.5pt solid #eee; padding: 1mm; }
        .footer .qr-box img { width: 100%; height: 100%; object-fit: contain; }
        
        .divider { border-top: 0.5pt dashed #000; margin: 4mm 0; }
        .text-bold { font-weight: 700; }
    `;

    return (
        <div className="bill-wrapper">
            <style>{styles}</style>
            
            <header className="header">
                <h1>{businessProfile.businessName}</h1>
                <p>{businessProfile.tagline}</p>
                <p>{businessProfile.phone}</p>
                {businessProfile.pan && <p>PAN: {businessProfile.pan}</p>}
                {businessProfile.vatNumber && <p>VAT: {businessProfile.vatNumber}</p>}
            </header>

            <div className="invoice-title">INVOICE</div>

            <div className="info-section">
                <div className="info-row"><span>Bill No:</span> <span>#{order.id.slice(-6).toUpperCase()}</span></div>
                <div className="info-row"><span>Date:</span> <span>{new Date(order.timestamp).toLocaleDateString('en-GB')}</span></div>
                <div className="info-row"><span>Time:</span> <span>{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                <div className="info-row"><span>Customer:</span> <span>{order.customerName || 'Walk-in'}</span></div>
                <div className="info-row"><span>Type:</span> <span>{order.type.toUpperCase()}</span></div>
            </div>

            <table className="items-table">
                <thead>
                    <tr>
                        <th>ITEM</th>
                        <th className="amt">QTY</th>
                        <th className="amt">PRICE</th>
                        <th className="amt">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td>
                                <div className="item-name">{item.product.name}</div>
                            </td>
                            <td className="amt">{item.quantity}</td>
                            <td className="amt">{item.product.price.toFixed(0)}</td>
                            <td className="amt">{(item.quantity * item.product.price).toFixed(0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="totals-section">
                <div className="totals-row"><span>Subtotal</span> <span>{formatCurrency(subtotal)}</span></div>
                {discountAmount > 0 && <div className="totals-row"><span>Discount</span> <span>- {formatCurrency(discountAmount)}</span></div>}
                {deliveryFee > 0 && <div className="totals-row"><span>Delivery Fee</span> <span>{formatCurrency(deliveryFee)}</span></div>}
                {isVatEnabled && <div className="totals-row"><span>VAT (13%)</span> <span>{formatCurrency(taxAmount)}</span></div>}
                
                <div className="totals-row grand-total">
                    <span>NET PAYABLE</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>

                {order.advanceAmount && order.advanceAmount > 0 ? (
                    <>
                        <div className="totals-row" style={{ marginTop: '2mm' }}><span>Paid Advance</span> <span>- {formatCurrency(order.advanceAmount)}</span></div>
                        <div className="totals-row text-bold"><span>BALANCE DUE</span> <span>{formatCurrency(amountDue)}</span></div>
                    </>
                ) : (
                    <div className="totals-row" style={{ marginTop: '2mm', fontSize: '8pt', color: '#555' }}>
                        <span>Method:</span> <span>{order.paymentMethod?.toUpperCase() || 'CASH'}</span>
                    </div>
                )}
            </div>

            <footer className="footer">
                {businessProfile.paymentQR && (
                    <div className="qr-box">
                        <img src={businessProfile.paymentQR} alt="Payment QR" />
                        <p style={{ fontSize: '7pt', marginTop: '1.5mm', color: '#333' }}>Scan to Pay Digitally</p>
                    </div>
                )}
                <div className="divider"></div>
                <p className="text-bold">THANK YOU! VISIT AGAIN</p>
                <p style={{ fontSize: '6pt', color: '#666', marginTop: '3mm' }}>System Powered by OB Pro</p>
            </footer>
        </div>
    );
};

export default PrintableBill;