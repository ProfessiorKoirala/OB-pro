
import React, { useMemo } from 'react';
import { Staff, Attendance, Payroll, BusinessProfile, Holiday, BusinessSettings } from '../types';

interface PrintableStaffStatementProps {
    staff: Staff;
    month: Date;
    attendance: Attendance[];
    payroll: Payroll | undefined;
    businessProfile: BusinessProfile;
    holidays: Holiday[];
    settings: BusinessSettings;
}

const PrintableStaffStatement: React.FC<PrintableStaffStatementProps> = ({ staff, month, attendance, payroll, businessProfile, holidays, settings }) => {
    const formatCurrency = (value: number) => `₹${(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const { calendarData, stats } = useMemo(() => {
        const year = month.getFullYear();
        const m = month.getMonth();
        const lastDay = new Date(year, m + 1, 0).getDate();
        const monthDays = Array.from({ length: lastDay }, (_, i) => new Date(year, m, i + 1));

        const holidayDates = new Set(holidays.map(h => h.date));
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

        let workingDaysInMonth = 0;
        let totalHoursWorked = 0;
        
        const calendarData = monthDays.map(day => {
            const dateString = day.toISOString().split('T')[0];
            const dayName = dayNames[day.getDay()];
            const record = attendance.find(a => a.date === dateString);
            
            const isHoliday = holidayDates.has(dateString);
            const isWeeklyOff = !settings.workingDays[dayName];
            const isWorkingDay = !isHoliday && !isWeeklyOff;

            if (isWorkingDay) {
                workingDaysInMonth++;
            }
            
            let status: 'Present' | 'Leave' | 'Half Day' | 'Sick Leave' | 'Holiday' | 'Weekly Off' | 'Absent' = 'Absent';
            if (isHoliday) status = 'Holiday';
            else if (isWeeklyOff) status = 'Weekly Off';
            else if (record) status = record.status;
            
            let hoursWorked = '-';
            if (record?.clockIn && record?.clockOut) {
                const durationMs = record.clockOut - record.clockIn;
                const durationHours = durationMs / 3600000;
                totalHoursWorked += durationHours;
                const h = Math.floor(durationHours);
                const m = Math.floor((durationHours * 60) % 60);
                hoursWorked = `${h}h ${m}m`;
            }

            return {
                date: day.toLocaleDateString('en-GB'),
                status,
                clockIn: record?.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                clockOut: record?.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                hoursWorked
            };
        });

        const presentDays = calendarData.filter(d => d.status === 'Present').length;
        const leaveDays = calendarData.filter(d => d.status === 'Leave').length;
        const halfDayLeaves = calendarData.filter(d => d.status === 'Half Day').length;
        const sickLeaves = calendarData.filter(d => d.status === 'Sick Leave').length;
        const absentDays = calendarData.filter(d => d.status === 'Absent').length;
        const holidaysInMonth = calendarData.filter(d => d.status === 'Holiday' || d.status === 'Weekly Off').length;

        const perDaySalary = (staff.salary || 0) / (workingDaysInMonth || 1);
        const unpaidLeaveDays = leaveDays + absentDays;
        const deductions = (unpaidLeaveDays * perDaySalary) + (halfDayLeaves * (perDaySalary / 2));
        
        const stats = {
            workingDaysInMonth, holidaysInMonth, presentDays, leaveDays, halfDayLeaves, sickLeaves, absentDays, totalHoursWorked, deductions
        };

        return { calendarData, stats };
    }, [month, attendance, staff, holidays, settings]);

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        body { font-family: 'Roboto', sans-serif; margin: 0; padding: 20px; color: #000; background: #fff; }
        .payslip-container { width: 100%; max-width: 800px; margin: auto; border: 1px solid #ccc; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
        .header h1 { margin: 0; font-size: 1.8em; }
        .header p { margin: 2px 0 0; font-size: 0.9em; color: #333; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em; margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
        .details-grid div { display: flex; justify-content: space-between; }
        .statement-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.8em; }
        .statement-table th, .statement-table td { text-align: left; padding: 8px 6px; border: 1px solid #ddd; }
        .statement-table th { font-weight: 700; background-color: #f2f2f2; text-align: center;}
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .summary-section { border: 1px solid #eee; padding: 15px; border-radius: 8px; }
        .summary-section h3 { margin: 0 0 10px 0; font-size: 1.1em; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 500;}
        .summary-row.total { font-size: 1.2em; font-weight: 700; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #666; }
        .paid-stamp { color: #2ECC71; border: 3px solid #2ECC71; padding: 5px 10px; font-size: 1.5em; font-weight: bold; transform: rotate(-15deg); display: inline-block; margin-top: 10px; }
    `;

    const netSalaryPayable = (staff.salary || 0) + (payroll?.bonus || 0) - stats.deductions - (payroll?.taxDeduction || 0);

    return (
        <>
            <style>{styles}</style>
            <div className="payslip-container">
                <header className="header">
                    <h1>{businessProfile.businessName}</h1>
                    <p>{businessProfile.phone} | PAN: {businessProfile.pan}</p>
                    <h2 style={{marginTop: '10px', fontSize: '1.2em', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                        Payslip for {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                </header>

                <div className="details-grid">
                    <div><strong>Staff Name:</strong> <span>{staff.name}</span></div>
                    <div><strong>Role:</strong> <span>{staff.role}</span></div>
                    <div><strong>Joining Date:</strong> <span>{staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'N/A'}</span></div>
                    <div><strong>Date Issued:</strong> <span>{new Date().toLocaleDateString()}</span></div>
                    <div><strong>Bank A/C:</strong> <span>{staff.bankAccountNumber || 'N/A'}</span></div>
                    <div><strong>PAN:</strong> <span>{staff.pan || 'N/A'}</span></div>
                </div>
                
                <div className="summary-grid">
                    <div className="summary-section">
                        <h3>Earnings</h3>
                        <div className="summary-row"><span>Basic Salary:</span> <span>{formatCurrency(staff.salary || 0)}</span></div>
                        <div className="summary-row"><span>Bonus:</span> <span>{formatCurrency(payroll?.bonus || 0)}</span></div>
                        <div className="summary-row total" style={{borderTop: '1px solid #ccc', paddingTop: '8px'}}><span>Total Earnings:</span> <span>{formatCurrency((staff.salary || 0) + (payroll?.bonus || 0))}</span></div>
                    </div>
                     <div className="summary-section">
                        <h3>Deductions</h3>
                        <div className="summary-row"><span>Unpaid Leave:</span> <span>- {formatCurrency(stats.deductions)}</span></div>
                        <div className="summary-row"><span>Tax Deduction (TDS):</span> <span>- {formatCurrency(payroll?.taxDeduction || 0)}</span></div>
                        <div className="summary-row total" style={{borderTop: '1px solid #ccc', paddingTop: '8px'}}><span>Total Deductions:</span> <span>- {formatCurrency(stats.deductions + (payroll?.taxDeduction || 0))}</span></div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', background: payroll ? '#f0fff4' : '#fff5f5' }}>
                    <div className="summary-row total">
                        <span>Net Salary Payable:</span>
                        <span>{formatCurrency(netSalaryPayable)}</span>
                    </div>
                     {payroll && <div className="paid-stamp">PAID</div>}
                </div>

                <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '30px'}}>Attendance Summary</h3>
                <div className="details-grid">
                    <div><strong>Working Days:</strong> <span>{stats.workingDaysInMonth}</span></div>
                    <div><strong>Present Days:</strong> <span>{stats.presentDays}</span></div>
                    <div><strong>Absent Days:</strong> <span>{stats.absentDays}</span></div>
                    <div><strong>Unpaid Leave:</strong> <span>{stats.leaveDays}</span></div>
                     <div><strong>Half Days:</strong> <span>{stats.halfDayLeaves}</span></div>
                    <div><strong>Sick Leave (Paid):</strong> <span>{stats.sickLeaves}</span></div>
                    <div><strong>Holidays/Off:</strong> <span>{stats.holidaysInMonth}</span></div>
                    <div><strong>Total Hours:</strong> <span>{stats.totalHoursWorked.toFixed(2)} hrs</span></div>
                </div>
                
                <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '20px'}}>Attendance Log</h3>
                <table className="statement-table">
                    <thead>
                        <tr><th>Date</th><th>Status</th><th>Clock In</th><th>Clock Out</th><th>Hours Worked</th></tr>
                    </thead>
                    <tbody>
                        {calendarData.map(day => (
                            <tr key={day.date}>
                                <td style={{textAlign: 'center'}}>{day.date}</td>
                                <td style={{textAlign: 'center'}}>{day.status}</td>
                                <td style={{textAlign: 'center'}}>{day.clockIn}</td>
                                <td style={{textAlign: 'center'}}>{day.clockOut}</td>
                                <td style={{textAlign: 'center'}}>{day.hoursWorked}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <footer className="footer">
                    <p>This is a computer-generated payslip from OB.</p>
                </footer>
            </div>
        </>
    );
};

export default PrintableStaffStatement;
