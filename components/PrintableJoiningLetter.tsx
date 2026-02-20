import React from 'react';
import { Staff, BusinessProfile } from '../types';

interface PrintableJoiningLetterProps {
    staff: Staff;
    businessProfile: BusinessProfile;
}

const PrintableJoiningLetter: React.FC<PrintableJoiningLetterProps> = ({ staff, businessProfile }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatCurrency = (value?: number) => {
        if (value === undefined) return 'N/A';
        return `₹${value.toLocaleString('en-IN')}/- per month`;
    };
    
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        
        @media print {
            @page {
                size: A4;
                margin: 1in;
            }
        }

        body { 
            font-family: 'Roboto', sans-serif; 
            margin: 0; 
            padding: 0; 
            color: #333; 
            background: #fff;
            line-height: 1.6;
        }
        .letter-container { width: 100%; max-width: 800px; margin: auto; }
        .letter-header { text-align: center; margin-bottom: 40px; }
        .letter-header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .letter-header p { margin: 2px 0 0; font-size: 14px; }
        .letter-body { font-size: 16px; }
        .letter-body p, .letter-body ul { margin-bottom: 16px; }
        .letter-body ul { padding-left: 20px; }
        .letter-footer { margin-top: 50px; }
    `;

    return (
        <>
            <style>{styles}</style>
            <div className="letter-container">
                <header className="letter-header">
                    <h1>{businessProfile.businessName}</h1>
                    <p>{businessProfile.phone} | {businessProfile.email}</p>
                </header>
                
                <div className="letter-body">
                    <p>Date: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>
                        To,<br />
                        {staff.name}<br />
                        {/* Address can be added here if available */}
                    </p>
                    <p><strong>Subject: Offer of Employment for the position of {staff.role}</strong></p>
                    <p>Dear {staff.name},</p>
                    <p>
                        We are pleased to offer you the position of <strong>{staff.role}</strong> at <strong>{businessProfile.businessName}</strong>. We believe your skills and experience will be a valuable asset to our team.
                    </p>
                    <p>Your employment will commence on <strong>{formatDate(staff.joiningDate)}</strong>. Your initial compensation package will be as follows:</p>
                    <ul>
                        <li><strong>Salary:</strong> {formatCurrency(staff.salary)}</li>
                        {/* Other benefits can be listed here */}
                    </ul>
                    <p>
                        We are excited about the prospect of you joining our team and look forward to a successful partnership.
                    </p>
                    
                    <div className="letter-footer">
                        <p>Sincerely,</p>
                        <br /><br />
                        <p>_________________________</p>
                        <p><strong>{businessProfile.businessName}</strong></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintableJoiningLetter;
