import React from 'react';
import { BusinessProfile } from '../../types';

interface PrintableTodayDeliveryManifestProps {
    items: { name: string; phone: string; address: string; balance: number }[];
    businessProfile: BusinessProfile;
}

const PrintableTodayDeliveryManifest: React.FC<PrintableTodayDeliveryManifestProps> = ({ items, businessProfile }) => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const totalToCollect = items.reduce((sum, i) => sum + i.balance, 0);

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Roboto+Mono&display=swap');
        
        @media print {
            @page {
                size: A4;
                margin: 0.5in;
            }
        }

        body { 
            font-family: 'Roboto', sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #000; 
            background: #fff;
            line-height: 1.4;
        }

        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; text-transform: uppercase; }
        .header p { margin: 5px 0 0; font-size: 14px; font-weight: 500; }

        .manifest-title { 
            text-align: left; 
            font-weight: 700; 
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 18px;
            display: flex;
            justify-content: space-between;
        }

        .excel-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
            font-size: 11px;
        }
        .excel-table th { 
            background-color: #f2f2f2; 
            text-align: left; 
            font-weight: 700; 
            text-transform: uppercase;
            border: 1px solid #ccc;
            padding: 10px;
        }
        .excel-table td { 
            padding: 10px; 
            border: 1px solid #ccc; 
            vertical-align: top;
        }
        .excel-table .amt { text-align: right; font-family: 'Roboto Mono', monospace; }
        
        .footer { 
            margin-top: 30px; 
            text-align: right; 
            font-size: 16px;
            font-weight: 700;
        }
        
        .signature-lines {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }
        .sig-box {
            border-top: 1px solid #000;
            width: 200px;
            text-align: center;
            padding-top: 5px;
            font-size: 12px;
            font-weight: 700;
        }
    `;

    return (
        <div className="manifest-wrapper">
            <style>{styles}</style>
            
            <header className="header">
                <h1>{businessProfile.businessName}</h1>
                <p>DAILY DELIVERY MANIFEST</p>
                <p>{businessProfile.phone}</p>
            </header>

            <div className="manifest-title">
                <span>DATE: {today}</span>
                <span>TOTAL DELIVERIES: {items.length}</span>
            </div>

            <table className="excel-table">
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '25%' }}>CLIENT NAME</th>
                        <th style={{ width: '15%' }}>CONTACT</th>
                        <th style={{ width: '40%' }}>DELIVERY ADDRESS</th>
                        <th style={{ width: '15%' }} className="amt">COLLECTIBLE</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td style={{ fontWeight: '700' }}>{item.name}</td>
                            <td>{item.phone}</td>
                            <td>{item.address}</td>
                            <td className="amt">₹{item.balance.toFixed(2)}</td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No deliveries scheduled for today.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="footer">
                ESTIMATED TOTAL COLLECTION: ₹{totalToCollect.toFixed(2)}
            </div>

            <div className="signature-lines">
                <div className="sig-box">Rider Signature</div>
                <div className="sig-box">Manager Authorized</div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px', fontSize: '10px', color: '#888' }}>
                Manifest Generated via OB Pro Intelligence Layer
            </div>
        </div>
    );
};

export default PrintableTodayDeliveryManifest;