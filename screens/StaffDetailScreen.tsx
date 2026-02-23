import React, { useState, useMemo } from 'react';
import { Staff, Attendance, Payroll, BusinessProfile, Holiday, BusinessSettings, Roster } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import PaySalaryModal from '../components/staff/PaySalaryModal';
import { printStaffStatement, printJoiningLetter } from '../utils/printUtils';
import { sharePayslipAsText, shareOnWhatsApp } from '../utils/shareUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import ShareIcon from '../components/icons/ShareIcon';

const ArrowLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const MarkLeaveModal: React.FC<{ onConfirm: (type: 'Leave' | 'Half Day' | 'Sick Leave', reason: string) => void; onCancel: () => void; date: string }> = ({ onConfirm, onCancel, date }) => {
    const [type, setType] = useState<'Leave' | 'Half Day' | 'Sick Leave'>('Leave');
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">Mark Leave for {new Date(date + 'T00:00:00').toLocaleDateString()}</h3>
                    <div className="mt-4 space-y-2">
                        <button onClick={() => setType('Leave')} className={`w-full text-left p-3 rounded-lg font-semibold border-2 ${type === 'Leave' ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-100 border-transparent hover:bg-gray-200'}`}>Full Day (Unpaid)</button>
                        <button onClick={() => setType('Half Day')} className={`w-full text-left p-3 rounded-lg font-semibold border-2 ${type === 'Half Day' ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-100 border-transparent hover:bg-gray-200'}`}>Half Day</button>
                        <button onClick={() => setType('Sick Leave')} className={`w-full text-left p-3 rounded-lg font-semibold border-2 ${type === 'Sick Leave' ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-100 border-transparent hover:bg-gray-200'}`}>Sick Leave (Paid)</button>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                        <input type="text" id="reason" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg">Cancel</button>
                        <button onClick={() => onConfirm(type, reason)} className="px-4 py-2 bg-primary text-white font-bold rounded-lg">Save Leave</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface StaffDetailScreenProps {
  staffMember: Staff;
  attendance: Attendance[];
  payrolls: Payroll[];
  onBack: () => void;
  onEditStaff: (staff: Staff) => void;
  onDeleteStaff: (staffId: string) => void;
  onUpdateStatus: (staffId: string, status: Staff['status']) => void;
  onClockInOut: (staffId: string, type: 'in' | 'out') => void;
  onMarkLeave: (staffId: string, date: string, type: Attendance['status'], reason?: string) => void;
  onDeleteAttendance: (attendanceId: string) => void;
  onPaySalary: (payroll: Omit<Payroll, 'id'>) => void;
  rosters: Roster[];
  onAddRoster: (roster: Omit<Roster, 'id'>) => void;
  onDeleteRoster: (rosterId: string) => void;
  businessProfile: BusinessProfile;
  holidays: Holiday[];
  settings: BusinessSettings;
  isDesktop?: boolean;
}

const StaffDetailScreen: React.FC<StaffDetailScreenProps> = (props) => {
    const { staffMember, attendance, payrolls, onBack, onEditStaff, onDeleteStaff, onUpdateStatus, onClockInOut, onMarkLeave, onPaySalary, rosters, onAddRoster, onDeleteRoster, businessProfile, holidays, settings, isDesktop, onDeleteAttendance } = props;
    
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusChangeConfirm, setStatusChangeConfirm] = useState<'mark-former' | 're-activate' | null>(null);
    const [isPayingSalary, setIsPayingSalary] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [leaveModal, setLeaveModal] = useState<{ open: boolean; date: string }>({ open: false, date: '' });
    const [attendanceToDelete, setAttendanceToDelete] = useState<string | null>(null);
    const [isAddingRoster, setIsAddingRoster] = useState(false);
    const [rosterForm, setRosterForm] = useState({ date: new Date().toISOString().split('T')[0], shiftStart: '09:00', shiftEnd: '18:00', notes: '' });

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

    const handleConfirmDelete = () => {
        onDeleteStaff(staffMember.id);
        setIsDeleting(false);
    };
    
    const handleConfirmStatusChange = () => {
        if (statusChangeConfirm) {
            onUpdateStatus(staffMember.id, statusChangeConfirm === 'mark-former' ? 'Former' : 'Active');
            setStatusChangeConfirm(null);
        }
    };

    const handlePaySalaryConfirm = (payrollData: Omit<Payroll, 'id'>) => {
        onPaySalary(payrollData);
        setIsPayingSalary(false);
    };

    const todayString = new Date().toISOString().split('T')[0];
    const todaysAttendance = attendance.find(a => a.staffId === staffMember.id && a.date === todayString);

    const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const { calendarData, monthlyStats, payrollForMonth } = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const days = [];
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            days.push(null);
        }

        const holidayDates = new Set(holidays.map(h => h.date));
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
        const joiningDateObj = staffMember.joiningDate ? new Date(staffMember.joiningDate + 'T00:00:00') : null;

        let workingDaysInMonth = 0;
        let closedDaysInMonth = 0;

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(year, month, i);
            const isBeforeJoining = joiningDateObj && date < joiningDateObj;
            const dateString = date.toISOString().split('T')[0];
            const dayName = dayNames[date.getDay()];
            
            const attendanceRecord = attendance.find(a => a.staffId === staffMember.id && a.date === dateString);
            
            let status: 'Present' | 'Leave' | 'Half Day' | 'Sick Leave' | 'Holiday' | 'Weekly Off' | 'Absent' | 'Future' | 'Not Joined' = 'Future';
            let hoursWorked = '';
            
            const isHoliday = holidayDates.has(dateString);
            const isWeeklyOff = !settings.workingDays[dayName];
            const isWorkingDay = !isHoliday && !isWeeklyOff;

            if (isWorkingDay && !isBeforeJoining) {
                workingDaysInMonth++;
            } else {
                closedDaysInMonth++;
            }
            
            if (isBeforeJoining) {
                status = 'Not Joined';
            } else if (date > new Date()) {
                status = 'Future';
            } else if (isHoliday) {
                status = 'Holiday';
            } else if (isWeeklyOff) {
                status = 'Weekly Off';
            } else if (attendanceRecord) {
                status = attendanceRecord.status;
                if(attendanceRecord.clockIn && attendanceRecord.clockOut) {
                    const durationMs = attendanceRecord.clockOut - attendanceRecord.clockIn;
                    const hours = Math.floor(durationMs / 3600000);
                    const minutes = Math.floor((durationMs % 3600000) / 60000);
                    hoursWorked = `${hours}h ${minutes}m`;
                }
            } else {
                 status = 'Absent';
            }

            days.push({ date, dateString, status, record: attendanceRecord, hoursWorked });
        }

        const presentDays = days.filter(d => d?.status === 'Present').length;
        const leaveDays = days.filter(d => d?.status === 'Leave').length;
        const halfDayLeaves = days.filter(d => d?.status === 'Half Day').length;
        const sickLeaves = days.filter(d => d?.status === 'Sick Leave').length;
        const absentDays = days.filter(d => d?.status === 'Absent').length;
        
        const monthString = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
        const payrollForMonth = payrolls.find(p => p.staffId === staffMember.id && p.month === monthString);
        
        let basePay = 0;
        let overtimePay = 0;
        let deductions = 0;

        if (staffMember.payType === 'Monthly') {
            const perDaySalary = (staffMember.salary || 0) / (workingDaysInMonth || 1);
            const unpaidLeaveDays = leaveDays + absentDays;
            deductions = (unpaidLeaveDays * perDaySalary) + (halfDayLeaves * (perDaySalary / 2));
            basePay = staffMember.salary || 0;
        } else {
            // Hourly Pay
            const totalNormalHours = days.reduce((acc, d) => {
                if (d?.record?.clockIn && d.record.clockOut) {
                    const durationMs = d.record.clockOut - d.record.clockIn;
                    return acc + (durationMs / 3600000);
                }
                return acc;
            }, 0);
            basePay = totalNormalHours * (staffMember.hourlyRate || 0);
            
            // Overtime: hours > 8 in a single day
            overtimePay = days.reduce((acc, d) => {
                if (d?.record?.clockIn && d.record.clockOut) {
                    const durationMs = d.record.clockOut - d.record.clockIn;
                    const hours = durationMs / 3600000;
                    if (hours > 8) {
                        return acc + (hours - 8) * (staffMember.overtimeRate || 0);
                    }
                }
                return acc;
            }, 0);
        }

        const payableSalary = Math.max(0, basePay - deductions + overtimePay);
        const netSalaryPayable = payableSalary + (payrollForMonth?.bonus || 0) - (payrollForMonth?.taxDeduction || 0) - (payrollForMonth?.otherDeductions || 0);

        return { 
            calendarData: days,
            monthlyStats: {
                workingDaysInMonth,
                holidaysInMonth: closedDaysInMonth,
                presentDays,
                leaveDays,
                halfDayLeaves,
                sickLeaves,
                absentDays,
                basePay,
                overtimePay,
                deductions,
                payableSalary,
                netSalaryPayable
            },
            payrollForMonth
        };
    }, [currentMonth, attendance, staffMember, holidays, settings.workingDays, payrolls]);

    const handleSharePayslip = () => {
        const data = {
            staffName: staffMember.name,
            month: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
            baseSalary: staffMember.salary || 0,
            bonus: payrollForMonth?.bonus || 0,
            deductions: monthlyStats.deductions,
            taxDeduction: payrollForMonth?.taxDeduction || 0,
            netPaid: monthlyStats.netSalaryPayable,
            presentDays: monthlyStats.presentDays,
            absentDays: monthlyStats.absentDays,
            leaveDays: monthlyStats.leaveDays,
            halfDays: monthlyStats.halfDayLeaves,
            sickDays: monthlyStats.sickLeaves,
            businessName: businessProfile.businessName,
        };
    
        const payslipText = sharePayslipAsText(data);
        shareOnWhatsApp(payslipText);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-800 border-green-200';
            case 'Leave': case 'Half Day': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Sick Leave': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Holiday': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Weekly Off': return 'bg-gray-100 text-gray-500 border-gray-200';
            case 'Absent': return 'bg-red-100 text-red-800 border-red-200';
            case 'Not Joined': return 'bg-gray-200 text-gray-400 border-gray-300';
            default: return 'bg-white';
        }
    };
    
    return (
        <div className="bg-gray-50 min-h-full">
            {isDeleting && (
                 <ConfirmationModal
                    title="Delete Staff Member"
                    message={`Are you sure you want to delete ${staffMember.name}? This will move them to the recycle bin.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleting(false)}
                    confirmText="Yes, Delete"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            {statusChangeConfirm && (
                 <ConfirmationModal
                    title={statusChangeConfirm === 'mark-former' ? 'Mark as Former Employee?' : 'Re-activate Employee?'}
                    message={statusChangeConfirm === 'mark-former' ? `This will mark ${staffMember.name} as a former employee and disable actions like payroll.` : `This will re-activate ${staffMember.name}.`}
                    onConfirm={handleConfirmStatusChange}
                    onCancel={() => setStatusChangeConfirm(null)}
                    confirmText={statusChangeConfirm === 'mark-former' ? 'Confirm' : 'Re-activate'}
                    confirmButtonClass={statusChangeConfirm === 'mark-former' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                />
            )}
            {isPayingSalary && (
                <PaySalaryModal 
                    staffMember={staffMember}
                    payrolls={payrolls}
                    onClose={() => setIsPayingSalary(false)}
                    onPay={handlePaySalaryConfirm}
                />
            )}
            {leaveModal.open && (
                <MarkLeaveModal 
                    date={leaveModal.date}
                    onCancel={() => setLeaveModal({ open: false, date: '' })}
                    onConfirm={(type, reason) => {
                        onMarkLeave(staffMember.id, leaveModal.date, type, reason);
                        setLeaveModal({ open: false, date: '' });
                    }}
                />
            )}
            {attendanceToDelete && (
                <ConfirmationModal
                    title="Unmark Attendance?"
                    message="Are you sure you want to remove this attendance record? The day will be marked as Absent."
                    onConfirm={() => {
                        onDeleteAttendance(attendanceToDelete);
                        setAttendanceToDelete(null);
                    }}
                    onCancel={() => setAttendanceToDelete(null)}
                    confirmText="Yes, Unmark"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}


             <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 w-full">
                {!isDesktop && (
                    <button onClick={onBack} className="flex items-center space-x-1.5 text-gray-600 hover:text-primary transition-colors p-2 -ml-2 rounded-lg">
                        <ArrowLeftIcon className="h-6 w-6"/>
                        <span className="font-bold text-lg">Back</span>
                    </button>
                )}
                <h1 className="text-xl font-bold text-text-primary text-center flex-grow">Staff Details</h1>
                <div className="w-8 h-8"></div>
            </header>
            
            <main className="p-4 space-y-4 pb-24">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">{staffMember.name}</h2>
                            <p className="text-text-secondary">{staffMember.role}</p>
                            <span className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                               staffMember.status === 'Active' ? 'bg-green-100 text-green-800' : 
                               staffMember.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-gray-200 text-gray-800'
                            }`}>
                                {staffMember.status}
                           </span>
                        </div>
                        {staffMember.status !== 'Former' && (
                            <div className="flex space-x-2">
                               <button onClick={() => onEditStaff(staffMember)} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                               <button onClick={() => setIsDeleting(true)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Pay Type</p>
                            <p className="font-semibold">{staffMember.payType}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">{staffMember.payType === 'Monthly' ? 'Monthly Salary' : 'Hourly Rate'}</p>
                            <p className="font-semibold">{staffMember.payType === 'Monthly' ? formatCurrency(staffMember.salary || 0) : `${formatCurrency(staffMember.hourlyRate || 0)}/hr`}</p>
                        </div>
                        {staffMember.payType === 'Hourly' && (
                            <div>
                                <p className="text-gray-500">Overtime Rate</p>
                                <p className="font-semibold">{formatCurrency(staffMember.overtimeRate || 0)}/hr</p>
                            </div>
                        )}
                        <div><p className="text-gray-500">Joining Date</p><p className="font-semibold">{staffMember.joiningDate ? new Date(staffMember.joiningDate + 'T00:00:00').toLocaleDateString() : 'N/A'}</p></div>
                        <div><p className="text-gray-500">Bank Account</p><p className="font-semibold">{staffMember.bankAccountNumber || 'N/A'}</p></div>
                        <div><p className="text-gray-500">PAN Number</p><p className="font-semibold">{staffMember.pan || 'N/A'}</p></div>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        {staffMember.status === 'Former' ? (
                            <button onClick={() => setStatusChangeConfirm('re-activate')} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg">Re-activate Employee</button>
                        ) : (
                            <button onClick={() => setStatusChangeConfirm('mark-former')} className="w-full bg-red-100 text-red-700 font-bold py-2 rounded-lg">Mark as Former Employee</button>
                        )}
                    </div>
                </div>

                {staffMember.status !== 'Former' && (
                    <>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg text-text-primary mb-3">Today's Actions</h3>
                            <div className="flex space-x-2">
                                <button disabled={todaysAttendance?.clockIn != null} onClick={() => onClockInOut(staffMember.id, 'in')} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">Clock In</button>
                                <button disabled={!todaysAttendance?.clockIn || todaysAttendance?.clockOut != null} onClick={() => onClockInOut(staffMember.id, 'out')} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">Clock Out</button>
                            </div>
                            {todaysAttendance && (
                                <div className="text-xs text-center mt-2 text-gray-500">
                                    {todaysAttendance.clockIn && `In: ${new Date(todaysAttendance.clockIn).toLocaleTimeString()}`}
                                    {todaysAttendance.clockOut && ` | Out: ${new Date(todaysAttendance.clockOut).toLocaleTimeString()}`}
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg text-text-primary mb-3">Monthly Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="bg-gray-50 p-2 rounded-lg text-center"><p className="font-bold text-lg">{monthlyStats.workingDaysInMonth}</p><p className="text-xs text-gray-600">Working Days</p></div>
                                <div className="bg-green-50 p-2 rounded-lg text-center"><p className="font-bold text-lg text-green-700">{monthlyStats.presentDays}</p><p className="text-xs text-green-700">Present</p></div>
                                <div className="bg-red-50 p-2 rounded-lg text-center"><p className="font-bold text-lg text-red-700">{monthlyStats.absentDays}</p><p className="text-xs text-red-700">Absent</p></div>
                                <div className="bg-yellow-50 p-2 rounded-lg text-center"><p className="font-bold text-lg text-yellow-700">{monthlyStats.leaveDays}</p><p className="text-xs text-yellow-700">Leave</p></div>
                                <div className="bg-yellow-50 p-2 rounded-lg text-center"><p className="font-bold text-lg text-yellow-700">{monthlyStats.halfDayLeaves}</p><p className="text-xs text-yellow-700">Half Days</p></div>
                                <div className="bg-orange-50 p-2 rounded-lg text-center"><p className="font-bold text-lg text-orange-700">{monthlyStats.sickLeaves}</p><p className="text-xs text-orange-700">Sick Leave</p></div>
                                <div className="bg-blue-50 p-2 rounded-lg text-center"><p className="font-bold text-lg text-blue-700">{monthlyStats.holidaysInMonth}</p><p className="text-xs text-blue-700">Holidays &amp; Offs</p></div>
                            </div>
                            <div className="mt-4 pt-4 border-t space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Base Pay ({staffMember.payType})</span><span className="font-semibold">{formatCurrency(monthlyStats.basePay)}</span></div>
                                {monthlyStats.overtimePay > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Overtime Pay</span><span className="font-semibold text-green-600">+ {formatCurrency(monthlyStats.overtimePay)}</span></div>}
                                {payrollForMonth?.bonus && <div className="flex justify-between text-sm"><span className="text-green-600">Bonus</span><span className="font-semibold text-green-600">+ {formatCurrency(payrollForMonth.bonus)}</span></div>}
                                {monthlyStats.deductions > 0 && <div className="flex justify-between text-sm"><span className="text-red-600">Deductions (Unpaid Leave)</span><span className="font-semibold text-red-600">- {formatCurrency(monthlyStats.deductions)}</span></div>}
                                {payrollForMonth?.taxDeduction && <div className="flex justify-between text-sm"><span className="text-red-600">Tax Deduction</span><span className="font-semibold text-red-600">- {formatCurrency(payrollForMonth.taxDeduction)}</span></div>}
                                {payrollForMonth?.otherDeductions && <div className="flex justify-between text-sm"><span className="text-red-600">Other Deductions</span><span className="font-semibold text-red-600">- {formatCurrency(payrollForMonth.otherDeductions)}</span></div>}
                                <div className="flex justify-between font-bold text-lg mt-2"><span className="text-primary">Net Payable</span><span className="text-primary">{formatCurrency(monthlyStats.netSalaryPayable)}</span></div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-text-primary">Staff Roster</h3>
                                <button onClick={() => setIsAddingRoster(true)} className="text-primary font-bold text-sm">+ Add Shift</button>
                            </div>
                            {isAddingRoster && (
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Date</label>
                                            <input type="date" value={rosterForm.date} onChange={e => setRosterForm({...rosterForm, date: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Notes</label>
                                            <input type="text" value={rosterForm.notes} onChange={e => setRosterForm({...rosterForm, notes: e.target.value})} placeholder="e.g. Morning Shift" className="w-full p-2 border rounded-md text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase">Start Time</label>
                                            <input type="time" value={rosterForm.shiftStart} onChange={e => setRosterForm({...rosterForm, shiftStart: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase">End Time</label>
                                            <input type="time" value={rosterForm.shiftEnd} onChange={e => setRosterForm({...rosterForm, shiftEnd: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => setIsAddingRoster(false)} className="px-3 py-1 text-gray-600 text-sm">Cancel</button>
                                        <button onClick={() => { onAddRoster({...rosterForm, staffId: staffMember.id}); setIsAddingRoster(false); }} className="px-3 py-1 bg-primary text-white rounded-md text-sm font-bold">Save Shift</button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                {rosters.filter(r => r.staffId === staffMember.id && r.date >= todayString).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 5).map(r => (
                                    <div key={r.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="font-bold text-sm">{new Date(r.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                                            <p className="text-xs text-gray-500">{r.shiftStart} - {r.shiftEnd} {r.notes && `• ${r.notes}`}</p>
                                        </div>
                                        <button onClick={() => onDeleteRoster(r.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-md"><TrashIcon className="h-4 w-4"/></button>
                                    </div>
                                ))}
                                {rosters.filter(r => r.staffId === staffMember.id && r.date >= todayString).length === 0 && (
                                    <p className="text-xs text-center text-gray-400 py-2">No upcoming shifts scheduled.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg text-text-primary mb-3">Documents & Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => printJoiningLetter(staffMember, businessProfile)}
                                    className="w-full flex items-center space-x-3 text-left bg-gray-50 p-3 rounded-lg hover:bg-gray-100"
                                >
                                    <DocumentTextIcon className="h-6 w-6 text-primary"/>
                                    <div>
                                        <p className="font-semibold text-text-primary">Print Joining Letter</p>
                                        <p className="text-xs text-text-secondary">Generate a formal employment offer letter.</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => printStaffStatement(staffMember, currentMonth, attendance.filter(a => a.staffId === staffMember.id), payrollForMonth, businessProfile, holidays, settings)}
                                    className="w-full flex items-center space-x-3 text-left bg-gray-50 p-3 rounded-lg hover:bg-gray-100"
                                >
                                    <PrinterIcon className="h-6 w-6 text-primary"/>
                                    <div>
                                        <p className="font-semibold text-text-primary">Print Payslip</p>
                                        <p className="text-xs text-text-secondary">Print the payslip for the selected month.</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={handleSharePayslip}
                                    className="w-full flex items-center space-x-3 text-left bg-gray-50 p-3 rounded-lg hover:bg-gray-100"
                                >
                                    <ShareIcon className="h-6 w-6 text-primary"/>
                                    <div>
                                        <p className="font-semibold text-text-primary">Share Payslip</p>
                                        <p className="text-xs text-text-secondary">Send payslip summary via WhatsApp.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                                <h2 className="font-bold text-lg text-text-primary">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
                            </div>
                            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarData.map((day, index) => {
                                    if (!day) return <div key={`pad-${index}`} />;
                                    const isPastOrToday = day.date <= new Date() || day.date.toDateString() === new Date().toDateString();
                                    return (
                                        <div key={day.dateString} className={`p-1 rounded-lg border text-center text-xs ${getStatusColor(day.status)} group relative`}>
                                            <div className="font-bold text-sm mb-1">{day.date.getDate()}</div>
                                            <div className="text-[10px] font-semibold min-h-[14px]">
                                                {day.status === 'Present' ? day.hoursWorked || 'IN' : (day.status !== 'Future' ? day.status.replace(' ','') : '')}
                                            </div>
                                            {isPastOrToday && staffMember.status !== 'Former' && (
                                                <div className="mt-1 text-[10px] space-y-1">
                                                    {day.status === 'Absent' && (
                                                        <div className="flex flex-col items-center">
                                                            <button onClick={() => onMarkLeave(staffMember.id, day.dateString, 'Present')} className="font-semibold text-green-600 hover:underline">Present</button>
                                                            <button onClick={() => setLeaveModal({open: true, date: day.dateString})} className="font-semibold text-yellow-600 hover:underline">Leave</button>
                                                        </div>
                                                    )}
                                                    {day.record && !day.record.clockIn && (day.status === 'Present' || day.status === 'Leave' || day.status === 'Half Day' || day.status === 'Sick Leave') && (
                                                        <button onClick={() => setAttendanceToDelete(day.record!.id)} className="font-semibold text-red-600 hover:underline">Unmark</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-bold text-lg text-text-primary mb-3">Payroll History</h3>
                            {payrolls.filter(p => p.staffId === staffMember.id).length > 0 ? (
                                <div className="space-y-2">
                                    {payrolls.filter(p => p.staffId === staffMember.id).sort((a,b) => b.paidOn - a.paidOn).map(p => (
                                        <div key={p.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-md">
                                            <div>
                                                <p className="font-semibold">{new Date(p.month + '-02T00:00:00').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                                <p className="text-xs text-gray-500">Paid on {new Date(p.paidOn).toLocaleDateString()}</p>
                                            </div>
                                            <p className="font-bold text-green-600">{formatCurrency(p.totalAmount)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-center text-gray-500">No payment history found.</p>}
                            <button onClick={() => setIsPayingSalary(true)} className="mt-4 w-full bg-primary text-white font-bold py-2 rounded-lg">Pay Salary</button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default StaffDetailScreen;