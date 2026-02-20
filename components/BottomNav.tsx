
import React from 'react';
import { MainView } from '../types';
import HomeIcon from './icons/HomeIcon';
import SalesIcon from './icons/SalesIcon';
import ExpenseIcon from './icons/ExpenseIcon';
import BoxIcon from './icons/BoxIcon';

const navItems = [
  { view: MainView.DASHBOARD, label: "Home", Icon: HomeIcon },
  { view: MainView.SALES, label: "Sales", Icon: SalesIcon },
  { view: MainView.EXPENSES, label: "Expenses", Icon: ExpenseIcon },
  { view: MainView.INVENTORY, label: "Inventory", Icon: BoxIcon },
];

interface BottomNavProps {
    currentView: MainView;
    setCurrentView: (view: MainView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
    return (
        <div className="fixed bottom-6 left-0 right-0 px-8 z-50 flex justify-center pointer-events-none">
            <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 p-2 flex items-center gap-1 pointer-events-auto max-w-sm w-full transition-colors">
                {navItems.map((item) => {
                    const isActive = currentView === item.view;
                    return (
                        <button
                            key={item.view}
                            onClick={() => setCurrentView(item.view)}
                            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-[24px] transition-all duration-300 ${
                                isActive ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <item.Icon className={`w-6 h-6 ${isActive ? 'text-white dark:text-black' : 'text-gray-400 dark:text-gray-500'}`} />
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
