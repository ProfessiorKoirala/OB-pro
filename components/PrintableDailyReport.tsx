
import React from 'react';
import { BusinessProfile } from '../types';
import { DailyReportData } from '../utils/printUtils';

interface PrintableDailyReportProps {
    data: DailyReportData;
    businessProfile: BusinessProfile;
}

const PrintableDailyReport: React.FC<PrintableDailyReportProps> = ({ data, businessProfile }) => {
    
    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            color: #333; 
            background: #fff;
        }
        .report-container { width: 100%; max-width: 800px; margin: auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 2px 0 0; font-size: 14px; }
        
        .report-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; }
        .summary-card p { margin: 0; font-size: 14px; color: #555; }
        .summary-card h3 { margin: 5px 0 0; font-size: 24px; font-weight: 700; }
        
        .section-title { font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 8px; }

        .list-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .list-table th, .list-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .list-table th { font-weight: bold; background-color: #f2f2f2; }
        .list-table td:last-child, .list-table th:last-child { text-align: right; }

        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
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
                    <h2 className="report-title">
                        Daily Business Report for {data.date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>

                    <div className="summary-grid">
                        <div className="summary-card">
                            <p>Total Sales</p>
                            <h3 style={{ color: '#10B981' }}>{formatCurrency(data.totalSales)}</h3>
                        </div>
                        <div className="summary-card">
                            <p>Total Expenses</p>
                            <h3 style={{ color: '#EF4444' }}>{formatCurrency(data.totalExpenses)}</h3>
                        </div>
                        <div className="summary-card">
                            <p>Net Profit</p>
                            <h3 style={{ color: data.netProfit >= 0 ? '#1E40AF' : '#EF4444' }}>{formatCurrency(data.netProfit)}</h3>
                        </div>
                    </div>

                    <h3 className="section-title">Top 5 Selling Items (by Quantity)</h3>
                    {data.topItems.length > 0 ? (
                        <table className="list-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item Name</th>
                                    <th style={{ textAlign: 'right' }}>Quantity Sold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No sales recorded for top items today.</p>
                    )}
                </main>

                <footer className="footer">
                    <p>Generated on: {new Date().toLocaleString()}</p>
                    <p>This is a computer-generated report from OB.</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableDailyReport;
