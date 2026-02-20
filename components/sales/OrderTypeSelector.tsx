import React from 'react';

interface OrderTypeSelectorProps {
    onSelect: (type: 'Takeaway' | 'Table') => void;
}

const TakeawayIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
);

const TableIcon: React.FC<{className?: string}> = ({className}) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 4v16M18 4v16" /></svg>
);

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({ onSelect }) => {
    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">Create New Order</h1>
            <div className="flex-grow grid grid-cols-1 gap-6 content-center">
                <button
                    onClick={() => onSelect('Takeaway')}
                    className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform duration-300"
                >
                    <TakeawayIcon className="h-16 w-16 text-primary mx-auto mb-4" />
                    <span className="text-xl font-bold text-text-primary">Takeaway</span>
                    <p className="text-sm text-text-secondary mt-1">For orders to-go</p>
                </button>
                <button
                    onClick={() => onSelect('Table')}
                    className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform duration-300"
                >
                    <TableIcon className="h-16 w-16 text-secondary mx-auto mb-4" />
                    <span className="text-xl font-bold text-text-primary">Dine-In / Tables</span>
                     <p className="text-sm text-text-secondary mt-1">For dine-in customers</p>
                </button>
            </div>
        </div>
    );
};

export default OrderTypeSelector;
