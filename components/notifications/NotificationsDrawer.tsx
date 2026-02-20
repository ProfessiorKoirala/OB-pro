import React from 'react';
import { Notification } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import CheckAllIcon from '../icons/CheckAllIcon';
import TrashIcon from '../icons/TrashIcon';
import SalesIcon from '../icons/SalesIcon';
import ExpenseIcon from '../icons/ExpenseIcon';
import InventoryIcon from '../icons/InventoryIcon';
import UsersIcon from '../icons/UsersIcon';
import SparklesIcon from '../icons/SparklesIcon';
import ShieldIcon from '../icons/ShieldIcon';
import BellIcon from '../icons/BellIcon';


interface NotificationsDrawerProps {
    isOpen: boolean;
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
}

const getNotificationIcon = (icon: Notification['icon']) => {
    const className = "h-5 w-5";
    switch (icon) {
        case 'sale':
        case 'fun':
            return <SalesIcon className={`${className} text-green-500`} />;
        case 'expense': return <ExpenseIcon className={`${className} text-red-500`} />;
        case 'inventory': return <InventoryIcon className={`${className} text-blue-500`} />;
        case 'customer': return <UsersIcon className={`${className} text-purple-500`} />;
        case 'system': return <ShieldIcon className={`${className} text-gray-500`} />;
        default: return <BellIcon className={`${className} text-gray-500`} />;
    }
};

const groupNotifications = (notifications: Notification[]) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    // Set to the beginning of the day
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    weekStart.setHours(0,0,0,0);
    const weekStartTime = weekStart.getTime();

    const groups = {
        today: [] as Notification[],
        thisWeek: [] as Notification[],
        older: [] as Notification[],
    };

    notifications.forEach(notif => {
        if (notif.timestamp >= todayStart) {
            groups.today.push(notif);
        } else if (notif.timestamp >= weekStartTime) {
            groups.thisWeek.push(notif);
        } else {
            groups.older.push(notif);
        }
    });

    return groups;
};


const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, notifications, onClose, onMarkAsRead, onMarkAllAsRead, onClearAll }) => {
    const grouped = groupNotifications(notifications);

    const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
        <button 
            onClick={() => !notification.read && onMarkAsRead(notification.id)}
            className={`w-full text-left p-3 flex items-start space-x-3 rounded-lg transition-colors ${notification.read ? 'bg-white' : 'bg-primary/5 hover:bg-primary/10'}`}
        >
            <div className="mt-1">{getNotificationIcon(notification.icon)}</div>
            <div className="flex-1">
                <p className="text-sm text-text-primary">{notification.text}</p>
                <p className="text-xs text-text-secondary mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
            </div>
            {!notification.read && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 shrink-0 animate-pulse"></div>}
        </button>
    );
    
    const NotificationGroup: React.FC<{ title: string; items: Notification[] }> = ({ title, items }) => (
        items.length > 0 ? (
            <div>
                <h3 className="text-sm font-bold text-text-secondary px-3 py-2">{title}</h3>
                <div className="space-y-1">
                    {items.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
            </div>
        ) : null
    );

    return (
        <div className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? '' : 'pointer-events-none'}`}>
            <div className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
            
            <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-gray-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <header className="p-4 border-b flex justify-between items-center shrink-0 bg-white">
                    <h2 className="text-xl font-bold text-text-primary">Notifications</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><CloseIcon className="h-6 w-6" /></button>
                </header>
                
                <div className="p-2 border-b flex justify-between items-center shrink-0 bg-white">
                    <button onClick={onMarkAllAsRead} className="flex items-center space-x-1.5 text-sm text-primary font-semibold p-2 rounded-lg hover:bg-primary/10">
                        <CheckAllIcon className="h-5 w-5" />
                        <span>Mark All as Read</span>
                    </button>
                     <button onClick={onClearAll} className="flex items-center space-x-1.5 text-sm text-red-600 font-semibold p-2 rounded-lg hover:bg-red-50">
                        <TrashIcon className="h-5 w-5" />
                        <span>Clear All</span>
                    </button>
                </div>
                
                <main className="flex-grow overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                         <div className="text-center py-16 text-text-secondary">
                            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Notifications</h3>
                            <p className="mt-1 text-sm text-gray-500">Important updates will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <NotificationGroup title="Today" items={grouped.today} />
                            <NotificationGroup title="This Week" items={grouped.thisWeek} />
                            <NotificationGroup title="Older" items={grouped.older} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default NotificationsDrawer;
