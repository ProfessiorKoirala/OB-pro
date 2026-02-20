import React, { useState, useMemo } from 'react';
import { Order, Expense, Payment, Reminder, Creditor, BusinessSettings, Holiday } from '../types';
import AddReminderModal from '../components/AddReminderModal';
import AddHolidayModal from '../components/AddHolidayModal';
import HomeIcon from '../components/icons/HomeIcon';

interface CalendarScreenProps {
    orders: Order[];
    expenses: Expense[];
    payments: Payment[];
    reminders: Reminder[];
    creditors: Creditor[];
    onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
    settings: BusinessSettings;
    holidays: Holiday[];
    onAddHoliday: (holiday: Omit<Holiday, 'id'>) => void;
    onDeleteReminder: (reminderId: string) => void;
    onDeleteHoliday: (holidayId: string) => void;
    onHome?: () => void;
    isDesktop?: boolean;
}

const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ orders, expenses, payments, reminders, holidays, settings, onHome, isDesktop }) => {
    const [currentDate, setCurrentDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(new Date());

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const daysInMonth = useMemo(() => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            days.push(null);
        }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate, firstDayOfMonth, lastDayOfMonth]);

    const eventsByDate = useMemo(() => {
        const events: { [key: string]: string[] } = {};
        reminders.forEach(r => { if (!events[r.date]) events[r.date] = []; events[r.date].push('reminder'); });
        orders.forEach(o => { const d = formatDate(new Date(o.timestamp)); if (!events[d]) events[d] = []; events[d].push('sale'); });
        return events;
    }, [reminders, orders]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className={`bg-white dark:bg-gray-950 min-h-screen transition-colors ${isDesktop ? 'px-8 py-4' : ''}`}>
            <header className={`flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-20 ${isDesktop ? 'mb-8 py-4' : 'px-6 pt-8 pb-4'}`}>
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <h1 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter">OB <span className="text-[9px] bg-black dark:bg-white text-white dark:text-black px-1.5 py-0.5 rounded ml-1">Pro</span></h1>
                        </div>
                        <h1 className="text-lg font-bold text-black dark:text-white leading-none">
                            {isDesktop ? 'Global Operations Calendar' : 'Schedule & Events'}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onHome && !isDesktop && (
                        <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-all">
                            <HomeIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full text-black dark:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></button>
                </div>
            </header>

            <main className={`${isDesktop ? 'max-w-4xl mx-auto' : 'px-6 mt-4'}`}>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Audit Schedule</p>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-extrabold text-black dark:text-white tracking-tight">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
                    <div className="flex items-center gap-3">
                         <div className="flex p-1 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-inner">
                            <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-black dark:hover:text-white">&lt;</button>
                            <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-black dark:hover:text-white">&gt;</button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-95"><svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 text-center text-[13px] font-extrabold text-gray-300 dark:text-gray-600 mb-6 tracking-widest">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-4">
                    {daysInMonth.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} />;
                        const isSelected = formatDate(day) === formatDate(selectedDate);
                        const hasReminders = eventsByDate[formatDate(day)]?.includes('reminder');
                        const hasSales = eventsByDate[formatDate(day)]?.includes('sale');
                        
                        return (
                            <div key={index} onClick={() => setSelectedDate(day)} className="relative flex flex-col items-center justify-center cursor-pointer group">
                                <div className={`w-11 h-11 flex items-center justify-center rounded-full text-lg font-bold transition-all ${isSelected ? 'bg-black dark:bg-white text-white dark:text-black scale-110 shadow-lg' : 'text-black dark:text-gray-400 group-hover:bg-gray-50 dark:group-hover:bg-gray-800'}`}>
                                    {day.getDate()}
                                </div>
                                <div className="absolute -bottom-1.5 flex gap-1">
                                    {hasSales && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_4px_rgba(251,146,60,0.5)]"></div>}
                                    {hasReminders && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.5)]"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <div className={`mt-12 bg-gray-50/50 dark:bg-gray-900/50 rounded-t-[56px] border-t border-gray-100 dark:border-gray-800 min-h-[400px] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.05)] p-10 pb-32 ${isDesktop ? 'max-w-5xl mx-auto' : ''}`}>
                 <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-8"></div>
                 <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">{selectedDate.toLocaleString('default', { weekday: 'long' })}</p>
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-extrabold text-black dark:text-white tracking-tight leading-none italic uppercase">
                        {selectedDate.toLocaleString('default', { month: 'long', day: 'numeric' })}
                    </h2>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-[40px] border border-gray-100 dark:border-gray-700 flex flex-col justify-center shadow-sm">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">REMINDERS</p>
                        <p className="text-4xl font-black text-black dark:text-white italic leading-none">{reminders.filter(r => r.date === formatDate(selectedDate)).length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-[40px] border border-gray-100 dark:border-gray-700 flex flex-col justify-center shadow-sm">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">SALES VOLUME</p>
                        <p className="text-4xl font-black text-black dark:text-white italic leading-none">{orders.filter(o => formatDate(new Date(o.timestamp)) === formatDate(selectedDate)).length}</p>
                    </div>
                 </div>
            </div>
        </div>
    );
};