import React from 'react';
import { BusinessProfile } from '../types';

interface PrintableReportProps {
    title: string;
    businessProfile: BusinessProfile;
    children: React.ReactNode;
}

const PrintableReport: React.FC<PrintableReportProps> = ({ title, businessProfile, children }) => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        
        @media print {
            @page {
                size: A4;
                margin: 0.75in;
            }
        }

        body { 
            font-family: 'Roboto', sans-serif; 
            margin: 0; 
            padding: 0; 
            color: #000 !important; 
            background: #fff; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .report-container { width: 100%; margin: auto; }
        
        .header { 
            margin-bottom: 20px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 15px; 
        }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 2px 0 0; font-size: 14px; color: #333 !important; }
        
        .report-title { 
            text-align: center; 
            font-size: 22px; 
            font-weight: bold; 
            margin: 30px 0; 
            text-transform: uppercase;
        }
        
        .content { 
            font-size: 14px; 
            color: #000 !important;
        }
        .content * {
            color: #000 !important;
        }
        .content h3 { 
            font-size: 18px; 
            font-weight: 700; 
            margin-top: 24px; 
            margin-bottom: 12px; 
            border-bottom: 1px solid #888; 
            padding-bottom: 6px; 
        }
        .content table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 12px; 
        }
        .content thead th { 
            font-weight: 700;
            background-color: #f2f2f2 !important; 
            border-bottom: 2px solid #000;
        }
        .content td, .content th { 
            padding: 10px; 
            text-align: left; 
            border-bottom: 1px solid #ddd;
        }
        .content td:last-child, .content th:last-child { 
            text-align: right; 
        }
        .content tbody tr:nth-child(even) {
             background-color: #f9f9f9 !important;
        }
        .content tfoot tr {
            font-weight: 700;
            font-size: 1.1em;
            border-top: 2px solid #000;
        }
        
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            font-size: 12px; 
            color: #666 !important; 
            border-top: 1px solid #ccc; 
            padding-top: 10px;
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="report-container">
                <header className="header">
                    <h1>{businessProfile.businessName}</h1>
                    <p>{businessProfile.phone} | {businessProfile.email}</p>
                    <p>PAN: {businessProfile.pan}</p>
                </header>
                <main>
                    <h2 className="report-title">{title}</h2>
                    <div className="content">
                        {children}
                    </div>
                </main>
                <footer className="footer">
                    <p>Generated on: {new Date().toLocaleString()}</p>
                    <p>This is a computer-generated report from OB Pro.</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableReport;